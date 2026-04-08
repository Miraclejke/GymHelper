export function getDashboardSummaryCacheKey(userId: string) {
  return `dashboard:summary:${userId}`;
}
