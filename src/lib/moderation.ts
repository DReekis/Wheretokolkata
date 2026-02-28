import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const REPORT_REASONS = [
    "gore_or_violence",
    "nudity_or_sexual",
    "hate_or_harassment",
    "spam_or_scam",
    "misleading_or_fake",
    "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const PLACE_AUTO_FLAG_THRESHOLD = 3;
export const PLACE_AUTO_REMOVE_THRESHOLD = 7;
export const COMMENT_AUTO_FLAG_THRESHOLD = 3;
export const COMMENT_AUTO_REMOVE_THRESHOLD = 5;

export function isValidReportReason(reason: string): reason is ReportReason {
    return (REPORT_REASONS as readonly string[]).includes(reason);
}

export async function getCurrentModerator() {
    const user = await getCurrentUser();
    if (!user) return null;

    await connectDB();
    const dbUser = await User.findById(user.userId)
        .select("username role")
        .lean<{ _id: unknown; username: string; role?: string } | null>();

    if (!dbUser) return null;
    if (dbUser.role !== "moderator" && dbUser.role !== "admin") return null;

    return {
        userId: String(dbUser._id),
        username: dbUser.username,
        role: dbUser.role,
    };
}
