import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Mihail' })
  @IsString()
  @IsNotEmpty()
  name = '';

  @ApiProperty({ example: 'mihail@gymhelper.local' })
  @IsEmail()
  email = '';

  @ApiProperty({ example: 'pass1234', minLength: 4 })
  @IsString()
  @MinLength(4)
  password = '';
}
