export type PaginatedResponse<T> = {
  items: T[]
  total: number
  pages: number
  limit: number
  offset: number
  page: number
}
