import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { sign } from "hono/jwt";
import { users } from "../db/schema.js";
import { db } from "../lib/db.js";
import { redisDel, redisGet, redisSet } from "../lib/redis.js";
import type { User } from "../types/users.js";
import bcrypt from "bcryptjs";
import type { DatabaseError } from "../types/db.js";
import { signinValidator, signupValidator } from "../utils/validator.js";

export const googleAuthUrl = async (c: Context) => {
	const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
	const REDIRECT_URI = encodeURIComponent(
		process.env.GOOGLE_REDIRECT_URI ?? "",
	);
	const SCOPE = encodeURIComponent("openid email profile");
	const url =
		`https://accounts.google.com/o/oauth2/v2/auth?` +
		`client_id=${GOOGLE_CLIENT_ID}&` +
		`redirect_uri=${REDIRECT_URI}&` +
		`response_type=code&` +
		`scope=${SCOPE}&` +
		`access_type=offline&` +
		`prompt=select_account`;

	return c.json({ data: url });
};

export const googleAuthCallback = async (c: Context) => {
	const code = c.req.query("code");
	const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
	const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
	const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ?? "";

	// Tukar code jadi token di Google
	const params = new URLSearchParams({
		code: code ?? "",
		client_id: GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		redirect_uri: REDIRECT_URI,
		grant_type: "authorization_code",
	});

	const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: params,
	});

	if (!tokenRes.ok) {
		return c.json({ error: "Failed to fetch token" }, 400);
	}

	const token = await tokenRes.json();

	// Ambil data user dari Google (decode id_token)
	const userInfoRes = await fetch(
		`https://openidconnect.googleapis.com/v1/userinfo`,
		{
			headers: { Authorization: `Bearer ${token.access_token}` },
		},
	);
	const userInfo = await userInfoRes.json();
	const refresh_token = randomBytes(64).toString("hex");

	// Proses user di database
	let user = await db
		.select()
		.from(users)
		.where(eq(users.email, userInfo.email))
		.then((u) => u[0]);

	if (!user) {
		const inserted = await db
			.insert(users)
			.values({
				email: userInfo.email,
				name: userInfo.name,
				picture: userInfo.picture,
				provider: "google",
				refreshToken: refresh_token,
			})
			.returning();
		user = inserted[0];
	}

	await db
		.update(users)
		.set({ refreshToken: refresh_token })
		.where(eq(users.email, userInfo.email));

	const saveRefreshToken = await redisSet(
		`users:refresh_token:${refresh_token}`,
		JSON.stringify(user),
	);
	if (saveRefreshToken !== "OK") {
		return c.json({ error: "Failed to save refresh token" }, 500);
	}

	// Buat JWT aplikasi
	const jwtToken = await sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
			exp: Math.floor(Date.now() / 1000) + 60 * 15,
		},
		process.env.JWT_SECRET_KEY ?? "",
	);

	return c.json(
		{
			data: {
				access_token: jwtToken,
				refresh_token: refresh_token,
			},
		},
		200,
	);
};

export const signup = async (c: Context) => {
	const req = await c.req.json();

	const validate = await signupValidator.safeParseAsync(req);
	if (!validate.success) {
		return c.json(
			{
				error: "Invalid request data",
				details: JSON.parse(validate.error.message),
			},
			400,
		);
	}

	const passHash = await bcrypt.hash(validate.data.password, 10);
	const refresh_token = randomBytes(64).toString("hex");
	let inserted: User | undefined;
	try {
		const result = await db
			.insert(users)
			.values({
				email: validate.data.email,
				name: validate.data.name,
				password: passHash,
				provider: validate.data.provider,
				role: validate.data.role,
				refreshToken: refresh_token,
			})
			.returning();
		inserted = result[0];
	} catch (err) {
		const dbErr = err as DatabaseError;
		return c.json({
			error: dbErr.cause.detail,
		});
	}

	const saveRefreshToken = await redisSet(
		`users:refresh_token:${refresh_token}`,
		JSON.stringify(inserted),
	);

	if (saveRefreshToken !== "OK") {
		return c.json({ error: "Failed to save refresh token" }, 500);
	}

	if (!inserted) {
		return c.json({ error: "User insertion failed" }, 500);
	}

	const jwtToken = await sign(
		{
			id: inserted.id,
			email: inserted.email,
			role: inserted.role,
			exp: Math.floor(Date.now() / 1000) + 60 * 15,
		},
		process.env.JWT_SECRET_KEY ?? "",
	);

	return c.json(
		{
			message: "User created successfully",
			data: {
				access_token: jwtToken,
				refresh_token: inserted.refreshToken,
			},
		},
		201,
	);
};

