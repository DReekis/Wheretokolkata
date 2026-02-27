import bcrypt from "bcryptjs";
import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export interface SessionData {
    userId?: string;
    username?: string;
}

const sessionOptions = {
    password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_placeholder",
    cookieName: "wtk_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
    },
};

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser(): Promise<{ userId: string; username: string } | null> {
    const session = await getSession();
    if (!session.userId || !session.username) return null;
    return { userId: session.userId, username: session.username };
}
