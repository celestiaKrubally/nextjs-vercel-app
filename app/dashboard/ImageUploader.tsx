"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ImageUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [captions, setCaptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setCaptions([]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setCaptions([]);

        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Not logged in");

            const BASE = "https://api.almostcrackd.ai";
            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            // Step 1: Get presigned URL
            setStatus("Getting upload URL...");
            const presignRes = await fetch(`${BASE}/pipeline/generate-presigned-url`, {
                method: "POST",
                headers,
                body: JSON.stringify({ contentType: file.type }),
            });
            if (!presignRes.ok) throw new Error(`Presign failed: ${await presignRes.text()}`);
            const { presignedUrl, cdnUrl } = await presignRes.json();

            // Step 2: Upload image bytes to presigned URL
            setStatus("Uploading image...");
            const uploadRes = await fetch(presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

            // Step 3: Register image URL
            setStatus("Registering image...");
            const registerRes = await fetch(`${BASE}/pipeline/upload-image-from-url`, {
                method: "POST",
                headers,
                body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
            });
            if (!registerRes.ok) throw new Error(`Register failed: ${await registerRes.text()}`);
            const { imageId } = await registerRes.json();

            // Step 4: Generate captions
            setStatus("Generating captions...");
            const captionRes = await fetch(`${BASE}/pipeline/generate-captions`, {
                method: "POST",
                headers,
                body: JSON.stringify({ imageId }),
            });
            if (!captionRes.ok) throw new Error(`Caption failed: ${await captionRes.text()}`);
            const captionData = await captionRes.json();

            const texts = Array.isArray(captionData)
                ? captionData.map((c: any) => c.content ?? c.caption ?? c.text ?? JSON.stringify(c))
                : [JSON.stringify(captionData)];
            setCaptions(texts);
            setStatus("");
        } catch (err: any) {
            setError(err.message);
            setStatus("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5 mb-8">
            <h2 className="text-xl font-bold text-gray-800">📸 Upload Image for Captions</h2>

            <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                onChange={handleFile}
                className="text-sm text-gray-600"
            />

            {preview && (
                <img src={preview} alt="Preview" className="rounded-lg max-h-64 object-contain border border-gray-200" />
            )}

            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? status || "Processing..." : "Generate Captions"}
            </button>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
            )}

            {captions.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-gray-700">Generated Captions:</h3>
                    {captions.map((c, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm">
                            {c}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}