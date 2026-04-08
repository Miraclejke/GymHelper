import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import { join } from 'path';

export function configureApp(app: NestExpressApplication) {
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
}
