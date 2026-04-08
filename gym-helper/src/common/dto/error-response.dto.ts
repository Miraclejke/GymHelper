import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Error message or validation error list.',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: '/api/workouts/2026-04-08' })
  path!: string;

  @ApiProperty({ example: '2026-04-08T12:00:00.000Z' })
  timestamp!: string;
}
