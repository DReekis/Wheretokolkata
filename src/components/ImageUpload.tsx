"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { IMAGE_BLUR_PLACEHOLDER, optimizeCloudinaryUrl } from "@/lib/image";

interface ImageUploadProps {
    images: string[];
    onChange: (urls: string[]) => void;
}

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;
        setError("");

        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) {
            setError(`Maximum ${MAX_IMAGES} images allowed.`);
            return;
        }

        const toUpload = Array.from(files).slice(0, remaining);

        for (const file of toUpload) {
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setError(`File "${file.name}" exceeds ${MAX_SIZE_MB}MB limit.`);
                return;
            }
            if (!file.type.startsWith("image/")) {
                setError(`File "${file.name}" is not an image.`);
                return;
            }
        }

        setUploading(true);
        try {
            const signRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder: "wheretokolkata" }),
            });
            const signData = await signRes.json();

            const uploadedUrls: string[] = [];

            for (const file of toUpload) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", signData.apiKey);
                formData.append("timestamp", String(signData.timestamp));
                formData.append("signature", signData.signature);
                formData.append("folder", signData.folder);
                formData.append("transformation", "f_auto,q_auto,w_600");

                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
                    { method: "POST", body: formData }
                );
                const uploadData = await uploadRes.json();

                if (uploadData.secure_url) {
                    uploadedUrls.push(uploadData.secure_url);
                }
            }

            onChange([...images, ...uploadedUrls]);
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div
                className="upload-area"
                onClick={() => fileRef.current?.click()}
                style={uploading ? { opacity: 0.6, pointerEvents: "none" } : {}}
            >
                {uploading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)" }}>
                        <div className="spinner" />
                        <span>Uploading...</span>
                    </div>
                ) : (
                    <>
                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                            Click to upload images ({images.length}/{MAX_IMAGES})
                        </p>
                        <p className="form-hint">Max {MAX_SIZE_MB}MB each - JPG, PNG, WebP</p>
                    </>
                )}
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
            />

            {error && <p className="form-error" style={{ marginTop: "var(--space-2)" }}>{error}</p>}

            {images.length > 0 && (
                <div className="upload-preview-grid">
                    {images.map((url, index) => (
                        <div key={`${url}-${index}`} className="upload-preview">
                            <Image
                                src={optimizeCloudinaryUrl(url, 600)}
                                alt={`Upload ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 25vw, 100px"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                                style={{ objectFit: "cover" }}
                            />
                            <button
                                type="button"
                                className="upload-preview-remove"
                                onClick={() => removeImage(index)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
