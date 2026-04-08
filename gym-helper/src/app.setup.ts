import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { PlanModule } from './plan/plan.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RestModule } from './rest/rest.module';
import { WorkoutModule } from './workout/workout.module';

export function configureApp(app: NestExpressApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(
    session({
      name: 'gymhelper.sid',
      secret: process.env.SESSION_SECRET ?? 'gym-helper-dev-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: join(process.cwd(), 'views', 'layouts'),
      partialsDir: join(process.cwd(), 'views', 'partials'),
    }),
  );
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');
  app.useStaticAssets(join(process.cwd(), 'public'));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GymHelper API')
    .setDescription('Backend API for the GymHelper project.')
    .setVersion('1.0')
    .addCookieAuth(
      'gymhelper.sid',
      {
        type: 'apiKey',
        in: 'cookie',
      },
      'session',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [
      AuthModule,
      PlanModule,
      WorkoutModule,
      NutritionModule,
      RestModule,
      DashboardModule,
    ],
  });

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    jsonDocumentUrl: 'api/docs-json',
  });
}
