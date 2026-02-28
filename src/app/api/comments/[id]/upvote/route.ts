import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import Comment from "@/models/Comment";

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Login required." }, { status: 401 });
        }

        const rl = await rateLimit(`cmtup:${user.userId}`, 30, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many actions." }, { status: 429 });
        }

        const { id } = await params;
        await connectDB();

        const comment = await Comment.findByIdAndUpdate(id, { $inc: { upvotes: 1 } }, { new: true })
            .select("upvotes")
            .lean();
        if (!comment) {
            return NextResponse.json({ error: "Comment not found." }, { status: 404 });
        }

        return NextResponse.json({ upvotes: comment.upvotes });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
