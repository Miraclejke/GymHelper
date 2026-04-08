import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { PlanModule } from '../plan/plan.module';
import { WorkoutModule } from '../workout/workout.module';
import { AuthResolver } from './auth/auth.resolver';
import { GqlSessionAuthGuard } from './guards/gql-session-auth.guard';
import { DashboardResolver } from './dashboard/dashboard.resolver';
import { PlanResolver } from './plan/plan.resolver';
import { ComplexityPlugin } from './plugins/complexity.plugin';
import { RequestTimingPlugin } from './plugins/request-timing.plugin';
import {
  WorkoutExerciseFieldResolver,
  WorkoutResolver,
  WorkoutDayFieldResolver,
} from './workout/workout.resolver';
import type { GraphqlContext } from './graphql-context.type';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      sortSchema: true,
      playground: false,
      graphiql: true,
      context: ({
        req,
        res,
      }: {
        req: Request;
        res: Response;
      }): GraphqlContext => ({ req, res }),
    }),
    AuthModule,
    PlanModule,
    WorkoutModule,
    DashboardModule,
  ],
  providers: [
    ComplexityPlugin,
    RequestTimingPlugin,
    GqlSessionAuthGuard,
    AuthResolver,
    PlanResolver,
    WorkoutResolver,
    WorkoutDayFieldResolver,
    WorkoutExerciseFieldResolver,
    DashboardResolver,
  ],
})
export class AppGraphqlModule {}
