const FALLBACK_SITE_URL = "https://wheretokolkata.com";

export function getSiteUrl(): string {
    const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function absoluteUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getSiteUrl()}${normalizedPath}`;
}