export const signin = async (c: Context) => {
	const req = await c.req.json();

	const validate = await signinValidator.safeParseAsync(req);
	if (!validate.success) {
		return c.json(
			{
				error: "Invalid request data",
				details: JSON.parse(validate.error.message),
			},
			400,
		);
	}

	const user: User = await db
		.select()
		.from(users)
		.where(eq(users.email, validate.data.email))
		.then((u) => u[0]);

	if (user.provider !== "system") {
		return c.json({
			error:
				"Invalid provider. Your account is registered with the provider: " +
				user.provider,
		});
	}
	const passCompare = await bcrypt.compare(
		validate.data.password,
		user.password ?? "",
	);

	if (!passCompare) {
		return c.json({ error: "invailed password" });
	}

	const refresh_token = randomBytes(64).toString("hex");
	await db
		.update(users)
		.set({ refreshToken: refresh_token })
		.where(eq(users.email, user.email));

	const saveRefreshToken = await redisSet(
		`users:refresh_token:${refresh_token}`,
		JSON.stringify(user),
	);

	if (saveRefreshToken !== "OK") {
		return c.json({ error: "Failed to save refresh token" }, 500);
	}

	const jwtToken = await sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
			exp: Math.floor(Date.now() / 1000) + 60 * 15,
		},
		process.env.JWT_SECRET_KEY ?? "",
	);

	return c.json(
		{
			data: {
				access_token: jwtToken,
				refresh_token: refresh_token,
			},
		},
		200,
	);
};

export const getRefreshToken = async (c: Context) => {
	const { refresh_token } = await c.req.json();

	if (!refresh_token) {
		return c.json({ error: "refresh_token is required" }, 401);
	}

	const cached = await redisGet(`users:refresh_token:${refresh_token}`);
	const user: User | null = cached
		? (JSON.parse(cached) as User)
		: ((await db
				.select()
				.from(users)
				.where(eq(users.refreshToken, refresh_token))
				.then((u) => u[0] as User | undefined)) ?? null);

	if (!user) {
		return c.json({ error: "refresh_token invalid" }, 401);
	}

	if (!cached) {
		const saveRefreshToken = await redisSet(
			`users:refresh_token:${refresh_token}`,
			JSON.stringify(user),
		);
		if (saveRefreshToken !== "OK") {
			return c.json({ error: "Failed to save refresh token" }, 500);
		}
	}

	const jwtToken = await sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
			exp: Math.floor(Date.now() / 1000) + 60 * 15,
		},
		process.env.JWT_SECRET_KEY ?? "",
	);

	return c.json({
		data: {
			access_token: jwtToken,
			token_type: "Bearer",
			expires_in: 900, // 15 menit (900 detik)
		},
	});
};

export const logout = async (c: Context) => {
	const user: User = c.get("user");
	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const deleted = await redisDel(`users:refresh_token:${user.refreshToken}`);
	if (!deleted) {
		return c.json({ error: "Failed to Logged out" }, 500);
	}

	await db
		.update(users)
		.set({ refreshToken: "" })
		.where(eq(users.email, user.email));

	return c.json({ message: "Logged out successfully" }, 200);
};
