// api.js
import axios from "axios";

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: "/backend",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;