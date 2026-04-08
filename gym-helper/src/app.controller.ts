import { Controller, Get, Query, Render, Res } from '@nestjs/common';
import { existsSync } from 'fs';
import type { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

const SPA_ROUTES = [
  '',
  'login',
  'register',
  'profile',
  'plan',
  'workout',
  'workout/:date',
  'nutrition',
  'nutrition/:date',
  'rest',
  'rest/:date',
  'admin/users',
  '404',
];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('lab1')
  @Render('lab1-home')
  renderLabHome(@Query('auth') auth?: string) {
    return this.appService.getLabHomeViewModel(auth);
  }

  @Get('lab1/exercises')
  @Render('lab1-exercises')
  renderLabExercises(@Query('auth') auth?: string) {
    return this.appService.getLabExercisesViewModel(auth);
  }

  @Get(SPA_ROUTES)
  serveSpa(@Res() res: Response) {
    const indexPath = join(process.cwd(), 'public', 'index.html');

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
