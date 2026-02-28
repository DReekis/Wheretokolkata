"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, usePathname } from "next/navigation";

export default function Navbar() {
    const { user, logout } = useAuth();
    const params = useParams();
    const pathname = usePathname();
    const city = (params.city as string) || "kolkata";

    const isActive = (path: string) => pathname.includes(path);

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href={`/${city}/explore`} prefetch className="navbar-logo">
                    Where<span>To</span>{city.charAt(0).toUpperCase() + city.slice(1)}
                </Link>

                <div className="navbar-links">
                    <Link
                        href={`/${city}/explore`}
                        prefetch
                        className={`navbar-link ${isActive("/explore") ? "active" : ""}`}
                    >
                        Explore
                    </Link>
                    <Link
                        href={`/${city}/map`}
                        prefetch
                        className={`navbar-link ${isActive("/map") ? "active" : ""}`}
                    >
                        Map
                    </Link>
                    {user && (
                        <Link
                            href={`/${city}/add`}
                            prefetch
                            className={`navbar-link ${isActive("/add") ? "active" : ""}`}
                        >
                            + Add Place
                        </Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link href="/profile" prefetch className="btn btn-ghost btn-sm">
                                {user.username}
                            </Link>
                            <button onClick={logout} className="btn btn-secondary btn-sm">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" prefetch className="btn btn-ghost btn-sm">
                                Login
                            </Link>
                            <Link href="/register" prefetch className="btn btn-primary btn-sm">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
