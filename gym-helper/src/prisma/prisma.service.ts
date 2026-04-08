import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool, type PoolConfig } from 'pg';

const isRenderConnection = (connectionString: string) =>
  connectionString.includes('render.com') || connectionString.includes('dpg-');

const toPoolConfig = (connectionString: string): PoolConfig => {
  if (!isRenderConnection(connectionString)) {
    return { connectionString };
  }

  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');

  return {
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: false,
    },
  };
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const pool = new Pool(
      toPoolConfig(configService.getOrThrow<string>('DATABASE_URL')),
    );
    const adapter = new PrismaPg(pool, {
      disposeExternalPool: true,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
