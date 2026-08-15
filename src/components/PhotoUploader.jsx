// ============================================================
// PHOTO UPLOADER
// ============================================================
// Real multi-file upload (not paste-a-URL) - select or drag
// multiple images, they upload immediately, and the resulting
// URLs are added to the variant's photo list. Shows thumbnails
// with a remove button.
// ============================================================

import { useState } from "react";
import { uploadImages } from "../api/api";

export default function PhotoUploader({ imageUrls, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    try {
      const result = await uploadImages(files);
      onChange([...(imageUrls || []), ...result.urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(index) {
    onChange((imageUrls || []).filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="photo-uploader-grid">
        {(imageUrls || []).map((url, i) => (
          <div className="photo-thumb" key={i}>
            <img src={url.startsWith("http") ? url : `http://localhost:5000${url}`} alt="" />
            <button type="button" className="photo-thumb-remove" onClick={() => removePhoto(i)}>&times;</button>
          </div>
        ))}
        <label className="photo-upload-btn">
          {uploading ? "..." : "+ Add Photos"}
          <input type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={uploading} hidden />
        </label>
      </div>
      {error && <p className="error-text" style={{ fontSize: 12 }}>{error}</p>}
    </div>
  );
}
