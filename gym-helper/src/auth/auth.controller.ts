import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getCurrentUser(@Req() request: Request) {
    return this.authService.getCurrentUser(request.session?.userId);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    const user = await this.authService.login(dto.email, dto.password);
    request.session.userId = user.id;

    return this.authService.toAuthUser(user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() request: Request) {
    const user = await this.authService.register(
      dto.name,
      dto.email,
      dto.password,
    );
    request.session.userId = user.id;

    return this.authService.toAuthUser(user);
  }

  @Post('logout')
  @HttpCode(204)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        response.clearCookie('gymhelper.sid');
        resolve();
      });
    });
  }
}
