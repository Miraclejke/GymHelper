import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUserId } from './current-user-id.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { AuthService } from './auth.service';
import { AuthUserResponseDto } from './dto/auth-user.response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SessionAuthGuard } from './session-auth.guard';
import { destroyUserSession, establishUserSession } from './session.util';

@Controller('api/auth')
@ApiTags('auth')
@ApiBadRequestResponse({ type: ErrorResponseDto })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user from the session.' })
  @ApiCookieAuth('session')
  @ApiExtraModels(AuthUserResponseDto)
  @ApiOkResponse({
    description:
      'Returns the current user or null when there is no active session.',
    schema: {
      nullable: true,
      allOf: [{ $ref: getSchemaPath(AuthUserResponseDto) }],
    },
  })
  getCurrentUser(@Req() request: Request) {
    return this.authService.getCurrentUser(request.session?.userId);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in and create a session.' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    const user = await this.authService.login(dto.email, dto.password);
    await establishUserSession(request, user.id);

    return this.authService.toAuthUser(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and create a session.' })
  @ApiCreatedResponse({ type: AuthUserResponseDto })
  async register(@Body() dto: RegisterDto, @Req() request: Request) {
    const user = await this.authService.register(
      dto.name,
      dto.email,
      dto.password,
    );
    await establishUserSession(request, user.id);

    return this.authService.toAuthUser(user);
  }

  @Patch('profile')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Update the current user profile.' })
  @ApiCookieAuth('session')
  @ApiOkResponse({ type: AuthUserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  updateProfile(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto.name);
  }

  @Patch('password')
  @HttpCode(204)
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Change the current user password.' })
  @ApiCookieAuth('session')
  @ApiNoContentResponse({ description: 'Password updated successfully.' })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async changePassword(
    @CurrentUserId() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Log out and destroy the current session.' })
  @ApiCookieAuth('session')
  @ApiNoContentResponse({ description: 'Session cleared successfully.' })
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return destroyUserSession(request).then(() => {
      response.clearCookie('gymhelper.sid');
    });
  }
}
