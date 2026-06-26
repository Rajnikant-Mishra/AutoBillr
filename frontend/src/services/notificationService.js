// services/notificationService.js

import axios from "axios";

const API =
  "http://localhost:5000/api/notifications";

export const getNotificationsAPI = () =>
  axios.get(API);

export const createNotificationAPI = (
  data
) => axios.post(API, data);

export const markNotificationReadAPI = (
  id
) => axios.put(`${API}/${id}/read`);

export const markAllReadAPI = () =>
  axios.put(`${API}/read-all`);

export const clearNotificationsAPI = () =>
  axios.delete(`${API}/clear`);