import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST() {
    try {
        const session = await getSession();
        session.destroy();
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
