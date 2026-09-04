import axios from "axios";
import { getAuthToken } from "../utils/auth";

const API_URL = `${import.meta.env.VITE_API_URL}/clients`;

const getConfig = () => {
  const token = getAuthToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// GET all clients
export const getClients = async () => {
  const response = await axios.get(API_URL, getConfig());
  return response.data;
};

// GET client by ID
export const getClientById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;
};

// CREATE client
export const createClient = async (clientData) => {
  const response = await axios.post(
    API_URL,
    clientData,
    getConfig()
  );

  return response.data;
};

// UPDATE client
export const updateClient = async (id, clientData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    clientData,
    getConfig()
  );

  return response.data;
};

// DELETE client
export const deleteClient = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;
};