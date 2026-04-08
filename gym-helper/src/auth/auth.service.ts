import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import {
  createHash,
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { AuthUserResponse } from '../common/api.types';
import { PrismaService } from '../prisma/prisma.service';

const scrypt = promisify(nodeScrypt);
const PASSWORD_HASH_PREFIX = 'scrypt';
const PASSWORD_KEY_LENGTH = 64;

type PasswordVerificationResult = {
  isValid: boolean;
  needsUpgrade: boolean;
};

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
      where: { email: this.normalizeEmail(email) },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const verification = await this.verifyPassword(
      password.trim(),
      user.passwordHash,
    );

    if (!verification.isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (verification.needsUpgrade) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await this.hashPassword(password.trim()),
        },
      });
    }

    return user;
  }

  async register(name: string, email: string, password: string) {
    this.ensureValue(name, 'Name');
    this.ensureValue(email, 'Email');
    this.ensureValue(password, 'Password');

    this.ensurePasswordLength(password);

    const normalizedEmail = this.normalizeEmail(email);
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    return this.prisma.user.create({
      data: {
        name: this.normalizeName(name),
        email: normalizedEmail,
        passwordHash: await this.hashPassword(password.trim()),
        role: UserRole.USER,
      },
    });
  }

  async updateProfile(userId: string, name: string) {
    this.ensureValue(name, 'Name');

    const user = await this.requireCurrentUser(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: this.normalizeName(name),
      },
    });

    return this.toAuthUser(updatedUser);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    this.ensureValue(currentPassword, 'Current password');
    this.ensureValue(newPassword, 'New password');
    this.ensurePasswordLength(newPassword);

    const user = await this.requireCurrentUser(userId);
    const verification = await this.verifyPassword(
      currentPassword.trim(),
      user.passwordHash,
    );

    if (!verification.isValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    if (currentPassword.trim() === newPassword.trim()) {
      throw new BadRequestException(
        'New password must be different from the current password.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.hashPassword(newPassword.trim()),
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

  private ensurePasswordLength(value: string) {
    if (value.trim().length < 4) {
      throw new BadRequestException(
        'Password must be at least 4 characters long.',
      );
    }
  }

  private normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  private normalizeName(value: string) {
    return value.trim();
  }

  private async requireCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('You need to log in.');
    }

    return user;
  }

  private async hashPassword(value: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(
      value,
      salt,
      PASSWORD_KEY_LENGTH,
    )) as Buffer;

    return `${PASSWORD_HASH_PREFIX}$${salt}$${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(
    value: string,
    storedHash: string,
  ): Promise<PasswordVerificationResult> {
    if (!this.isScryptHash(storedHash)) {
      return {
        isValid: storedHash === this.hashLegacyPassword(value),
        needsUpgrade: true,
      };
    }

    const [prefix, salt, expectedKey] = storedHash.split('$');
    if (!prefix || !salt || !expectedKey) {
      return { isValid: false, needsUpgrade: false };
    }

    const expectedBuffer = Buffer.from(expectedKey, 'hex');
    const derivedKey = (await scrypt(
      value,
      salt,
      expectedBuffer.length,
    )) as Buffer;

    if (expectedBuffer.length !== derivedKey.length) {
      return { isValid: false, needsUpgrade: false };
    }

    return {
      isValid: timingSafeEqual(expectedBuffer, derivedKey),
      needsUpgrade: false,
    };
  }

  private isScryptHash(value: string) {
    return value.startsWith(`${PASSWORD_HASH_PREFIX}$`);
  }

  private hashLegacyPassword(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
