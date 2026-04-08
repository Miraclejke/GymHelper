import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { SaveNutritionDayDto } from './dto/save-nutrition-day.dto';
import { NutritionService } from './nutrition.service';

@Controller('api/nutrition')
@UseGuards(SessionAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.nutritionService.list(userId);
  }

  @Get(':date')
  getDay(@CurrentUserId() userId: string, @Param('date') date: string) {
    return this.nutritionService.getDay(userId, date);
  }

  @Put(':date')
  saveDay(
    @CurrentUserId() userId: string,
    @Param('date') date: string,
    @Body() dto: SaveNutritionDayDto,
  ) {
    return this.nutritionService.saveDay(userId, date, dto.meals ?? []);
  }
}
