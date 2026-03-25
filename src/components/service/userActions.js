import axios from "axios";

const BASE_URL = "http://localhost:8080/api/users";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && token !== 'null' && token !== 'undefined') {
            config.headers.Authorization = `Bearer ${token}`;
        } 
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const filterUsers = async (search = "", role = "", page = 0, pageSize = 10) => {
    try {
        
        const response = await api.get(`${BASE_URL}/filter`, {
            params: {
                search,
                role,
                page,
                size: pageSize
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Ошибка запроса пользователей:', {
            url: error.config?.url, 
            status: error.response?.status,
            message: error.response?.data || error.message,
            headers: error.config?.headers
        });
        
        if (error.response?.status === 401) {
            alert('Сессия истекла. Пожалуйста, войдите снова.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        throw error;
    }
};
export const filterUserWithoutGroup = async (search = "", page = 0, pageSize = 10) => {
        
        const response = await api.get(`${BASE_URL}/students/without-group/search`, {
            params: {
                search,
                page,
                size: pageSize
            }
        });
        
        return response.data;
};
export const getAllUsers = async (page = 0) => {
    const response = await api.get(BASE_URL, { params: { page } });
    return response.data;
};

export const saveUser = async (userData) => {
    const response = await api.post(`${BASE_URL}/create`, userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await api.post(`${BASE_URL}/update/${id}`, userData);
    return response.data;
};
export const updateAdmin = async (id, userData) => {
    const response = await api.put(`${BASE_URL}/update/${id}`, userData);
    return response.data;
};
export const deleteUser = async (id) => {
    const response = await api.post(`${BASE_URL}/delete/${id}`);
    return response.data;
};
export const getMe = async () => {
    const response = await api.get(`${BASE_URL}/me`);
    return response.data;
};