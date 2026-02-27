export const SUPPORTED_CITIES = ["kolkata"] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

export const DEFAULT_CITY: SupportedCity = "kolkata";

export function isValidCity(city: string): city is SupportedCity {
    return SUPPORTED_CITIES.includes(city as SupportedCity);
}

export const CITY_CONFIG: Record<SupportedCity, { name: string; center: [number, number]; zoom: number }> = {
    kolkata: {
        name: "Kolkata",
        center: [22.5726, 88.3639],
        zoom: 13,
    },
};
