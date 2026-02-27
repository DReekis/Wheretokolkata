import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";
import { sanitize } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const rl = await rateLimit(`register:${ip}`, 5, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
        }

        const body = await req.json();
        const username = sanitize(body.username || "").toLowerCase();
        const password = body.password || "";
        const confirmPassword = body.confirmPassword || "";

        if (!username || username.length < 2 || username.length > 30) {
            return NextResponse.json({ error: "Username must be 2-30 characters." }, { status: 400 });
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
            return NextResponse.json({ error: "Username can only contain lowercase letters, numbers, and underscores." }, { status: 400 });
        }

        if (!password || password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
        }

        await connectDB();

        const existing = await User.findOne({ username });
        if (existing) {
            return NextResponse.json({ error: "Username already taken." }, { status: 409 });
        }

        const password_hash = await hashPassword(password);
        const user = await User.create({ username, password_hash });

        const session = await getSession();
        session.userId = user._id.toString();
        session.username = user.username;
        await session.save();

        return NextResponse.json({ user: { id: user._id, username: user.username } }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
