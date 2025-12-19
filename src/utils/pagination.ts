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

export const getOffset = ({ page, limit }: PaginationParams): number => {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  return (safePage - 1) * safeLimit;
};

export const paginate = <T>(
  data: T,
  total: number,
  page: number,
  limit: number,
): { data: T; pagination: PaginationMeta } => ({
  data,
  pagination: buildPaginationMeta({ total, page, limit }),
});
