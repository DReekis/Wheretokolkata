const CLOUDINARY_UPLOAD_SEGMENT = "/upload/";

export const IMAGE_BLUR_PLACEHOLDER =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHZpZXdCb3g9JzAgMCAxNiAxMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIGZpbGw9JyNlZWYwZjUnLz48L3N2Zz4=";

export function optimizeCloudinaryUrl(url: string, width = 600): string {
    if (!url || !url.includes(CLOUDINARY_UPLOAD_SEGMENT)) return url;
    const [prefix, suffix] = url.split(CLOUDINARY_UPLOAD_SEGMENT);
    if (!prefix || !suffix) return url;
    return `${prefix}${CLOUDINARY_UPLOAD_SEGMENT}f_auto,q_auto,w_${width}/${suffix.replace(/^\/+/, "")}`;
}
