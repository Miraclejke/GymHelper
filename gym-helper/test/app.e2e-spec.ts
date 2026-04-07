import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('GymHelper');
      });
  });

  it('/lab1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/lab1')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('GymHelper внутри Nest-приложения');
        expect(response.text).toContain('Пользователь не авторизован');
      });
  });

  it('/lab1/exercises?auth=user (GET)', () => {
    return request(app.getHttpServer())
      .get('/lab1/exercises?auth=user')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Карточки упражнений');
        expect(response.text).toContain('Вы вошли как Mihail');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
