import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PaginatedResponse, RestDayResponse } from '../common/api.types';
import { fromDateOnly, toDateOnly } from '../common/date.util';
import { buildPaginatedResponse } from '../common/pagination.util';
import { getDashboardSummaryCacheKey } from '../dashboard/dashboard.cache';
import { DashboardEventsService } from '../dashboard/dashboard-events.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly dashboardEvents: DashboardEventsService,
  ) {}

  async list(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<RestDayResponse>> {
    const skip = (page - 1) * limit;
    const [total, days] = await Promise.all([
      this.prisma.restDay.count({
        where: { userId },
      }),
      this.prisma.restDay.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return buildPaginatedResponse(
      days.map((day) => this.mapRestDay(day)),
      page,
      limit,
      total,
    );
  }

  async getDay(userId: string, date: string): Promise<RestDayResponse | null> {
    const day = await this.prisma.restDay.findUnique({
      where: {
        userId_date: {
          userId,
          date: toDateOnly(date),
        },
      },
    });

    return day ? this.mapRestDay(day) : null;
  }

  async saveDay(
    userId: string,
    date: string,
    restDay: { isRest?: boolean; sleepHours?: number; note?: string },
  ): Promise<RestDayResponse | null> {
    const normalized = {
      isRest: Boolean(restDay.isRest),
      sleepHours:
        typeof restDay.sleepHours === 'number' &&
        !Number.isNaN(restDay.sleepHours)
          ? Math.max(0, restDay.sleepHours)
          : undefined,
      note: restDay.note?.trim() || undefined,
    };

    const dateOnly = toDateOnly(date);

    if (
      normalized.sleepHours === undefined &&
      normalized.note === undefined &&
      normalized.isRest === false
    ) {
      await this.prisma.restDay.deleteMany({
        where: {
          userId,
          date: dateOnly,
        },
      });
      await this.cacheManager.del(getDashboardSummaryCacheKey(userId));

      this.dashboardEvents.publish(userId, {
        reason: 'rest_deleted',
        message: `Rest data for ${date} was removed.`,
      });

      return null;
    }

    const day = await this.prisma.restDay.upsert({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
      create: {
        userId,
        date: dateOnly,
        isRest: normalized.isRest,
        sleepHours: normalized.sleepHours,
        note: normalized.note,
      },
      update: {
        isRest: normalized.isRest,
        sleepHours: normalized.sleepHours,
        note: normalized.note,
      },
    });
    await this.cacheManager.del(getDashboardSummaryCacheKey(userId));

    this.dashboardEvents.publish(userId, {
      reason: 'rest_saved',
      message: `Rest data for ${date} was updated.`,
    });

    return this.mapRestDay(day);
  }

  private mapRestDay(day: {
    date: Date;
    isRest: boolean;
    sleepHours: number | null;
    note: string | null;
  }): RestDayResponse {
    return {
      date: fromDateOnly(day.date),
      isRest: day.isRest,
      sleepHours: day.sleepHours ?? undefined,
      note: day.note ?? undefined,
    };
  }
}
