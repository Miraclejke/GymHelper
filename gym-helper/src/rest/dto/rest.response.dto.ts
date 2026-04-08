import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class RestDayResponseDto {
  @ApiProperty({ example: '2026-04-08' })
  date!: string;

  @ApiProperty({ example: false })
  isRest!: boolean;

  @ApiPropertyOptional()
  sleepHours?: number;

  @ApiPropertyOptional()
  note?: string;
}

export class PaginatedRestDaysResponseDto extends PaginatedResponseDto {
  @ApiProperty({ type: [RestDayResponseDto] })
  items!: RestDayResponseDto[];
}
