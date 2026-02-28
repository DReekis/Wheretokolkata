import { redirect } from "next/navigation";
import AddPlaceForm from "@/components/AddPlaceForm";
import { CITY_CONFIG, type SupportedCity } from "@/lib/cities";
import { getCurrentUser } from "@/lib/auth";

interface AddPlacePageProps {
    params: Promise<{ city: string }>;
}

export default async function AddPlacePage({ params }: AddPlacePageProps) {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    const { city } = await params;
    const config = CITY_CONFIG[city as SupportedCity] || CITY_CONFIG.kolkata;

    return (
        <div className="page">
            <div className="content-container">
                <div className="page-header">
                    <h1 className="page-title">Add a Place</h1>
                    <p className="page-subtitle">Share a special place in {city.charAt(0).toUpperCase() + city.slice(1)}</p>
                </div>

                <AddPlaceForm city={city} initialCenter={config.center} initialZoom={config.zoom} />
            </div>
        </div>
    );
}
