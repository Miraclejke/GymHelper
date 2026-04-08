import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ETagInterceptor } from '../common/interceptors/etag.interceptor';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { setPaginationHeaders } from '../common/pagination.util';
import { SaveWorkoutDayDto } from './dto/save-workout-day.dto';
import {
  PaginatedWorkoutDaysResponseDto,
  WorkoutDayResponseDto,
} from './dto/workout.response.dto';
import { WorkoutService } from './workout.service';

@Controller('api/workouts')
@UseGuards(SessionAuthGuard)
@ApiTags('workouts')
@ApiCookieAuth('session')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get('suggestions')
  @Header('Cache-Control', 'private, max-age=3600')
  @UseInterceptors(ETagInterceptor)
  @ApiOperation({ summary: 'Get default exercise suggestions.' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  getSuggestions() {
    return this.workoutService.getSuggestions();
  }

  @Get()
  @ApiOperation({ summary: 'List workout days with pagination.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ type: PaginatedWorkoutDaysResponseDto })
  async list(
    @CurrentUserId() userId: string,
    @Query() query: PaginationQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.workoutService.list(
      userId,
      query.page,
      query.limit,
    );
    setPaginationHeaders(
      response,
      '/api/workouts',
      result.page,
      result.limit,
      result.total,
      result.totalPages,
    );

    return result;
  }

  @Get(':date')
  @ApiOperation({ summary: 'Get a workout day by date.' })
  @ApiParam({
    name: 'date',
    example: '2026-04-08',
    description: 'Date in YYYY-MM-DD format.',
  })
  @ApiOkResponse({ type: WorkoutDayResponseDto })
  getDay(@CurrentUserId() userId: string, @Param('date') date: string) {
    return this.workoutService.getDay(userId, date);
  }

  @Put(':date')
  @ApiOperation({ summary: 'Create or update a workout day by date.' })
  @ApiParam({
    name: 'date',
    example: '2026-04-08',
    description: 'Date in YYYY-MM-DD format.',
  })
  @ApiOkResponse({ type: WorkoutDayResponseDto })
  saveDay(
    @CurrentUserId() userId: string,
    @Param('date') date: string,
    @Body() dto: SaveWorkoutDayDto,
  ) {
    return this.workoutService.saveDay(userId, date, dto.exercises ?? []);
  }
}
