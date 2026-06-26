import axios from "axios";

const API = "http://localhost:5000/api/clients";

export const createClient = (data) =>
  axios.post(API, data);

export const getClients = () =>
  axios.get(API);

export const updateClient = (id, data) =>
  axios.put(`${API}/${id}`, data);