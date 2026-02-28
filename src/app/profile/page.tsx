import { redirect } from "next/navigation";
import PlaceCard from "@/components/PlaceCard";
import { getCurrentUser, getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Place from "@/models/Place";
import Comment from "@/models/Comment";
import SavedPlace from "@/models/SavedPlace";

async function logoutAndRedirect() {
    "use server";

    const session = await getSession();
    session.destroy();
    redirect("/kolkata/explore");
}

export default async function ProfilePage() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/login");
    }

    await connectDB();

    const user = await User.findById(currentUser.userId)
        .select("username karma role created_at")
        .lean<{ _id: unknown; username: string; karma: number; role?: string; created_at: string | Date } | null>();

    if (!user) {
        redirect("/login");
    }

    const [placesCount, commentsCount, places, savedPlaces] = await Promise.all([
        Place.countDocuments({ created_by: user._id, status: { $ne: "removed" } }),
        Comment.countDocuments({ user_id: user._id, status: { $ne: "removed" } }),
        Place.find({ created_by: user._id, status: { $ne: "removed" } })
            .sort({ created_at: -1 })
            .limit(20)
            .select("name city category score image_urls created_at")
            .lean<{
                _id: unknown;
                name: string;
                city: string;
                category: string;
                score: number;
                image_urls: string[];
            }[]>(),
        SavedPlace.find({ user_id: user._id })
            .sort({ created_at: -1 })
            .limit(20)
            .populate("place_id", "name city category score image_urls")
            .lean<{
                place_id?: {
                    _id: unknown;
                    name: string;
                    city: string;
                    category: string;
                    score: number;
                    image_urls: string[];
                };
            }[]>(),
    ]);

    return (
        <div className="page">
            <div className="content-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="profile-username">{user.username}</h1>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                        Member since {new Date(user.created_at).toLocaleDateString()}
                    </p>

                    <div className="profile-stats">
                        <div className="profile-stat">
                            <div className="profile-stat-value">{user.karma}</div>
                            <div className="profile-stat-label">Karma</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">{placesCount}</div>
                            <div className="profile-stat-label">Places</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">{commentsCount}</div>
                            <div className="profile-stat-label">Comments</div>
                        </div>
                    </div>

                    <form action={logoutAndRedirect}>
                        <button type="submit" className="btn btn-secondary btn-sm" style={{ marginTop: "var(--space-4)" }}>
                            Logout
                        </button>
                    </form>

                    {(user.role === "moderator" || user.role === "admin") && (
                        <div style={{ marginTop: "var(--space-2)" }}>
                            <a href="/moderation" className="btn btn-ghost btn-sm">Moderation Queue</a>
                        </div>
                    )}
                </div>

                {places.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">Your Places</h2>
                        <div className="section-grid">
                            {places.map((place, index) => (
                                <PlaceCard
                                    key={String(place._id)}
                                    _id={String(place._id)}
                                    name={place.name}
                                    category={place.category}
                                    score={place.score}
                                    image_urls={place.image_urls}
                                    city={place.city}
                                    priority={index === 0}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {savedPlaces.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">Saved Places</h2>
                        <div className="section-grid">
                            {savedPlaces.map((savedPlace, index) => (
                                savedPlace.place_id ? (
                                    <PlaceCard
                                        key={String(savedPlace.place_id._id)}
                                        _id={String(savedPlace.place_id._id)}
                                        name={savedPlace.place_id.name}
                                        category={savedPlace.place_id.category}
                                        score={savedPlace.place_id.score}
                                        image_urls={savedPlace.place_id.image_urls}
                                        city={savedPlace.place_id.city}
                                        priority={index === 0 && places.length === 0}
                                    />
                                ) : null
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
