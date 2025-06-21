import { Hono } from "hono";
import { GetUserProfile } from "../handler/user.handler.js";
import { jwtMiddleware } from "../middlewares/jwt.js";

const routes = new Hono();

routes.get("/", jwtMiddleware, GetUserProfile);

export default routes;
