import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AuthUserResponse } from '../common/api.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId?: string): Promise<AuthUserResponse | null> {
    if (!userId) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.toAuthUser(user) : null;
  }

  async login(email: string, password: string) {
    this.ensureValue(email, 'Email');
    this.ensureValue(password, 'Password');

    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.passwordHash !== this.hashPassword(password.trim())) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return user;
  }

  async register(name: string, email: string, password: string) {
    this.ensureValue(name, 'Name');
    this.ensureValue(email, 'Email');
    this.ensureValue(password, 'Password');

    if (password.trim().length < 4) {
      throw new BadRequestException(
        'Password must be at least 4 characters long.',
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    return this.prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: this.hashPassword(password.trim()),
        role: UserRole.USER,
      },
    });
  }

  toAuthUser(user: User): AuthUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === UserRole.ADMIN ? 'admin' : 'user',
    };
  }

  private ensureValue(value: string, fieldName: string) {
    if (!value.trim()) {
      throw new BadRequestException(`Field "${fieldName}" is required.`);
    }
  }

  private hashPassword(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
