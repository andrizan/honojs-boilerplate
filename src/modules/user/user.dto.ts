import { z } from "zod";
import type { User } from "@/db/schema/auth/user";

// ============ Input DTOs ============
// DTOs untuk menerima data dari client

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.url("Invalid image URL").nullable().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// ============ Response DTOs ============
// DTOs untuk mengirim data ke client

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListResponseDTO {
  data: UserResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ Helpers ============

export function toUserResponseDTO(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
