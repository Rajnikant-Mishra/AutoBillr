import axios from "axios";
import { getAuthToken } from "../utils/auth";

const API = `${import.meta.env.VITE_API_URL}/notifications`;

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    "Content-Type": "application/json",
  },
});

export const getNotificationsAPI = () =>
  axios.get(API, getConfig());

export const createNotificationAPI = (data) =>
  axios.post(API, data, getConfig());

export const markNotificationReadAPI = (id) =>
  axios.put(`${API}/${id}/read`, {}, getConfig());

export const markAllReadAPI = () =>
  axios.put(`${API}/read-all`, {}, getConfig());

export const clearNotificationsAPI = () =>
  axios.delete(`${API}/clear`, getConfig());