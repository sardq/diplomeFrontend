import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080/api' 
    : '/api'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;