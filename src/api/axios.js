import axios from "axios";

export const BACKEND_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168."))
  ? "http://localhost:5000"
  : "https://gigflow-backend-p324.onrender.com";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true
});

export default api;
