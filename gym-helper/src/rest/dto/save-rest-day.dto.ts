import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ISO_DATE_PATTERN } from '../../common/date.util';

export class SaveRestDayDto {
  @ApiPropertyOptional({
    example: '2026-04-08',
    description: 'Optional date copy from the frontend draft payload.',
  })
  @IsOptional()
  @Matches(ISO_DATE_PATTERN)
  date?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  isRest = false;

  @ApiPropertyOptional({ example: 8.5, minimum: 0, maximum: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepHours?: number;

  @ApiPropertyOptional({ example: 'Felt good' })
  @IsOptional()
  @IsString()
  note?: string;
}
