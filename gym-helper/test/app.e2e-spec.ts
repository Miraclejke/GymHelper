import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { SuperAgentTest } from 'supertest';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

describe('GymHelper API (e2e)', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let userEmail = '';
  const userPassword = 'pass1234';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app as NestExpressApplication);
    await app.init();

    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the built frontend shell', async () => {
    const response = await agent.get('/').expect(200);

    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('GymHelper');
  });

  it('requires a session for protected API routes', async () => {
    await agent.get('/api/plan/mon').expect(401);
    await agent.get('/api/dashboard/summary').expect(401);
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

    expect(registerResponse.body).toMatchObject({
      name: 'API Test User',
      email: userEmail,
      role: 'user',
    });

    const meResponse = await agent.get('/api/auth/me').expect(200);
    expect(meResponse.body.email).toBe(userEmail);
  });

  it('saves and loads plan, workout, nutrition and rest data', async () => {
    const today = getTodayIso();

    const planResponse = await agent
      .put('/api/plan/mon')
      .send({
        exercises: [
          { name: 'Bench press', note: '5x5' },
          { name: 'Pull-up', note: '3x8' },
        ],
      })
      .expect(200);

    expect(planResponse.body).toHaveLength(2);

    const loadedPlan = await agent.get('/api/plan/mon').expect(200);
    expect(loadedPlan.body).toHaveLength(2);
    expect(loadedPlan.body[0].name).toBe('Bench press');

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

    expect(workoutResponse.body.date).toBe(today);
    expect(workoutResponse.body.exercises).toHaveLength(1);

    const nutritionResponse = await agent
      .put(`/api/nutrition/${today}`)
      .send({
        meals: [
          { title: 'Oatmeal', calories: 450, protein: 18, fat: 10, carbs: 65 },
          { title: 'Chicken and rice', calories: 700, protein: 50, fat: 15, carbs: 85 },
        ],
      })
      .expect(200);

    expect(nutritionResponse.body.meals).toHaveLength(2);

    const restResponse = await agent
      .put(`/api/rest/${today}`)
      .send({
        date: today,
        isRest: false,
        sleepHours: 8.5,
        note: 'Felt good',
      })
      .expect(200);

    expect(restResponse.body.sleepHours).toBe(8.5);
  });

  it('returns dashboard summary from backend business logic', async () => {
    const response = await agent.get('/api/dashboard/summary').expect(200);

    expect(response.body).toMatchObject({
      workoutDays: 1,
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
