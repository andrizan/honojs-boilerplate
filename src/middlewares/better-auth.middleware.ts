import type { Context, Next } from "hono";
import { auth } from "@/libs/auth";
import { sendError } from "@/helpers/response";

export const betterAuthMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return sendError(c, "Unauthorized", 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
