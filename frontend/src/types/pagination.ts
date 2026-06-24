export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export function normalizePaginated<T>(data: PaginatedResponse<T> | T[]): {
  items: T[];
  total: number;
} {
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  return { items: data.items ?? [], total: data.total ?? data.items?.length ?? 0 };
}
