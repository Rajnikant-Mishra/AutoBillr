import { getAuthToken } from "../utils/auth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

async function request(
  endpoint,
  options = {}
) {
  const token = getAuthToken();

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : {
              "Content-Type":
                "application/json",
            }),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Request failed"
    );
  }

  return data;
}

// ==========================================
// 1. BUSINESS & PROFILE SETTINGS (NEW)
// ==========================================

export async function getBusinessProfile() {
  return request("/settings/business");
}

export async function updateBusinessProfile(businessData) {
  return request("/settings/business", {
    method: "PUT",
    body: JSON.stringify(businessData),
  });
}


export async function getBranding() {
  return request("/settings/branding");
}

export async function updateBranding(
  branding
) {
  return request("/settings/branding", {
    method: "PUT",
    body: JSON.stringify({
      brandColor:
        branding.brandColor,
      showQr:
        branding.showQr,
      showThumbnails:
        branding.showThumbnails,
      showFooter:
        branding.showFooter,
    }),
  });
}

export async function uploadBrandingLogo(
  file
) {
  const formData = new FormData();

  formData.append("logo", file);

  return request(
    "/settings/branding/logo",
    {
      method: "POST",
      body: formData,
    }
  );
}

export async function deleteBrandingLogo() {
  return request(
    "/settings/branding/logo",
    {
      method: "DELETE",
    }
  );
}