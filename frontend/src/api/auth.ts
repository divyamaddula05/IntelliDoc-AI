import axios from "axios";

export const API = axios.create({
  baseURL: "https://intellidoc-ai-backend.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => API.post("/auth/register", data);

export const loginUser = (data: {
  email: string;
  password: string;
}) => API.post("/auth/login", data);