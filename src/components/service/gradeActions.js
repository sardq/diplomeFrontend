import axios from "axios";

const BASE_URL = "http://localhost:8080/api/grades";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
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

export const getAllGrades = async (page = 0) => {
    const response = await api.get(BASE_URL, { params: { page } });
    return response.data;
};

export const getGrade = async (exerciseId, studentId) => {
    const response = await api.get(`${BASE_URL}/exercise/${exerciseId}/${studentId}`);
    return response.data;
};

export const createGrade = async (gradeData) => {
    const response = await api.post(`${BASE_URL}`, gradeData);
    console.log(response);
    return response.data;
};

export const updateGrade = async (id, gradeData) => {
    const response = await api.put(`${BASE_URL}/${id}`, gradeData);
    return response.data;
};

export const deleteGrade = async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
};
export async function getByGroupAndDiscipline(groupId, disciplineId) {

  const res = await api.get(`${BASE_URL}/group/${groupId}/discipline/${disciplineId}`);
  console.log(res.data);

  return res.data;
}
