import DOMPurify from "isomorphic-dompurify";

export function sanitize(input: string): string {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

export function sanitizeMultiline(input: string): string {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: ["br"], ALLOWED_ATTR: [] }).trim();
}
