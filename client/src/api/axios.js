import axios from "axios";

const instance = axios.create({
  baseURL: "https://talks-pct-resistance-example.trycloudflare.com/", // <-- adjust to your backend prefix
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
