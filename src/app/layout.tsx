import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { getCurrentUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL(getSiteUrl()),
    title: "WhereToKolkata - Discover Special Places",
    description: "A community-driven map to discover, validate, and discuss meaningful places in Kolkata.",
    keywords: ["Kolkata", "places", "community map", "discover", "explore", "food", "cafes", "hidden gems"],
    alternates: {
        canonical: "/kolkata/explore",
    },
    openGraph: {
        title: "WhereToKolkata",
        description: "Discover special places in Kolkata, validated by the community.",
        type: "website",
        url: "/kolkata/explore",
        images: [{ url: "/opengraph-image" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "WhereToKolkata",
        description: "Discover special places in Kolkata, validated by the community.",
        images: ["/opengraph-image"],
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const initialUser = await getCurrentUser();

    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
                <link rel="dns-prefetch" href="https://res.cloudinary.com" />
                <link rel="dns-prefetch" href="https://unpkg.com" />
            </head>
            <body>
                <AuthProvider initialUser={initialUser}>
                    <Navbar />
                    <main>{children}</main>
                    <MobileNav />
                </AuthProvider>
            </body>
        </html>
    );
}
