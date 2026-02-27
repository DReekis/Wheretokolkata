import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyPassword, getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const rl = await rateLimit(`login:${ip}`, 10, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
        }

        const body = await req.json();
        const username = (body.username || "").toLowerCase().trim();
        const password = body.password || "";

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password required." }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
        }

        const session = await getSession();
        session.userId = user._id.toString();
        session.username = user.username;
        await session.save();

        return NextResponse.json({ user: { id: user._id, username: user.username } });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
