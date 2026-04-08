import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ETagInterceptor } from '../common/interceptors/etag.interceptor';
import {
  PlanExerciseResponseDto,
  WeeklyPlanResponseDto,
} from './dto/plan.response.dto';
import { SavePlanDayDto } from './dto/save-plan-day.dto';
import { PlanService } from './plan.service';

@Controller('api/plan')
@UseGuards(SessionAuthGuard)
@ApiTags('plan')
@ApiCookieAuth('session')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get the full weekly workout plan.' })
  @ApiOkResponse({ type: WeeklyPlanResponseDto })
  getWeek(@CurrentUserId() userId: string) {
    return this.planService.getWeek(userId);
  }

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
    return this.planService.getSuggestions();
  }

  @Get(':weekday')
  @ApiOperation({ summary: 'Get the workout plan for a weekday.' })
  @ApiParam({
    name: 'weekday',
    example: 'mon',
    description: 'Weekday key: mon, tue, wed, thu, fri, sat or sun.',
  })
  @ApiOkResponse({ type: PlanExerciseResponseDto, isArray: true })
  getDay(@CurrentUserId() userId: string, @Param('weekday') weekday: string) {
    return this.planService.getDay(userId, weekday);
  }

  @Put(':weekday')
  @ApiOperation({ summary: 'Save the workout plan for a weekday.' })
  @ApiParam({
    name: 'weekday',
    example: 'mon',
    description: 'Weekday key: mon, tue, wed, thu, fri, sat or sun.',
  })
  @ApiOkResponse({ type: PlanExerciseResponseDto, isArray: true })
  saveDay(
    @CurrentUserId() userId: string,
    @Param('weekday') weekday: string,
    @Body() dto: SavePlanDayDto,
  ) {
    return this.planService.saveDay(userId, weekday, dto.exercises ?? []);
  }
}
