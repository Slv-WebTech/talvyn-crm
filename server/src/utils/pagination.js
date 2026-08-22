export function parsePagination({ page, limit } = {}) {
  const parsedPage = Math.max(1, Number(page) || 1)
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 20))
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
  }
}
