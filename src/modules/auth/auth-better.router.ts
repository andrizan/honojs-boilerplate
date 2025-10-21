import { Hono } from "hono";
import { auth } from "../../libs/auth.js";

const authRouter = new Hono();

// Pure Better Auth - handles everything
authRouter.on(["POST", "GET"], "/**", (c) => {
	return auth.handler(c.req.raw);
});

export default authRouter;
