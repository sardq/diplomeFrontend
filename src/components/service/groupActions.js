import axios from "axios";

const BASE_URL = "http://localhost:8080/api/groups";

const api = axios.create({
  baseURL: "http://localhost:8080",
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - удаление токена');
    }
    return Promise.reject(error);
  }
);

export const getAllGroups = async (page = 0) => {
  try {
    const response = await api.get(BASE_URL, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error in getAllGroups:', error.response?.data || error.message);
    throw error;
  }
};

export const filterGroups = async (search = "", disciplineId = null, page = 0, pageSize = 5) => {
  try {
    const params = {
      search,
      page,
      pageSize
    };
    
    if (disciplineId !== null) {
      params.disciplineId = disciplineId;
    }
    
    const response = await api.get(`${BASE_URL}/filter`, { params });
    return response.data;
  } catch (error) {
    console.error('Error in filterGroups:', error.response?.data || error.message);
    throw error;
  }
};

export const getGroupById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in getGroupById:', error.response?.data || error.message);
    throw error;
  }
};

export const saveGroup = async (groupData) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error in saveGroup:', error.response?.data || error.message);
    throw error;
  }
};

export const updateGroup = async (id, groupData) => {
  try {
    const response = await api.post(`${BASE_URL}/update/${id}`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error in updateGroup:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const response = await api.post(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in deleteGroup:', error.response?.data || error.message);
    throw error;
  }
};

export const addStudentsToGroup = async (groupId, studentIds) => {
  try {
    const promises = studentIds.map(studentId => 
      api.post(`${BASE_URL}/${groupId}/students/${studentId}`)
    );
    const responses = await Promise.all(promises);
    return responses.map(r => r.data);
  } catch (error) {
    console.error('Error in addStudentsToGroup:', error.response?.data || error.message);
    throw error;
  }
};

export const removeStudentFromGroup = async (groupId, studentId) => {
  try {
    const response = await api.post(
  `${BASE_URL}/${groupId}/students/remove/${studentId}`,
  null,
  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
);
    return response.data;
  } catch (error) {
    console.error('Error in removeStudentFromGroup:', error.response?.data || error.message);
    throw error;
  }
};

export const getGroupStudents = async (groupId) => {
  try {
    const response = await api.get(`${BASE_URL}/${groupId}/students`);
    return response.data;
  } catch (error) {
    console.error('Error in getGroupStudents:', error.response?.data || error.message);
    throw error;
  }
};