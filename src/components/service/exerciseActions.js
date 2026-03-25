import axios from "axios";

const BASE_URL = "http://localhost:8080/api/exercises";

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
        } else {
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const getAllExercises = async (page = 0) => {
    const response = await api.get(BASE_URL, { params: { page } });
    return response.data;
};

export const getByDisciplineAndGroup = async (disciplineId,groupId) => {
 const response = await api.get(`${BASE_URL}/by-discipline-group/${disciplineId}/${groupId}`);
    return response.data;
};
export const getByDisciplineAndGroupPage = async (disciplineId, groupId, page = 0, size = 5) => {
  const response = await api.get(`${BASE_URL}/by-discipline-group/${disciplineId}/${groupId}/page`, {
    params: { page, size }
  });
  if (response === null) return response;
  return response.data;
};

export const saveExercise = async (exerciseData) => {
    const response = await api.post(`${BASE_URL}/create`, exerciseData);
    return response.data;
};

export const updateExercise = async (id, exerciseData) => {
    const response = await api.post(`${BASE_URL}/update/${id}`, exerciseData);
    console.log(response);
    return response.data;
};

export const deleteExercise = async (id) => {
    const response = await api.post(`${BASE_URL}/delete/${id}`);
    console.log(response);

    return response.data;
};