import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { setPaginationHeaders } from '../common/pagination.util';
import { SaveNutritionDayDto } from './dto/save-nutrition-day.dto';
import {
  NutritionDayResponseDto,
  PaginatedNutritionDaysResponseDto,
} from './dto/nutrition.response.dto';
import { NutritionService } from './nutrition.service';

@Controller('api/nutrition')
@UseGuards(SessionAuthGuard)
@ApiTags('nutrition')
@ApiCookieAuth('session')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get()
  @ApiOperation({ summary: 'List nutrition days with pagination.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ type: PaginatedNutritionDaysResponseDto })
  async list(
    @CurrentUserId() userId: string,
    @Query() query: PaginationQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.nutritionService.list(
      userId,
      query.page,
      query.limit,
    );
    setPaginationHeaders(
      response,
      '/api/nutrition',
      result.page,
      result.limit,
      result.total,
      result.totalPages,
    );

    return result;
  }

  @Get(':date')
  @ApiOperation({ summary: 'Get nutrition data by date.' })
  @ApiParam({
    name: 'date',
    example: '2026-04-08',
    description: 'Date in YYYY-MM-DD format.',
  })
  @ApiOkResponse({ type: NutritionDayResponseDto })
  getDay(@CurrentUserId() userId: string, @Param('date') date: string) {
    return this.nutritionService.getDay(userId, date);
  }

  @Put(':date')
  @ApiOperation({ summary: 'Create or update nutrition data by date.' })
  @ApiParam({
    name: 'date',
    example: '2026-04-08',
    description: 'Date in YYYY-MM-DD format.',
  })
  @ApiOkResponse({ type: NutritionDayResponseDto })
  saveDay(
    @CurrentUserId() userId: string,
    @Param('date') date: string,
    @Body() dto: SaveNutritionDayDto,
  ) {
    return this.nutritionService.saveDay(userId, date, dto.meals ?? []);
  }
}
