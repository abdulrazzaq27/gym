import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  // baseURL: 'http://localhost:3000',
  baseURL: API_BASE_URL,
  // baseURL: "http://192.168.10.110:3000",
});

// attach token before every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
