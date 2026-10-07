
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import Cropper from "react-easy-crop";

import { getAuthToken } from "../../utils/auth";

import {
  showSuccessToast,
  showErrorToast,
} from "../ui/CustomToast";

import Button from "../ui/Button";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const API_ORIGIN = API_URL.replace(
  /\/api\/v1\/?$/,
  ""
);

// =====================================================
// GET FULL AVATAR URL
// =====================================================

const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar !== "string") {
    return null;
  }

  const cleanAvatar = avatar.trim();

  if (!cleanAvatar) {
    return null;
  }

  // Already a complete URL
  if (
    cleanAvatar.startsWith("http://") ||
    cleanAvatar.startsWith("https://")
  ) {
    return cleanAvatar;
  }

  // Backend absolute path
  if (cleanAvatar.startsWith("/")) {
    return `${API_ORIGIN}${cleanAvatar}`;
  }

  // Relative path
  return `${API_ORIGIN}/${cleanAvatar}`;
};

// =====================================================
// CREATE CROPPED IMAGE
// =====================================================

async function getCroppedImg(
  imageSrc,
  pixelCrop
) {
  const image = await createImage(imageSrc);

  const canvas =
    document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Could not create canvas"
    );
  }

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

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error(
              "Failed to create image"
            )
          );
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

// =====================================================
// CREATE IMAGE
// =====================================================

function createImage(url) {
  return new Promise(
    (resolve, reject) => {
      const img = new Image();

      img.onload = () =>
        resolve(img);

      img.onerror = () =>
        reject(
          new Error(
            "Failed to load image"
          )
        );

      img.crossOrigin =
        "anonymous";

      img.src = url;
    }
  );
}

// =====================================================
// PROFILE EDIT MODAL
// =====================================================

