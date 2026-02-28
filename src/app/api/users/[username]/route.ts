import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Place from "@/models/Place";
import Comment from "@/models/Comment";
import SavedPlace from "@/models/SavedPlace";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        await connectDB();

        const user = await User.findOne({ username: username.toLowerCase() }).select("username karma created_at").lean();
        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        const [placesCount, commentsCount, places, savedPlaces] = await Promise.all([
            Place.countDocuments({ created_by: user._id, status: { $ne: "removed" } }),
            Comment.countDocuments({ user_id: user._id, status: { $ne: "removed" } }),
            Place.find({ created_by: user._id, status: { $ne: "removed" } })
                .sort({ created_at: -1 })
                .limit(20)
                .select("name city category score image_urls created_at")
                .lean(),
            SavedPlace.find({ user_id: user._id })
                .sort({ created_at: -1 })
                .limit(20)
                .populate("place_id", "name city category score image_urls")
                .lean(),
        ]);

        return NextResponse.json({
            user,
            stats: { placesCount, commentsCount },
            places,
            savedPlaces,
        });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
