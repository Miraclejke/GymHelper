import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { AdminService } from './admin.service';
import { AdminUserResponseDto } from './dto/admin-user.response.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('api/admin/users')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('admin')
@ApiTags('admin')
@ApiCookieAuth('session')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({ type: ErrorResponseDto })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List all users for the admin panel.' })
  @ApiOkResponse({ type: AdminUserResponseDto, isArray: true })
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change the role of a user.' })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    example: 'cm123user0001',
  })
  @ApiOkResponse({ type: AdminUserResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }
}
