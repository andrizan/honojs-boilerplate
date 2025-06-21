export type User = {
	id: string;
	email: string;
	name: string;
	password: string | null;
	picture: string | null;
	provider: string;
	role: string | null;
	refreshToken: string;
	createdAt: Date;
};
