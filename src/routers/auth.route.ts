import { Hono } from "hono";
import {
	getRefreshToken,
	googleAuthCallback,
	googleAuthUrl,
	logout,
	signin,
	signup,
} from "../handler/auth.handler.js";
import { jwtMiddleware } from "../middlewares/jwt.js";

const routes = new Hono();

routes.get("/google/login", googleAuthUrl);
routes.get("/google/callback", googleAuthCallback);
routes.post("/refresh-token", getRefreshToken);
routes.post("/logout", jwtMiddleware, logout);
routes.post("/signup", signup);
routes.post("/signin", signin);

export default routes;
