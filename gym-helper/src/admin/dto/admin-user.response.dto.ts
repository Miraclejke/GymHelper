import { ApiProperty } from '@nestjs/swagger';

export class AdminUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['user', 'admin'], example: 'user' })
  role!: 'user' | 'admin';

  @ApiProperty({ example: '2026-04-08T12:00:00.000Z' })
  createdAt!: string;
}
