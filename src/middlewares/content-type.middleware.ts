import type { Context, Next } from "hono";
import { sendError } from "@/helpers/response";

/**
 * Middleware to validate that incoming requests (except GET, HEAD, OPTIONS)
 * have a valid 'Content-Type' header (application/json or multipart/form-data).
 *
 * If the content type is missing or not supported, responds with HTTP 415.
 *
 * @param c - The request context.
 * @param next - The next middleware function in the stack.
 * @returns A promise that resolves when the middleware is complete.
 */
export const validateContentType = async (c: Context, next: Next) => {
  const method = c.req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }

  const contentType = c.req.header("content-type");
  if (!contentType) {
    return sendError(c, "Content-Type header is required", 415, {
      expected: ["application/json", "multipart/form-data"],
    });
  }

  const isJson = contentType.includes("application/json");
  const isForm = contentType.includes("multipart/form-data");

  if (!isJson && !isForm) {
    return sendError(c, "Unsupported content type", 415, {
      expected: ["application/json", "multipart/form-data"],
    });
  }

  await next();
};
