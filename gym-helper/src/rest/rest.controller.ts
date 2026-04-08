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
import {
  PaginatedRestDaysResponseDto,
  RestDayResponseDto,
} from './dto/rest.response.dto';
import { SaveRestDayDto } from './dto/save-rest-day.dto';
import { RestService } from './rest.service';

@Controller('api/rest')
@UseGuards(SessionAuthGuard)
@ApiTags('rest')
@ApiCookieAuth('session')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
export class RestController {
  constructor(private readonly restService: RestService) {}

  @Get()
  @ApiOperation({ summary: 'List rest days with pagination.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ type: PaginatedRestDaysResponseDto })
  async list(
    @CurrentUserId() userId: string,
    @Query() query: PaginationQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.restService.list(userId, query.page, query.limit);
    setPaginationHeaders(
      response,
      '/api/rest',
      result.page,
      result.limit,
      result.total,
      result.totalPages,
    );

    return result;
  }

  @Get(':date')
  @ApiOperation({ summary: 'Get rest data by date.' })
  @ApiParam({
    name: 'date',
    example: '2026-04-08',
    description: 'Date in YYYY-MM-DD format.',
  })
  @ApiOkResponse({ type: RestDayResponseDto })
  getDay(@CurrentUserId() userId: string, @Param('date') date: string) {
    return this.restService.getDay(userId, date);
  }

  @Put(':date')
  @ApiOperation({ summary: 'Create or update rest data by date.' })
  @ApiParam({
    name: 'date',
    example: '2026-04-08',
    description: 'Date in YYYY-MM-DD format.',
  })
  @ApiOkResponse({ type: RestDayResponseDto })
  saveDay(
    @CurrentUserId() userId: string,
    @Param('date') date: string,
    @Body() dto: SaveRestDayDto,
  ) {
    return this.restService.saveDay(userId, date, dto);
  }
}