export default function ProfileEditModal({
  isOpen,
  onClose,
}) {
  const fileInputRef =
    useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
  });

  const [imageSrc, setImageSrc] =
    useState(null);

  const [croppedBlob, setCroppedBlob] =
    useState(null);

  const [crop, setCrop] =
    useState({
      x: 0,
      y: 0,
    });

  const [zoom, setZoom] =
    useState(1);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState(null);

  const [preview, setPreview] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingProfile,
    setLoadingProfile,
  ] = useState(false);

  const [
    showCropper,
    setShowCropper,
  ] = useState(false);

  // =====================================================
  // LOAD CURRENT PROFILE
  // =====================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      // -------------------------------------------------
      // RESET OLD DATA
      // -------------------------------------------------

      setForm({
        firstName: "",
        lastName: "",
      });

      setPreview(null);

      setImageSrc(null);

      setCroppedBlob(null);

      setShowCropper(false);

      setZoom(1);

      setCrop({
        x: 0,
        y: 0,
      });

      setCroppedAreaPixels(null);

      setLoadingProfile(true);

      try {
        const token = getAuthToken();

        if (!token) {
          throw new Error(
            "Authentication required"
          );
        }

        // -------------------------------------------------
        // GET PROFILE
        // -------------------------------------------------

        const response =
          await fetch(
            `${API_URL}/users/me`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${token}`,
                Accept:
                  "application/json",
              },

              cache: "no-store",
            }
          );

        const data =
          await response.json();

        console.log(
          "PROFILE GET RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load profile"
          );
        }

        const user = data?.user;

        if (!user) {
          throw new Error(
            "User profile not found"
          );
        }

        if (cancelled) {
          return;
        }

        // -------------------------------------------------
        // SET NAME
        // -------------------------------------------------

        setForm({
          firstName:
            user.firstName || "",
          lastName:
            user.lastName || "",
        });

        // -------------------------------------------------
        // SET AVATAR
        // -------------------------------------------------

        const avatarUrl =
          getAvatarUrl(
            user.avatar
          );

        setPreview(avatarUrl);

        console.log(
          "PROFILE LOADED:",
          {
            firstName:
              user.firstName,
            lastName:
              user.lastName,
            avatar:
              user.avatar,
            avatarUrl,
          }
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "LOAD PROFILE ERROR:",
          error
        );

        showErrorToast(
          error.message ||
            "Failed to load profile"
        );

        setForm({
          firstName: "",
          lastName: "",
        });

        setPreview(null);
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // =====================================================
  // CROP COMPLETE
  // =====================================================

  const onCropComplete =
    useCallback(
      (_, croppedAreaPixels) => {
        setCroppedAreaPixels(
          croppedAreaPixels
        );
      },
      []
    );

  // =====================================================
  // IMAGE CLICK
  // =====================================================

  const handleImageClick =
    () => {
      if (
        loading ||
        loadingProfile
      ) {
        return;
      }

      fileInputRef.current?.click();
    };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // Image type
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      showErrorToast(
        "Please select an image file"
      );

      e.target.value = "";

      return;
    }

    // Maximum 5MB
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      showErrorToast(
        "Image must be less than 5MB"
      );

      e.target.value = "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setImageSrc(
        reader.result
      );

      setShowCropper(true);

      setCrop({
        x: 0,
        y: 0,
      });

      setZoom(1);

      setCroppedAreaPixels(
        null
      );
    };

    reader.onerror = () => {
      showErrorToast(
        "Failed to read image"
      );
    };

    reader.readAsDataURL(file);

    // Allow selecting same file again
    e.target.value = "";
  };

  // =====================================================
  // APPLY CROP
  // =====================================================

  const handleApplyCrop =
    async () => {
      if (
        !imageSrc ||
        !croppedAreaPixels
      ) {
        showErrorToast(
          "Please select a crop area"
        );

        return;
      }

      try {
        const blob =
          await getCroppedImg(
            imageSrc,
            croppedAreaPixels
          );

        // Revoke old temporary preview
        if (
          preview?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            preview
          );
        }

        const previewUrl =
          URL.createObjectURL(
            blob
          );

        setPreview(previewUrl);

        setCroppedBlob(blob);

        setShowCropper(false);

        setImageSrc(null);
      } catch (error) {
        console.error(
          "CROP ERROR:",
          error
        );

        showErrorToast(
          "Failed to crop image"
        );
      }
    };

  // =====================================================
  // CANCEL CROP
  // =====================================================

  const handleCancelCrop =
    () => {
      setShowCropper(false);

      setImageSrc(null);

      setCroppedAreaPixels(
        null
      );

      setZoom(1);

      setCrop({
        x: 0,
        y: 0,
      });
    };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async (
    e
  ) => {
    e.preventDefault();

    if (
      !form.firstName.trim()
    ) {
      showErrorToast(
        "First name is required"
      );

      return;
    }

    try {
      setLoading(true);

      const token =
        getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication required"
        );
      }

      // -------------------------------------------------
      // FORMDATA
      // -------------------------------------------------

      const formData =
        new FormData();

      formData.append(
        "firstName",
        form.firstName.trim()
      );

      formData.append(
        "lastName",
        form.lastName.trim()
      );

      // -------------------------------------------------
      // ADD AVATAR ONLY WHEN CHANGED
      // -------------------------------------------------

      if (
        croppedBlob instanceof Blob
      ) {
        formData.append(
          "avatar",
          croppedBlob,
          "avatar.jpg"
        );
      }

      console.log(
        "UPDATING PROFILE..."
      );

      // -------------------------------------------------
      // UPDATE PROFILE
      // -------------------------------------------------

      const response =
        await fetch(
          `${API_URL}/users/profile`,
          {
            method: "PUT",

            headers: {
              Authorization: `Bearer ${token}`,
              Accept:
                "application/json",
            },

            // DO NOT manually set Content-Type
            body: formData,
          }
        );

      const text =
        await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch (
        parseError
      ) {
        console.error(
          "INVALID SERVER RESPONSE:",
          text
        );

        throw new Error(
          "Invalid server response"
        );
      }

      console.log(
        "PROFILE UPDATE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update profile"
        );
      }

      // -------------------------------------------------
      // UPDATE PREVIEW FROM RESPONSE
      // -------------------------------------------------

      if (
        data?.user?.avatar
      ) {
        const avatarUrl =
          getAvatarUrl(
            data.user.avatar
          );

        setPreview(avatarUrl);
      }

      showSuccessToast(
        "Profile updated",
        "Your changes have been saved"
      );

      // -------------------------------------------------
      // CLOSE
      // Parent will reload profile
      // -------------------------------------------------

      onClose();
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      showErrorToast(
        error.message ||
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    // Revoke temporary blob URL
    if (
      preview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        preview
      );
    }

    setImageSrc(null);

    setCroppedBlob(null);

    setShowCropper(false);

    onClose();
  };

  // =====================================================
  // DON'T RENDER WHEN CLOSED
  // =====================================================

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // INITIALS
  //
  // John Smith -> JS
  // John -> J
  // No name -> U
  // =====================================================

  const initials =
    `${form.firstName?.[0] || ""}${
      form.lastName?.[0] || ""
    }`.toUpperCase() || "U";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* =================================================
          BACKDROP
      ================================================= */}

      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* =================================================
          MODAL
      ================================================= */}

      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">

          <h3 className="text-lg font-bold">
            {showCropper
              ? "Crop photo"
              : "Edit profile"}
          </h3>

          <button
            type="button"
            onClick={handleClose}
            disabled={
              loading ||
              loadingProfile
            }
            className="w-8 h-8 rounded-full hover:bg-surface-hover grid place-items-center"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* =================================================
            LOADING PROFILE
        ================================================= */}

        {loadingProfile ? (
          <div className="p-8 flex flex-col items-center justify-center">

            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />

            <p className="mt-4 text-sm text-text-muted">
              Loading profile...
            </p>
          </div>
        ) : showCropper ? (

          /* =================================================
             CROPPER
          ================================================= */

          <div className="p-4">

            <div className="relative w-full h-72 bg-black rounded-xl overflow-hidden">

              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={
                  setCrop
                }
                onZoomChange={
                  setZoom
                }
                onCropComplete={
                  onCropComplete
                }
                cropShape="round"
                showGrid={false}
              />
            </div>

            {/* ZOOM */}

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
                onChange={(e) =>
                  setZoom(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="flex-1 accent-primary"
              />

              <span className="material-symbols-outlined text-text-muted text-[20px]">
                zoom_in
              </span>
            </div>

            {/* CROP BUTTONS */}

            <div className="flex gap-3 mt-6">

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={
                  handleCancelCrop
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                fullWidth
                onClick={
                  handleApplyCrop
                }
              >
                Apply
              </Button>
            </div>
          </div>
        ) : (

          /* =================================================
             EDIT FORM
          ================================================= */

          <form
            onSubmit={handleSave}
            className="p-6"
          >

            {/* =================================================
                AVATAR
            ================================================= */}

            <div className="flex flex-col items-center mb-6">

              <button
                type="button"
                onClick={
                  handleImageClick
                }
                disabled={loading}
                className="relative group"
              >

                {/* PROFILE IMAGE */}

                {preview ? (
                  <img
                    key={preview}
                    src={preview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow"
                    onError={(e) => {
                      console.error(
                        "PROFILE MODAL AVATAR ERROR:",
                        preview
                      );

                      // Hide broken image
                      e.currentTarget.style.display =
                        "none";

                      // Show initials
                      const fallback =
                        e.currentTarget
                          .nextElementSibling;

                      if (
                        fallback
                      ) {
                        fallback.style.display =
                          "grid";
                      }
                    }}
                  />
                ) : null}

                {/* INITIAL FALLBACK */}

                <div
                  className={`w-24 h-24 rounded-full bg-primary text-white place-items-center text-2xl font-bold border-4 border-surface shadow ${
                    preview
                      ? "hidden"
                      : "grid"
                  }`}
                >
                  {initials}
                </div>

                {/* CAMERA OVERLAY */}

                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                  <span className="material-symbols-outlined text-white text-[28px]">
                    photo_camera
                  </span>

                </div>
              </button>

              {/* CHANGE PHOTO */}

              <button
                type="button"
                onClick={
                  handleImageClick
                }
                disabled={loading}
                className="mt-3 text-sm font-semibold text-primary hover:underline"
              >
                Change profile photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  handleImageChange
                }
              />
            </div>

            {/* =================================================
                NAME FIELDS
            ================================================= */}

            <div className="space-y-4">

              {/* FIRST NAME */}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  First name
                </label>

                <input
                  name="firstName"
                  value={
                    form.firstName
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        firstName:
                          e.target
                            .value,
                      })
                    )
                  }
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="First name"
                />
              </div>

              {/* LAST NAME */}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Last name
                </label>

                <input
                  name="lastName"
                  value={
                    form.lastName
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        lastName:
                          e.target
                            .value,
                      })
                    )
                  }
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="flex gap-3 mt-8">

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={
                  handleClose
                }
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                fullWidth
                disabled={
                  loading ||
                  loadingProfile
                }
              >
                {loading
                  ? "Saving..."
                  : "Save"}
              </Button>

            </div>
          </form>
        )}
      </div>
    </div>
  );
}
