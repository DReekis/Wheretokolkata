import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: "WhereToKolkata — Discover Special Places",
    description: "A community-driven map to discover, validate, and discuss meaningful places in Kolkata.",
    keywords: ["Kolkata", "places", "community map", "discover", "explore", "food", "cafes", "hidden gems"],
    openGraph: {
        title: "WhereToKolkata",
        description: "Discover special places in Kolkata, validated by the community.",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <Navbar />
                    <main>{children}</main>
                    <MobileNav />
                </AuthProvider>
            </body>
        </html>
    );
}
