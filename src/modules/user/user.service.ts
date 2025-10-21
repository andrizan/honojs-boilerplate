import type { User } from "./user.model.js";
import { UserRepository } from "./user.repository.js";

export class UserService {
	private repository: UserRepository;

	constructor() {
		this.repository = new UserRepository();
	}

	async getProfile(email: string) {
		const user = await this.repository.findByEmail(email);
		if (!user) {
			throw new Error("User not found");
		}
		return user;
	}

	async getUserById(id: string) {
		const user = await this.repository.findById(id);
		if (!user) {
			throw new Error("User not found");
		}
		return user;
	}

	async getAllUsers(page = 1, limit = 10) {
		const offset = (page - 1) * limit;
		const result = await this.repository.findAll(limit, offset);

		return {
			users: result.users,
			pagination: {
				page,
				limit,
				total: result.total,
				totalPages: Math.ceil(result.total / limit),
			},
		};
	}

	async updateUser(
		id: string,
		data: Partial<Pick<User, "name" | "image" | "role">>,
	) {
		const user = await this.repository.update(id, data);
		if (!user) {
			throw new Error("User not found");
		}
		return user;
	}

	async updateAvatar(id: string, avatarUrl: string) {
		return this.updateUser(id, { image: avatarUrl });
	}

	async removeAvatar(id: string) {
		return this.updateUser(id, { image: null });
	}

	async deleteUser(id: string) {
		const deleted = await this.repository.delete(id);
		if (!deleted) {
			throw new Error("User not found");
		}
		return { success: true };
	}
}
