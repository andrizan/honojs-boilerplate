export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const buildPaginationMeta = ({
  total,
  page,
  limit,
}: {
  total: number;
  page: number;
  limit: number;
}): PaginationMeta => {
  const safeLimit = Math.max(1, Number.isFinite(limit) ? limit : 10);
  const safePage = Math.max(1, Number.isFinite(page) ? page : 1);

  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
};

export type PaginationParams = {
  page: number;
  limit: number;
};

/**
 * Parse pagination query values for page and limit.
 *
 * Accepts raw input values (string | number | undefined) and returns normalized
 * pagination parameters with sensible defaults and an enforced maximum limit.
 *
 * Rules:
 * - Inputs are converted to strings and parsed as base-10 integers.
 * - If parsing fails, yields non-finite numbers, or results in values <= 0,
 *   the corresponding default is used.
 * - The returned `limit` is clamped to `maxLimit`.
 *
 * @param pageRaw - Raw page value (query or input). If missing or invalid, `defaultPage` is used.
 * @param limitRaw - Raw limit value (query or input). If missing or invalid, `defaultLimit` is used.
 * @param options - Optional settings:
 *   - `defaultPage` (default: 1) — fallback page when `pageRaw` is invalid.
 *   - `defaultLimit` (default: 10) — fallback limit when `limitRaw` is invalid.
 *   - `maxLimit` (default: 100) — maximum allowed limit; the returned `limit` is the minimum of parsed/default and this value.
 * @returns An object containing:
 *   - `page` — a positive integer page number (>= 1).
 *   - `limit` — a positive integer limit clamped to `maxLimit`.
 */
export const parsePaginationQuery = (
  pageRaw: string | number | undefined,
  limitRaw: string | number | undefined,
  options: {
    defaultPage?: number;
    defaultLimit?: number;
    maxLimit?: number;
  } = {},
): PaginationParams => {
  const { defaultPage = 1, defaultLimit = 10, maxLimit = 100 } = options;

  const parsedPage = Number.parseInt(String(pageRaw ?? defaultPage), 10);
  const parsedLimit = Number.parseInt(String(limitRaw ?? defaultLimit), 10);

  const page =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : defaultPage;
  const limitBase =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : defaultLimit;
  const limit = Math.min(limitBase, maxLimit);

  return { page, limit };
};

/**
 * Calculates the zero-based pagination offset from the given page and limit.
 *
 * Both `page` and `limit` are clamped to a minimum of 1 using `Math.max(1, ...)` to prevent non-positive values.
 * The offset is computed as `(safePage - 1) * safeLimit`.
 *
 * @param params - Pagination parameters.
 * @param params.page - 1-based page number; values less than 1 are treated as 1.
 * @param params.limit - Number of items per page; values less than 1 are treated as 1.
 * @returns The number of items to skip (zero-based offset) for the specified page and limit.
 */
export const calculatePaginationOffset = ({ page, limit }: PaginationParams): number => {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  return (safePage - 1) * safeLimit;
};


/**
 * Creates a paginated response object containing the provided data and corresponding pagination metadata.
 *
 * @typeParam T - The item type contained in the data array.
 * @param data - Array of items for the current page.
 * @param total - Total number of items across all pages.
 * @param page - Current page number (1-based).
 * @param limit - Number of items per page.
 * @returns An object with `data: T[]` and `pagination: PaginationMeta`.
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): { data: T[]; pagination: PaginationMeta } => ({
  data,
  pagination: buildPaginationMeta({ total, page, limit }),
});
