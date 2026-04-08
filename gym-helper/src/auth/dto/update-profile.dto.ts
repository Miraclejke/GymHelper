import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Mihail' })
  @IsString()
  @IsNotEmpty()
  name = '';
}
