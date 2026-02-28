"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileNav() {
    const params = useParams();
    const pathname = usePathname();
    const { user } = useAuth();
    const city = (params.city as string) || "kolkata";

    const isActive = (path: string) => pathname.includes(path);

    return (
        <div className="mobile-nav">
            <Link href={`/${city}/explore`} prefetch className={`mobile-nav-item ${isActive("/explore") ? "active" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                Explore
            </Link>
            <Link href={`/${city}/map`} prefetch className={`mobile-nav-item ${isActive("/map") ? "active" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                Map
            </Link>
            {user && (
                <Link href={`/${city}/add`} prefetch className={`mobile-nav-item ${isActive("/add") ? "active" : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
                    </svg>
                    Add
                </Link>
            )}
            <Link href="/profile" prefetch className={`mobile-nav-item ${isActive("/profile") ? "active" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Profile
            </Link>
        </div>
    );
}
