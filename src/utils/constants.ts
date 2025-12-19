export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 60 * 15, // 15 minutes in seconds
  REFRESH_TOKEN: 60 * 60 * 2, // 2 hours in seconds
} as const;

export const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 30, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 60 * 60 * 24, // 24 hours
} as const;

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const AUTH_PROVIDERS = {
  SYSTEM: "system",
  GOOGLE: "google",
} as const;

export const QUEUE_NAMES = {
  EMAIL: "email",
} as const;
