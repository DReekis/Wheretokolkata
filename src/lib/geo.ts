export function validateCoordinates(lat: number, lng: number): boolean {
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}

export interface BoundingBox {
    south: number;
    west: number;
    north: number;
    east: number;
}

export function parseBoundingBox(params: URLSearchParams): BoundingBox | null {
    const south = parseFloat(params.get("south") || "");
    const west = parseFloat(params.get("west") || "");
    const north = parseFloat(params.get("north") || "");
    const east = parseFloat(params.get("east") || "");

    if ([south, west, north, east].some(isNaN)) return null;
    if (!validateCoordinates(south, west) || !validateCoordinates(north, east)) return null;

    return { south, west, north, east };
}

export function buildGeoWithinQuery(bbox: BoundingBox) {
    return {
        location: {
            $geoWithin: {
                $geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [bbox.west, bbox.south],
                            [bbox.east, bbox.south],
                            [bbox.east, bbox.north],
                            [bbox.west, bbox.north],
                            [bbox.west, bbox.south],
                        ],
                    ],
                },
            },
        },
    };
}
