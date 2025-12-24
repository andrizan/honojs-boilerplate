import type {
  UpdateUserDTO,
  UserResponseDTO,
  UserListResponseDTO,
} from "@/modules/user/user.dto";
import { toUserResponseDTO } from "@/modules/user/user.dto";
import { UserRepository } from "@/modules/user/user.repository";
import {
  calculatePaginationOffset,
  createPaginatedResponse,
} from "@/utils/pagination";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getProfile(email: string): Promise<UserResponseDTO> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return toUserResponseDTO(user);
  }

  async getUserById(id: string): Promise<UserResponseDTO> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return toUserResponseDTO(user);
  }

  async getAllUsers(page = 1, limit = 10): Promise<UserListResponseDTO> {
    const offset = calculatePaginationOffset({ page, limit });
    const result = await this.repository.findAll(limit, offset);

    return createPaginatedResponse(
      result.users.map(toUserResponseDTO),
      result.total,
      page,
      limit,
    );
  }

  async updateUser(
    id: string,
    data: UpdateUserDTO,
  ): Promise<UserResponseDTO> {
    if (Object.keys(data).length === 0) {
      throw new Error("No fields to update");
    }

    const user = await this.repository.update(id, data);
    if (!user) {
      throw new Error("User not found");
    }
    return toUserResponseDTO(user);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<UserResponseDTO> {
    return this.updateUser(id, { image: avatarUrl });
  }

  async removeAvatar(id: string): Promise<UserResponseDTO> {
    return this.updateUser(id, { image: null });
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error("User not found");
    }
  }
}
