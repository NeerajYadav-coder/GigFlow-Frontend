import axios from "axios";

export const BACKEND_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://gigflow-backend-p324.onrender.com";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true
});

export default api;
