// src/services/teamService.js

import axios from "axios";

import { getAuthToken } from "../utils/auth";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
|
| .env:
|
| VITE_API_URL=http://localhost:5000/api/v1
|
| If env is missing, localhost backend is used.
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const API_URL =
  `${API_BASE_URL}/team`;

/*
|--------------------------------------------------------------------------
| AXIOS CONFIG
|--------------------------------------------------------------------------
*/

const getConfig = () => {
  const token =
    getAuthToken();

  const headers = {
    "Content-Type":
      "application/json",
  };

  /*
   * Only send Authorization if token exists.
   */
  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return {
    headers,
  };
};

/*
|--------------------------------------------------------------------------
| INVITE MEMBER
|--------------------------------------------------------------------------
*/

export const inviteTeamMember =
  async (payload) => {
    const response =
      await axios.post(
        `${API_URL}/invite`,
        payload,
        getConfig()
      );

    return response.data;
  };
/* 
|--------------------------------------------------------------------------
| ACCEPT TEAM INVITATION
|--------------------------------------------------------------------------
*/

export const acceptTeamInvitation = async (token) => {
  const response = await axios.post(
    `${API_URL}/accept-invitation`,
    {
      token,
    }
  );

  return response.data;
};
/*
|--------------------------------------------------------------------------
| GET MEMBERS
|--------------------------------------------------------------------------
*/

export const getTeamMembers =
  async () => {
    const response =
      await axios.get(
        API_URL,
        getConfig()
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET STATS
|--------------------------------------------------------------------------
*/

export const getTeamStats =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/stats`,
        getConfig()
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
*/

export const updateMemberRole =
  async (id, role) => {
    const response =
      await axios.patch(
        `${API_URL}/${id}/role`,
        {
          role,
        },
        getConfig()
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| DELETE MEMBER
|--------------------------------------------------------------------------
*/

export const deleteTeamMember =
  async (id) => {
    const response =
      await axios.delete(
        `${API_URL}/${id}`,
        getConfig()
      );

    return response.data;
  };