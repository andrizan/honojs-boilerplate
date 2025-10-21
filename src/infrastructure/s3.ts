import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
	type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { env } from "./env.js";

let s3Client: S3Client;

const s3Config: S3ClientConfig = {
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
	...(env.AWS_S3_ENDPOINT && { endpoint: env.AWS_S3_ENDPOINT }),
	forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
};

export const getS3Client = (): S3Client => {
	if (!s3Client) {
		s3Client = new S3Client(s3Config);
	}
	return s3Client;
};

export const uploadToS3 = async (
	key: string,
	body: Buffer | Uint8Array | string,
	contentType?: string,
	metadata?: Record<string, string>,
) => {
	const client = getS3Client();

	const command = new PutObjectCommand({
		Bucket: env.AWS_S3_BUCKET,
		Key: key,
		Body: body,
		ContentType: contentType,
		Metadata: metadata,
	});

	return await client.send(command);
};

export const getFromS3 = async (key: string) => {
	const client = getS3Client();

	const command = new GetObjectCommand({
		Bucket: env.AWS_S3_BUCKET,
		Key: key,
	});

	return await client.send(command);
};

export const deleteFromS3 = async (key: string) => {
	const client = getS3Client();

	const command = new DeleteObjectCommand({
		Bucket: env.AWS_S3_BUCKET,
		Key: key,
	});

	return await client.send(command);
};

export const checkS3ObjectExists = async (key: string): Promise<boolean> => {
	const client = getS3Client();

	try {
		const command = new HeadObjectCommand({
			Bucket: env.AWS_S3_BUCKET,
			Key: key,
		});

		await client.send(command);
		return true;
	} catch {
		return false;
	}
};

export const listS3Objects = async (prefix?: string, maxKeys = 1000) => {
	const client = getS3Client();

	const command = new ListObjectsV2Command({
		Bucket: env.AWS_S3_BUCKET,
		Prefix: prefix,
		MaxKeys: maxKeys,
	});

	return await client.send(command);
};

export const getS3ObjectUrl = (key: string): string => {
	if (env.AWS_S3_ENDPOINT) {
		return `${env.AWS_S3_ENDPOINT}/${env.AWS_S3_BUCKET}/${key}`;
	}
	return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

export const checkS3Connection = async (): Promise<{
	status: string;
	error: string | null;
}> => {
	try {
		const client = getS3Client();
		const command = new ListObjectsV2Command({
			Bucket: env.AWS_S3_BUCKET,
			MaxKeys: 1,
		});
		await client.send(command);
		return { status: "connected", error: null };
	} catch (err) {
		return {
			status: "error",
			error: err instanceof Error ? err.message : "Unknown error",
		};
	}
};

export const closeS3Client = (): void => {
	if (s3Client) {
		s3Client.destroy();
		console.log("S3 client closed successfully");
	}
};
