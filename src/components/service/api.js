import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
  withCredentials: true
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    

    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['ngrok-skip-browser-warning'] = 'true';
    config.headers['bypass-tunnel-reminder'] = 'true';
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      
      window.location.href = "/"; 
    }
    
    return Promise.reject(error);
  }
);
export default api;