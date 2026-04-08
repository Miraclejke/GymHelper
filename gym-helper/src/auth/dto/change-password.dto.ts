import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'pass1234', minLength: 4 })
  @IsString()
  @MinLength(4)
  currentPassword = '';

  @ApiProperty({ example: 'stronger5678', minLength: 4 })
  @IsString()
  @MinLength(4)
  newPassword = '';
}
