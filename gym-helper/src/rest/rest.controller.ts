import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { SaveRestDayDto } from './dto/save-rest-day.dto';
import { RestService } from './rest.service';

@Controller('api/rest')
@UseGuards(SessionAuthGuard)
export class RestController {
  constructor(private readonly restService: RestService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.restService.list(userId);
  }

  @Get(':date')
  getDay(@CurrentUserId() userId: string, @Param('date') date: string) {
    return this.restService.getDay(userId, date);
  }

  @Put(':date')
  saveDay(
    @CurrentUserId() userId: string,
    @Param('date') date: string,
    @Body() dto: SaveRestDayDto,
  ) {
    return this.restService.saveDay(userId, date, dto);
  }
}
