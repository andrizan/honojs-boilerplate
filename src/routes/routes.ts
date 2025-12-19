import { Hono } from "hono";
import user from "@/modules/user/user.routes";
import blog from "@/modules/blog/blog.routes";
import { betterAuthMiddleware } from "@/middlewares/better-auth.middleware";
import { checkRedisConnection } from "@/libs/redis";
import { checkDbConnection } from "@/libs/postgres";
import { checkS3Connection } from "@/libs/s3";
import { checkBullMqConnection } from "@/libs/queue";
import { sendSuccess } from "@/helpers/response";

const routes = new Hono();
routes.get("/healthz",betterAuthMiddleware, async (c) => {
  const [redis, postgres, s3, bullmq] = await Promise.all([
    checkRedisConnection(),
    checkDbConnection(),
    checkS3Connection(),
    checkBullMqConnection(),
  ]);

  const checks = { redis, postgres, s3, bullmq } as const;
  const allHealthy = Object.values(checks).every(
    (check) => check.status === "connected",
  );

  return sendSuccess(
    c,
    {
      status: allHealthy ? "ok" : "degraded",
      checks,
    },
    allHealthy ? 200 : 503,
  );
});

routes.route("/users", user);
routes.route("/blogs", blog);

export default routes;
