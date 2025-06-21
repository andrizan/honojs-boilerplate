import { Hono } from "hono";
import {
	getRefreshToken,
	googleAuthCallback,
	googleAuthUrl,
	logout,
} from "../handler/auth.handler.js";

const routes = new Hono();

routes.get("/google/login", googleAuthUrl);
routes.get("/google/callback", googleAuthCallback);
routes.post("/refresh-token", getRefreshToken);
routes.post("/logout", logout);

export default routes;
