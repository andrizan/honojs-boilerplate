import type { Context } from "hono";
import { UserService } from "@/modules/user/user.service";
import { parsePaginationQuery } from "@/utils/pagination";
import { sendError, sendSuccess } from "@/helpers/response";

const userService = new UserService();

export const getUserProfile = async (c: Context) => {
  try {
    const user = c.get("user");
    const profile = await userService.getProfile(user.email);
    return sendSuccess(c, profile, 200, "User profile fetched successfully");
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Unknown error",
      500,
    );
  }
};

export const getAllUsers = async (c: Context) => {
  try {
    const { page, limit } = parsePaginationQuery(
      c.req.query("page"),
      c.req.query("limit"),
    );

    const result = await userService.getAllUsers(page, limit);
    return sendSuccess(c, result);
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Unknown error",
      500,
    );
  }
};

export const getUserById = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const user = await userService.getUserById(id);
    return sendSuccess(c, user);
  } catch (err) {
    return sendError(c, err instanceof Error ? err.message : "User not found");
  }
};

export const updateUser = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();

    const user = await userService.updateUser(id, data);
    return sendSuccess(c, user, 200, "User updated successfully");
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Unknown error",
      400,
    );
  }
};

export const deleteUser = async (c: Context) => {
  try {
    const id = c.req.param("id");
    await userService.deleteUser(id);
    return sendSuccess(c, null, 200, "User deleted successfully");
  } catch (err) {
    return sendError(c, err instanceof Error ? err.message : "User not found");
  }
};
