import type { Context } from "hono";
import { randomBytes } from "node:crypto";
import * as response from "../../shared/response.js";
import { UserService } from "./user.service.js";
import { uploadToS3, deleteFromS3, getS3ObjectUrl } from "../../infrastructure/s3.js";

const userService = new UserService();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadAvatar = async (c: Context) => {
	try {
		const user = c.get("user");
		if (!user) {
			return response.error(c, "Unauthorized", 401);
		}

		const body = await c.req.parseBody();
		const file = body.avatar;

		if (!file || !(file instanceof File)) {
			return response.error(c, "Avatar file is required", 400);
		}

		if (!ALLOWED_MIME_TYPES.includes(file.type)) {
			return response.error(
				c,
				`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
				400,
			);
		}

		if (file.size > MAX_FILE_SIZE) {
			return response.error(c, "File size exceeds 5MB limit", 400);
		}

		const buffer = await file.arrayBuffer();
		const fileExt = file.name.split(".").pop() || "jpg";
		const fileName = `avatars/${user.id}/${randomBytes(16).toString("hex")}.${fileExt}`;

		await uploadToS3(fileName, Buffer.from(buffer), file.type);

		const avatarUrl = getS3ObjectUrl(fileName);

		const currentUser = await userService.getUserById(user.id);
		if (currentUser.image?.includes("avatars/")) {
			const oldKey = currentUser.image.split("/").slice(-3).join("/");
			await deleteFromS3(oldKey).catch((err) =>
				console.error("Failed to delete old avatar:", err),
			);
		}

		const updatedUser = await userService.updateUser(user.id, {
			image: avatarUrl,
		});

		return response.success(c, {
			user: updatedUser,
			avatar_url: avatarUrl,
		}, "Avatar uploaded successfully");
	} catch (err) {
		return response.error(
			c,
			err instanceof Error ? err.message : "Failed to upload avatar",
			500,
		);
	}
};

export const deleteAvatar = async (c: Context) => {
	try {
		const user = c.get("user");
		if (!user) {
			return response.error(c, "Unauthorized", 401);
		}

		const currentUser = await userService.getUserById(user.id);
		
		if (!currentUser.image) {
			return response.error(c, "No avatar to delete", 400);
		}

		if (currentUser.image.includes("avatars/")) {
			const key = currentUser.image.split("/").slice(-3).join("/");
			await deleteFromS3(key);
		}

		const updatedUser = await userService.updateUser(user.id, {
			image: null,
		});

		return response.success(c, updatedUser, "Avatar deleted successfully");
	} catch (err) {
		return response.error(
			c,
			err instanceof Error ? err.message : "Failed to delete avatar",
			500,
		);
	}
};
