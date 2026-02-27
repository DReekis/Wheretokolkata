/**
 * Simple input sanitization — strips HTML tags and trims whitespace.
 * No external dependency required.
 */
export function sanitize(input: string): string {
    return input
        .replace(/<[^>]*>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .trim();
}

export function sanitizeMultiline(input: string): string {
    return sanitize(input);
}
