import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { AdminUserResponse, UserRoleValue } from '../common/api.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(): Promise<AdminUserResponse[]> {
    const users = await this.prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
    });

    return users.map((user) => this.toAdminUser(user));
  }

  async updateUserRole(
    targetUserId: string,
    role: UserRoleValue,
  ): Promise<AdminUserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const nextRole = role === 'admin' ? UserRole.ADMIN : UserRole.USER;

    if (user.role === nextRole) {
      return this.toAdminUser(user);
    }

    if (user.role === UserRole.ADMIN && nextRole === UserRole.USER) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last administrator.');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: nextRole },
    });

    return this.toAdminUser(updatedUser);
  }

  private toAdminUser(user: User): AdminUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === UserRole.ADMIN ? 'admin' : 'user',
      createdAt: user.createdAt.toISOString(),
    };
  }
}
