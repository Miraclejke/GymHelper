import { UserRole } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { Response as SupertestResponse, SuperAgentTest } from 'supertest';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import type {
  AdminUserResponse,
  AuthUserResponse,
  DashboardSummaryResponse,
  NutritionDayResponse,
  PaginatedResponse,
  PlanExerciseResponse,
  RestDayResponse,
  WeeklyPlanResponse,
  WorkoutDayResponse,
} from './../src/common/api.types';
import { PrismaService } from './../src/prisma/prisma.service';

type ErrorResponse = {
  statusCode: number;
  error: string;
  message?: string | string[];
};

type SwaggerDocument = {
  info: {
    title: string;
  };
  paths: Record<string, unknown>;
};

type GraphqlResponse<TData> = {
  data: TData;
  errors?: Array<{
    message: string;
  }>;
};

type SavePlanMutation = {
  savePlanDay: PlanExerciseResponse[];
};

type SaveWorkoutMutation = {
  saveWorkoutDay: WorkoutDayResponse;
};

type GraphqlStateQuery = {
  me: AuthUserResponse;
  weeklyPlan: WeeklyPlanResponse;
  planDay: PlanExerciseResponse[];
  workoutDay: WorkoutDayResponse;
  workouts: PaginatedResponse<WorkoutDayResponse>;
  dashboardSummary: DashboardSummaryResponse;
};

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getIsoDateOffset(offset: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function getBody<T>(response: SupertestResponse) {
  return response.body as T;
}

function expectNoGraphqlErrors<TData>(
  response: SupertestResponse,
): GraphqlResponse<TData> {
  const body = getBody<GraphqlResponse<TData>>(response);
  expect(body.errors).toBeUndefined();
  return body;
}

describe('GymHelper API (e2e)', () => {
  let app: NestExpressApplication;
  let agent: SuperAgentTest;
  let adminCandidateAgent: SuperAgentTest;
  let prisma: PrismaService;
  let userEmail = '';
  let userPassword = 'pass1234';
  let adminEmail = '';
  let adminUserId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    const httpServer = app.getHttpServer() as Parameters<
      typeof request.agent
    >[0];
    agent = request.agent(httpServer);
    adminCandidateAgent = request.agent(httpServer);
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the built frontend shell', async () => {
    const response = await agent.get('/').expect(200);

    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('GymHelper');
  });

  it('serves direct SPA routes through the frontend shell', async () => {
    for (const route of ['/profile', '/admin/users']) {
      const response = await agent.get(route).expect(200);

      expect(response.headers['content-type']).toMatch(/html/);
      expect(response.text).toContain('GymHelper');
    }
  });

  it('renders lab1 pages with server and client elapsed time markers', async () => {
    const response = await agent.get('/lab1').expect(200);

    expect(response.text).toContain('Server:');
    expect(response.text).toContain('data-client-elapsed');
  });

  it('requires a session for protected API routes', async () => {
    await agent.get('/api/plan/mon').expect(401);
    await agent.get('/api/dashboard/summary').expect(401);
  });

  it('serves swagger docs for the API', async () => {
    const docsResponse = await agent.get('/api/docs').expect(200);
    expect(docsResponse.text).toContain('swagger-ui');

    const jsonResponse = await agent.get('/api/docs-json').expect(200);
    const swaggerDocument = getBody<SwaggerDocument>(jsonResponse);

    expect(swaggerDocument.info.title).toBe('GymHelper API');
    expect(swaggerDocument.paths['/api/workouts']).toBeDefined();
    expect(swaggerDocument.paths['/api/admin/users']).toBeDefined();
  });

  it('validates request payloads', async () => {
    const response = await agent
      .post('/api/auth/register')
      .send({
        name: '',
        email: 'not-an-email',
        password: '123',
      })
      .expect(400);

    const body = getBody<ErrorResponse>(response);

    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    expect(Array.isArray(body.message)).toBe(true);
  });

  it('registers a user and restores the session', async () => {
    userEmail = `user-${randomUUID()}@gymhelper.local`;

    const registerResponse = await agent
      .post('/api/auth/register')
      .send({
        name: 'API Test User',
        email: userEmail,
        password: userPassword,
      })
      .expect(201);

    const registerBody = getBody<AuthUserResponse>(registerResponse);

    expect(registerBody).toMatchObject({
      name: 'API Test User',
      email: userEmail,
      role: 'user',
    });

    const meResponse = await agent.get('/api/auth/me').expect(200);
    const meBody = getBody<AuthUserResponse>(meResponse);

    expect(meBody.email).toBe(userEmail);
  });

  it('updates the current user profile', async () => {
    const response = await agent
      .patch('/api/auth/profile')
      .send({
        name: 'Updated API User',
      })
      .expect(200);

    const body = getBody<AuthUserResponse>(response);

    expect(body).toMatchObject({
      email: userEmail,
      name: 'Updated API User',
      role: 'user',
    });

    const meResponse = await agent.get('/api/auth/me').expect(200);
    const meBody = getBody<AuthUserResponse>(meResponse);

    expect(meBody.name).toBe('Updated API User');
  });

  it('changes the current user password and invalidates the old one', async () => {
    const nextPassword = 'pass5678';

    await agent
      .patch('/api/auth/password')
      .send({
        currentPassword: userPassword,
        newPassword: nextPassword,
      })
      .expect(204);

    await agent.post('/api/auth/logout').expect(204);

    await agent
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      })
      .expect(401);

    userPassword = nextPassword;

    const loginResponse = await agent
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      })
      .expect(200);

    const loginBody = getBody<AuthUserResponse>(loginResponse);

    expect(loginBody).toMatchObject({
      email: userEmail,
      role: 'user',
    });
  });

  it('forbids a regular user from admin routes', async () => {
    await agent.get('/api/admin/users').expect(403);
  });

  it('allows an admin to list users and change roles', async () => {
    adminEmail = `admin-${randomUUID()}@gymhelper.local`;

    const registerResponse = await adminCandidateAgent
      .post('/api/auth/register')
      .send({
        name: 'Admin Candidate',
        email: adminEmail,
        password: 'admin5678',
      })
      .expect(201);

    const registerBody = getBody<AuthUserResponse>(registerResponse);
    adminUserId = registerBody.id;

    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: UserRole.ADMIN },
    });

    const listResponse = await adminCandidateAgent
      .get('/api/admin/users')
      .expect(200);
    const listBody = getBody<AdminUserResponse[]>(listResponse);

    expect(Array.isArray(listBody)).toBe(true);
    expect(listBody.some((entry) => entry.email === userEmail)).toBe(true);

    const updateResponse = await adminCandidateAgent
      .patch(`/api/admin/users/${registerBody.id}/role`)
      .send({
        role: 'user',
      })
      .expect(200);

    const updateBody = getBody<AdminUserResponse>(updateResponse);

    expect(updateBody).toMatchObject({
      id: registerBody.id,
      email: adminEmail,
      role: 'user',
    });

    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: UserRole.ADMIN },
    });

    const secondListResponse = await adminCandidateAgent
      .get('/api/admin/users')
      .expect(200);
    const secondListBody = getBody<AdminUserResponse[]>(secondListResponse);

    expect(
      secondListBody.some(
        (entry) => entry.email === adminEmail && entry.role === 'admin',
      ),
    ).toBe(true);
  });

  it('returns timing and HTTP cache headers for suggestion endpoints', async () => {
    const firstResponse = await agent.get('/api/plan/suggestions').expect(200);
    const suggestions = getBody<string[]>(firstResponse);

    expect(firstResponse.headers['cache-control']).toBe(
      'private, max-age=3600',
    );
    expect(firstResponse.headers['etag']).toMatch(/^".+"$/);
    expect(firstResponse.headers['x-elapsed-time']).toMatch(/^\d+ms$/);
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);

    const notModifiedResponse = await agent
      .get('/api/plan/suggestions')
      .set('If-None-Match', firstResponse.headers['etag'])
      .expect(304);

    expect(notModifiedResponse.text).toBe('');
    expect(notModifiedResponse.headers['etag']).toBe(
      firstResponse.headers['etag'],
    );
  });

  it('serves GraphiQL and executes GraphQL operations with the current session', async () => {
    const today = getTodayIso();

    const graphiqlResponse = await agent
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);

    expect(graphiqlResponse.text).toMatch(/graphiql/i);

    const savePlanResponse = await agent
      .post('/graphql')
      .send({
        query: `
          mutation SavePlan($weekday: WeekdayKey!, $input: SavePlanDayInput!) {
            savePlanDay(weekday: $weekday, input: $input) {
              name
              note
            }
          }
        `,
        variables: {
          weekday: 'MON',
          input: {
            exercises: [{ name: 'GraphQL Bench', note: '4x8' }],
          },
        },
      })
      .expect(200);

    const savePlanBody =
      expectNoGraphqlErrors<SavePlanMutation>(savePlanResponse);

    expect(savePlanResponse.headers['x-elapsed-time']).toMatch(/^\d+ms$/);
    expect(savePlanBody.data.savePlanDay).toHaveLength(1);
    expect(savePlanBody.data.savePlanDay[0]).toMatchObject({
      name: 'GraphQL Bench',
      note: '4x8',
    });

    const saveWorkoutResponse = await agent
      .post('/graphql')
      .send({
        query: `
          mutation SaveWorkout($date: String!, $input: SaveWorkoutDayInput!) {
            saveWorkoutDay(date: $date, input: $input) {
              date
              exercises {
                name
                sets {
                  weight
                  reps
                }
              }
            }
          }
        `,
        variables: {
          date: today,
          input: {
            exercises: [
              {
                name: 'GraphQL Press',
                sets: [{ weight: 50, reps: 10 }],
              },
            ],
          },
        },
      })
      .expect(200);

    const saveWorkoutBody =
      expectNoGraphqlErrors<SaveWorkoutMutation>(saveWorkoutResponse);

    expect(saveWorkoutBody.data.saveWorkoutDay.date).toBe(today);
    expect(saveWorkoutBody.data.saveWorkoutDay.exercises[0]).toMatchObject({
      name: 'GraphQL Press',
    });
    expect(
      saveWorkoutBody.data.saveWorkoutDay.exercises[0].sets[0],
    ).toMatchObject({
      weight: 50,
      reps: 10,
    });

    const queryResponse = await agent
      .post('/graphql')
      .send({
        query: `
          query GraphqlState($weekday: WeekdayKey!, $date: String!) {
            me {
              email
            }
            weeklyPlan {
              mon {
                name
                note
              }
            }
            planDay(weekday: $weekday) {
              name
            }
            workoutDay(date: $date) {
              exercises {
                name
                sets {
                  reps
                }
              }
            }
            workouts(page: 1, limit: 5) {
              page
              limit
              total
              items {
                date
              }
            }
            dashboardSummary {
              workoutDays
            }
          }
        `,
        variables: {
          weekday: 'MON',
          date: today,
        },
      })
      .expect(200);

    const queryBody = expectNoGraphqlErrors<GraphqlStateQuery>(queryResponse);

    expect(queryResponse.headers['x-elapsed-time']).toMatch(/^\d+ms$/);
    expect(queryBody.data.me.email).toBe(userEmail);
    expect(queryBody.data.weeklyPlan.mon[0]).toMatchObject({
      name: 'GraphQL Bench',
      note: '4x8',
    });
    expect(queryBody.data.planDay[0]).toMatchObject({
      name: 'GraphQL Bench',
    });
    expect(queryBody.data.workoutDay.exercises[0]).toMatchObject({
      name: 'GraphQL Press',
    });
    expect(queryBody.data.workouts).toMatchObject({
      page: 1,
      limit: 5,
      total: 1,
    });
    expect(queryBody.data.dashboardSummary.workoutDays).toBe(1);
  }, 15000);

  it('saves and loads plan, workout, nutrition and rest data', async () => {
    const today = getTodayIso();
    const yesterday = getIsoDateOffset(-1);

    const planResponse = await agent
      .put('/api/plan/mon')
      .send({
        exercises: [
          { name: 'Bench press', note: '5x5' },
          { name: 'Pull-up', note: '3x8' },
        ],
      })
      .expect(200);
    const planBody = getBody<PlanExerciseResponse[]>(planResponse);

    expect(planBody).toHaveLength(2);

    const loadedPlanResponse = await agent.get('/api/plan/mon').expect(200);
    const loadedPlanBody = getBody<PlanExerciseResponse[]>(loadedPlanResponse);

    expect(loadedPlanBody).toHaveLength(2);
    expect(loadedPlanBody[0].name).toBe('Bench press');

    const weeklyPlanResponse = await agent.get('/api/plan').expect(200);
    const weeklyPlanBody = getBody<WeeklyPlanResponse>(weeklyPlanResponse);

    expect(weeklyPlanBody.mon).toHaveLength(2);
    expect(weeklyPlanBody.sun).toHaveLength(0);

    await agent
      .put(`/api/workouts/${today}`)
      .send({
        exercises: [],
        extra: true,
      })
      .expect(400);

    const workoutResponse = await agent
      .put(`/api/workouts/${today}`)
      .send({
        exercises: [
          {
            name: 'Bench press',
            sets: [
              { weight: 60, reps: 8 },
              { weight: 62.5, reps: 6 },
            ],
          },
        ],
      })
      .expect(200);
    const workoutBody = getBody<WorkoutDayResponse>(workoutResponse);

    expect(workoutBody.date).toBe(today);
    expect(workoutBody.exercises).toHaveLength(1);

    const secondWorkoutResponse = await agent
      .put(`/api/workouts/${yesterday}`)
      .send({
        exercises: [
          {
            name: 'Pull-up',
            sets: [{ weight: 0, reps: 10 }],
          },
        ],
      })
      .expect(200);
    const secondWorkoutBody = getBody<WorkoutDayResponse>(
      secondWorkoutResponse,
    );

    expect(secondWorkoutBody.date).toBe(yesterday);

    const nutritionResponse = await agent
      .put(`/api/nutrition/${today}`)
      .send({
        meals: [
          { title: 'Oatmeal', calories: 450, protein: 18, fat: 10, carbs: 65 },
          {
            title: 'Chicken and rice',
            calories: 700,
            protein: 50,
            fat: 15,
            carbs: 85,
          },
        ],
      })
      .expect(200);
    const nutritionBody = getBody<NutritionDayResponse>(nutritionResponse);

    expect(nutritionBody.meals).toHaveLength(2);

    const restResponse = await agent
      .put(`/api/rest/${today}`)
      .send({
        date: today,
        isRest: false,
        sleepHours: 8.5,
        note: 'Felt good',
      })
      .expect(200);
    const restBody = getBody<RestDayResponse>(restResponse);

    expect(restBody.sleepHours).toBe(8.5);
  }, 15000);

  it('returns paginated workout collections with Link headers', async () => {
    const firstPageResponse = await agent
      .get('/api/workouts?page=1&limit=1')
      .expect(200);
    const firstPageBody =
      getBody<PaginatedResponse<WorkoutDayResponse>>(firstPageResponse);

    expect(firstPageBody).toMatchObject({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
    expect(firstPageBody.items).toHaveLength(1);
    expect(firstPageResponse.headers['x-total-count']).toBe('2');
    expect(firstPageResponse.headers['link']).toContain('rel="next"');

    const secondPageResponse = await agent
      .get('/api/workouts?page=2&limit=1')
      .expect(200);
    const secondPageBody =
      getBody<PaginatedResponse<WorkoutDayResponse>>(secondPageResponse);

    expect(secondPageBody.items).toHaveLength(1);
    expect(secondPageResponse.headers['link']).toContain('rel="prev"');
  });

  it('returns dashboard summary from backend business logic', async () => {
    const response = await agent.get('/api/dashboard/summary').expect(200);
    const body = getBody<DashboardSummaryResponse>(response);

    expect(body).toMatchObject({
      workoutDays: 2,
      avgCalories: 1150,
      avgSleep: 8.5,
    });
  });

  it('logs out and clears the session', async () => {
    await agent.post('/api/auth/logout').expect(204);

    const meResponse = await agent.get('/api/auth/me').expect(200);
    expect(meResponse.text === '' || meResponse.text === 'null').toBe(true);
  });
});
