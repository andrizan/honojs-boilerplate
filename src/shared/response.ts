import type { Context } from "hono";
import { HTTP_STATUS } from "./constants.js";

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	errors?: Record<string, string[]>;
}

export const success = <T>(
	c: Context,
	data: T,
	message?: string,
	status: number = HTTP_STATUS.OK,
) => {
	return c.json<ApiResponse<T>>(
		{
			success: true,
			data,
			message,
		},
		status as 200,
	);
};

export const created = <T>(c: Context, data: T, message?: string) => {
	return c.json<ApiResponse<T>>(
		{
			success: true,
			data,
			message,
		},
		HTTP_STATUS.CREATED,
	);
};

export const error = (
	c: Context,
	message: string,
	status: number = HTTP_STATUS.BAD_REQUEST,
) => {
	return c.json<ApiResponse>(
		{
			success: false,
			error: message,
		},
		status as 400,
	);
};

export const validationError = (
	c: Context,
	errors: Record<string, string[]>,
) => {
	return c.json<ApiResponse>(
		{
			success: false,
			error: "Validation failed",
			errors,
		},
		HTTP_STATUS.UNPROCESSABLE_ENTITY,
	);
};

export const unauthorized = (c: Context, message = "Unauthorized") => {
	return c.json<ApiResponse>(
		{
			success: false,
			error: message,
		},
		HTTP_STATUS.UNAUTHORIZED,
	);
};

export const forbidden = (c: Context, message = "Forbidden") => {
	return c.json<ApiResponse>(
		{
			success: false,
			error: message,
		},
		HTTP_STATUS.FORBIDDEN,
	);
};

export const notFound = (c: Context, message = "Resource not found") => {
	return c.json<ApiResponse>(
		{
			success: false,
			error: message,
		},
		HTTP_STATUS.NOT_FOUND,
	);
};

export const internalError = (
	c: Context,
	message = "Internal server error",
) => {
	return c.json<ApiResponse>(
		{
			success: false,
			error: message,
		},
		HTTP_STATUS.INTERNAL_SERVER_ERROR,
	);
};
