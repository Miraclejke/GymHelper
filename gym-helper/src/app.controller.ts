import { Controller, Get, Res } from '@nestjs/common';
import { existsSync } from 'fs';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get([
    '',
    'login',
    'register',
    'plan',
    'workout',
    'workout/:date',
    'nutrition',
    'nutrition/:date',
    'rest',
    'rest/:date',
    '404',
  ])
  serveSpa(@Res() res: Response) {
    const indexPath = join(__dirname, '..', 'public', 'index.html');

    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return res.type('html').send(`<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GymHelper</title>
  </head>
  <body>
    <main>
      <h1>GymHelper backend</h1>
      <p>Frontend еще не собран в public/.</p>
    </main>
  </body>
</html>`);
  }
}
