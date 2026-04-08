import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@gymhelper.local' })
  @IsEmail()
  email = '';

  @ApiProperty({ example: 'admin123', minLength: 4 })
  @IsString()
  @MinLength(4)
  password = '';
}
