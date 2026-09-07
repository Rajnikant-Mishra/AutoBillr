import { useState, useEffect, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCurrentUser, setCurrentUser, getAuthToken } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../ui/CustomToast";
import Button from "../ui/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Helper: create cropped image as blob
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

export default function ProfileEditModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ firstName: "", lastName: "" });
  const [imageSrc, setImageSrc] = useState(null); // original selected image (base64)
  const [croppedBlob, setCroppedBlob] = useState(null); // final cropped blob for upload
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [preview, setPreview] = useState(null); // final preview url
  const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  // Reset form only when modal opens (NO user object in deps → no infinite loop)
  useEffect(() => {
    if (!isOpen) return;

    const currentUser = getCurrentUser();

    if (currentUser) {
      setForm({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
      });
      setPreview(currentUser.avatar || null);
    }

    // reset crop state
    setImageSrc(null);
    setCroppedBlob(null);
    setShowCropper(false);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
  }, [isOpen]);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    // allow selecting the same file again
    e.target.value = "";
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(blob);

      setPreview(previewUrl);
      setCroppedBlob(blob);
      setShowCropper(false);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to crop image");
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.firstName.trim()) {
      showErrorToast("First name is required");
      return;
    }

    try {
      setLoading(true);

      const token = getAuthToken();
      const formData = new FormData();

      formData.append("firstName", form.firstName.trim());
      formData.append("lastName", form.lastName.trim());

      // only append avatar if user cropped a new image
      if (croppedBlob instanceof Blob) {
        formData.append("avatar", croppedBlob, "avatar.jpg");
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type when sending FormData
        },
        body: formData,
      });

      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const currentUser = getCurrentUser() || {};

      // Build full avatar URL if backend returned a relative path
      let avatarUrl = data.user?.avatar || preview;
      if (avatarUrl && avatarUrl.startsWith("/uploads")) {
        avatarUrl = `http://localhost:5000${avatarUrl}`;
      }

      setCurrentUser({
        ...currentUser,
        firstName: data.user?.firstName || form.firstName.trim(),
        lastName: data.user?.lastName || form.lastName.trim(),
        avatar: avatarUrl,
      });

      showSuccessToast("Profile updated", "Your changes have been saved");
      onClose();
    } catch (err) {
      console.error(err);
      showErrorToast(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const initials =
    `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-bold">
            {showCropper ? "Crop photo" : "Edit profile"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-hover grid place-items-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {showCropper ? (
          /* ================= CROPPER VIEW ================= */
          <div className="p-4">
            <div className="relative w-full h-72 bg-black rounded-xl overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>

            {/* Zoom slider */}
            <div className="mt-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-text-muted text-[20px]">
                zoom_out
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="material-symbols-outlined text-text-muted text-[20px]">
                zoom_in
              </span>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleCancelCrop}
              >
                Cancel
              </Button>
              <Button type="button" fullWidth onClick={handleApplyCrop}>
                Apply
              </Button>
            </div>
          </div>
        ) : (
          /* ================= EDIT FORM VIEW ================= */
          <form onSubmit={handleSave} className="p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <button
                type="button"
                onClick={handleImageClick}
                className="relative group"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-soft text-primary-dark grid place-items-center text-2xl font-bold border-4 border-surface shadow">
                    {initials}
                  </div>
                )}

                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[28px]">
                    photo_camera
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleImageClick}
                className="mt-3 text-sm font-semibold text-primary hover:underline"
              >
                Change profile photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Name fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  First name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Last name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}