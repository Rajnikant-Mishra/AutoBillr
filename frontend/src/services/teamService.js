// // src/services/teamService.js

// import axios from "axios";

// import { getAuthToken } from "../utils/auth";

// /*
// |--------------------------------------------------------------------------
// | API BASE URL
// |--------------------------------------------------------------------------
// |
// | .env:
// |
// | VITE_API_URL=http://localhost:5000/api/v1
// |
// | If env is missing, localhost backend is used.
// |--------------------------------------------------------------------------
// */

// const API_BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000/api/v1";

// const API_URL =
//   `${API_BASE_URL}/team`;

// /*
// |--------------------------------------------------------------------------
// | AXIOS CONFIG
// |--------------------------------------------------------------------------
// */

// const getConfig = () => {
//   const token =
//     getAuthToken();

//   const headers = {
//     "Content-Type":
//       "application/json",
//   };

//   /*
//    * Only send Authorization if token exists.
//    */
//   if (token) {
//     headers.Authorization =
//       `Bearer ${token}`;
//   }

//   return {
//     headers,
//   };
// };

// /*
// |--------------------------------------------------------------------------
// | INVITE MEMBER
// |--------------------------------------------------------------------------
// */

// export const inviteTeamMember =
//   async (payload) => {
//     const response =
//       await axios.post(
//         `${API_URL}/invite`,
//         payload,
//         getConfig()
//       );

//     return response.data;
//   };
// /* 
// |--------------------------------------------------------------------------
// | ACCEPT TEAM INVITATION
// |--------------------------------------------------------------------------
// */

// export const acceptTeamInvitation = async (token) => {
//   const response = await axios.post(
//     `${API_URL}/accept-invitation`,
//     {
//       token,
//     }
//   );

//   return response.data;
// };
// /*
// |--------------------------------------------------------------------------
// | GET MEMBERS
// |--------------------------------------------------------------------------
// */

// export const getTeamMembers =
//   async () => {
//     const response =
//       await axios.get(
//         API_URL,
//         getConfig()
//       );

//     return response.data;
//   };

// /*
// |--------------------------------------------------------------------------
// | GET STATS
// |--------------------------------------------------------------------------
// */

// export const getTeamStats =
//   async () => {
//     const response =
//       await axios.get(
//         `${API_URL}/stats`,
//         getConfig()
//       );

//     return response.data;
//   };

// /*
// |--------------------------------------------------------------------------
// | UPDATE ROLE
// |--------------------------------------------------------------------------
// */

// export const updateMemberRole =
//   async (id, role) => {
//     const response =
//       await axios.patch(
//         `${API_URL}/${id}/role`,
//         {
//           role,
//         },
//         getConfig()
//       );

//     return response.data;
//   };

// /*
// |--------------------------------------------------------------------------
// | DELETE MEMBER
// |--------------------------------------------------------------------------
// */

// export const deleteTeamMember =
//   async (id) => {
//     const response =
//       await axios.delete(
//         `${API_URL}/${id}`,
//         getConfig()
//       );

//     return response.data;
//   };












// src/services/teamService.js

import axios from "axios";
import { getAuthToken } from "../utils/auth";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const API_URL = `${API_BASE_URL}/team`;

/*
|--------------------------------------------------------------------------
| AXIOS CONFIG (always send Bearer token when available)
|--------------------------------------------------------------------------
*/

const getConfig = () => {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { headers };
};

/*
|--------------------------------------------------------------------------
| Normalize API errors → never throw raw axios error to UI
|--------------------------------------------------------------------------
*/

const handleError = (error) => {
  const status = error?.response?.status || null;
  const data = error?.response?.data || {};

  return {
    success: false,
    message:
      data?.message ||
      error?.message ||
      "Request failed",
    code: data?.code || null,
    status,
    data: null,
  };
};

/*
|--------------------------------------------------------------------------
| INVITE MEMBER
| POST /api/v1/team/invite
|--------------------------------------------------------------------------
*/

export const inviteTeamMember = async (payload) => {
  try {
    const token = getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "Session expired. Please login again.",
        code: "NO_TOKEN",
        status: 401,
        data: null,
      };
    }

    const response = await axios.post(
      `${API_URL}/invite`,
      payload,
      getConfig()
    );

    const body = response.data;

    // Backend returns { success, data, message }
    if (body && body.success === false) {
      return {
        success: false,
        message: body.message || "Unable to send invitation",
        code: body.code || null,
        status: response.status,
        data: null,
      };
    }

    return {
      success: true,
      message: body?.message || "Invitation sent",
      data: body?.data ?? body?.member ?? body,
    };
  } catch (error) {
    console.error(
      "inviteTeamMember error:",
      error?.response?.data || error.message
    );
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| ACCEPT TEAM INVITATION (public – no auth)
| POST /api/v1/team/accept-invitation
|--------------------------------------------------------------------------
*/

export const acceptTeamInvitation = async (token) => {
  try {
    const response = await axios.post(`${API_URL}/accept-invitation`, {
      token,
    });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET MEMBERS
| GET /api/v1/team
|--------------------------------------------------------------------------
*/

export const getTeamMembers = async () => {
  try {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET STATS
| GET /api/v1/team/stats
|--------------------------------------------------------------------------
*/

export const getTeamStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`, getConfig());
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROLE
| PATCH /api/v1/team/:id/role
|--------------------------------------------------------------------------
*/

export const updateMemberRole = async (id, role) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/role`,
      { role },
      getConfig()
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE MEMBER
| DELETE /api/v1/team/:id
|--------------------------------------------------------------------------
*/

export const deleteTeamMember = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getConfig());
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT USER PERMISSIONS
| GET /api/v1/team/me
|--------------------------------------------------------------------------
*/

export const getTeamMe = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, getConfig());
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROLE PERMISSIONS
| PATCH /api/v1/team/roles/:id
|--------------------------------------------------------------------------
*/

export const updateRolePermissions = async (roleId, permissions) => {
  try {
    const response = await axios.patch(
      `${API_URL}/roles/${roleId}`,
      { permissions },
      getConfig()
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MEMBER EXTRA PERMISSIONS
| PATCH /api/v1/team/:id/permissions
|--------------------------------------------------------------------------
*/

export const updateMemberExtraPermissions = async (
  memberId,
  extraPermissions
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${memberId}/permissions`,
      { extraPermissions },
      getConfig()
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};