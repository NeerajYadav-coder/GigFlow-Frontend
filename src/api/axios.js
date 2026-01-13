import axios from "axios";

const api = axios.create({
  baseURL: "https://gigflow-backend-p324.onrender.com/api",
  withCredentials: true
});

export default api;
