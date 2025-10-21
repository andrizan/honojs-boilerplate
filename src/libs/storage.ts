import { randomBytes } from "node:crypto";
import {
	checkS3ObjectExists,
	deleteFromS3,
	getFromS3,
	getS3ObjectUrl,
	uploadToS3,
} from "../infrastructure/s3.js";
import { logger } from "../shared/logger.js";

export interface UploadFileOptions {
	folder?: string;
	filename?: string;
	contentType?: string;
	metadata?: Record<string, string>;
	generateUniqueName?: boolean;
}

export interface UploadResult {
	key: string;
	url: string;
	size: number;
}

/**
 * Generate unique filename with timestamp and random string
 */
export const generateUniqueFilename = (originalName: string): string => {
	const timestamp = Date.now();
	const random = randomBytes(8).toString("hex");
	const extension = originalName.split(".").pop();
	const nameWithoutExt = originalName.replace(`.${extension}`, "");
	const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "-");
	return `${sanitized}-${timestamp}-${random}.${extension}`;
};

/**
 * Upload file to S3 storage
 */
export const uploadFile = async (
	file: Buffer | Uint8Array | string,
	originalName: string,
	options: UploadFileOptions = {},
): Promise<UploadResult> => {
	try {
		const {
			folder = "uploads",
			filename,
			contentType,
			metadata,
			generateUniqueName = true,
		} = options;

		const finalFilename = filename
			? filename
			: generateUniqueName
				? generateUniqueFilename(originalName)
				: originalName;

		const key = folder ? `${folder}/${finalFilename}` : finalFilename;

		const result = await uploadToS3(key, file, contentType, metadata);

		logger.info({ key, bucket: result.$metadata }, "File uploaded to S3");

		const size =
			typeof file === "string"
				? Buffer.byteLength(file)
				: file instanceof Buffer
					? file.length
					: file.byteLength;

		return {
			key,
			url: getS3ObjectUrl(key),
			size,
		};
	} catch (err) {
		logger.error({ error: err }, "Failed to upload file to S3");
		throw err;
	}
};

/**
 * Download file from S3 storage
 */
export const downloadFile = async (key: string): Promise<Buffer> => {
	try {
		const result = await getFromS3(key);

		if (!result.Body) {
			throw new Error("File body is empty");
		}

		const chunks: Uint8Array[] = [];
		for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
			chunks.push(chunk);
		}

		const buffer = Buffer.concat(chunks);

		logger.info({ key }, "File downloaded from S3");

		return buffer;
	} catch (err) {
		logger.error({ error: err, key }, "Failed to download file from S3");
		throw err;
	}
};

/**
 * Delete file from S3 storage
 */
export const deleteFile = async (key: string): Promise<boolean> => {
	try {
		await deleteFromS3(key);
		logger.info({ key }, "File deleted from S3");
		return true;
	} catch (err) {
		logger.error({ error: err, key }, "Failed to delete file from S3");
		return false;
	}
};

/**
 * Check if file exists in S3 storage
 */
export const fileExists = async (key: string): Promise<boolean> => {
	try {
		return await checkS3ObjectExists(key);
	} catch (err) {
		logger.error({ error: err, key }, "Failed to check file existence in S3");
		return false;
	}
};

/**
 * Get public URL for a file in S3
 */
export const getFileUrl = (key: string): string => {
	return getS3ObjectUrl(key);
};

/**
 * Upload multiple files to S3
 */
export const uploadMultipleFiles = async (
	files: Array<{
		buffer: Buffer | Uint8Array | string;
		name: string;
		contentType?: string;
	}>,
	options: Omit<UploadFileOptions, "filename"> = {},
): Promise<UploadResult[]> => {
	const uploadPromises = files.map((file) =>
		uploadFile(file.buffer, file.name, {
			...options,
			contentType: file.contentType,
		}),
	);

	return await Promise.all(uploadPromises);
};
