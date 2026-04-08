import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns the lab1 home view model', () => {
    const result = appController.renderLabHome('guest');

    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('cards');
    expect(Array.isArray(result.cards)).toBe(true);
  });

  it('returns the lab1 exercises view model', () => {
    const result = appController.renderLabExercises('user');

    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('cards');
    expect(Array.isArray(result.cards)).toBe(true);
  });
});
