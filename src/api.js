// api.js
import axios from "axios";

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: "http://localhost:8001", // <-- your backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;