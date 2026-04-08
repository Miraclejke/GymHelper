import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { PlanModule } from './plan/plan.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RestModule } from './rest/rest.module';
import { WorkoutModule } from './workout/workout.module';

const EDUCATIONAL_SESSION_SECRET = 'gym-helper-educational-session-secret';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function getAllowedOrigins() {
  const value = process.env.CORS_ORIGIN?.trim();

  if (!value) {
    return true;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : true;
}

function getSessionSecret() {
  return process.env.SESSION_SECRET?.trim() || EDUCATIONAL_SESSION_SECRET;
}

function isSecureCookieEnabled() {
  return process.env.NODE_ENV === 'production';
}

export function configureApp(app: NestExpressApplication) {
  // Render terminates HTTPS on the proxy, so Express must trust it
  // before secure session cookies can be sent back to the browser.
  app.set('trust proxy', 1);

  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });
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
      // MemoryStore is acceptable here because this is an educational project.
      secret: getSessionSecret(),
      proxy: isSecureCookieEnabled(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecureCookieEnabled(),
        maxAge: SESSION_MAX_AGE_MS,
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
      AdminModule,
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
