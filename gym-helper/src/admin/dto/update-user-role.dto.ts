import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['user', 'admin'], example: 'admin' })
  @IsIn(['user', 'admin'])
  role: 'user' | 'admin' = 'user';
}
