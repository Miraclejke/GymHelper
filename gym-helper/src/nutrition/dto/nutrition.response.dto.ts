import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class MealEntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  calories?: number;

  @ApiPropertyOptional()
  protein?: number;

  @ApiPropertyOptional()
  fat?: number;

  @ApiPropertyOptional()
  carbs?: number;
}

export class NutritionDayResponseDto {
  @ApiProperty({ example: '2026-04-08' })
  date!: string;

  @ApiProperty({ type: [MealEntryResponseDto] })
  meals!: MealEntryResponseDto[];
}

export class PaginatedNutritionDaysResponseDto extends PaginatedResponseDto {
  @ApiProperty({ type: [NutritionDayResponseDto] })
  items!: NutritionDayResponseDto[];
}
