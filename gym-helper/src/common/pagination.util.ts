import type { Response } from 'express';
import { PaginatedResponse } from './api.types';

export function buildPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function setPaginationHeaders(
  response: Response,
  path: string,
  page: number,
  limit: number,
  total: number,
  totalPages: number,
) {
  response.setHeader('X-Total-Count', total.toString());

  const links: string[] = [];

  if (page > 1) {
    links.push(`<${path}?page=${page - 1}&limit=${limit}>; rel="prev"`);
  }

  if (page < totalPages) {
    links.push(`<${path}?page=${page + 1}&limit=${limit}>; rel="next"`);
  }

  if (links.length > 0) {
    response.setHeader('Link', links.join(', '));
  }
}
