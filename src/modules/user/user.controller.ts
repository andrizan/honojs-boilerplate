import type { Context } from "hono";
import * as response from "../../shared/response.js";
import { UserService } from "./user.service.js";

const userService = new UserService();

export const getUserProfile = async (c: Context) => {
	try {
		const user = c.get("user");
		const profile = await userService.getProfile(user.email);
		return response.success(c, profile);
	} catch (err) {
		return response.error(
			c,
			err instanceof Error ? err.message : "Unknown error",
			500,
		);
	}
};

export const getAllUsers = async (c: Context) => {
	try {
		const page = Number.parseInt(c.req.query("page") || "1");
		const limit = Number.parseInt(c.req.query("limit") || "10");

		const result = await userService.getAllUsers(page, limit);
		return response.success(c, result);
	} catch (err) {
		return response.error(
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
		return response.success(c, user);
	} catch (err) {
		return response.notFound(
			c,
			err instanceof Error ? err.message : "User not found",
		);
	}
};

export const updateUser = async (c: Context) => {
	try {
		const id = c.req.param("id");
		const data = await c.req.json();

		const user = await userService.updateUser(id, data);
		return response.success(c, user, "User updated successfully");
	} catch (err) {
		return response.error(
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
		return response.success(c, null, "User deleted successfully");
	} catch (err) {
		return response.notFound(
			c,
			err instanceof Error ? err.message : "User not found",
		);
	}
};
