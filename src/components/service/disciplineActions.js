import axios from "axios";

const BASE_URL = "http://localhost:8080/api/disciplines";

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

export const getAllDisciplines = async (page = 0) => {
  try {
    const response = await api.get(BASE_URL, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error in getAllDisciplines:', error.response?.data || error.message);
    throw error;
  }
};

export const filterDisciplines = async (search = "", groupId = null, page = 0, pageSize = 5) => {
  try {
    const params = {
      search,
      page,
      size: pageSize 
    };
    
    if (groupId !== null) {
      params.groupId = groupId;
    }
    
    const response = await api.get(`${BASE_URL}/filter`, { params });
    return response.data;
  } catch (error) {
    console.error('Error in filterDisciplines:', error.response?.data || error.message);
    throw error;
  }
};

export const getDisciplineById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in getDisciplineById:', error.response?.data || error.message);
    throw error;
  }
};

export const saveDiscipline = async (disciplineData) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, disciplineData);
    return response.data;
  } catch (error) {
    console.error('Error in saveDiscipline:', error.response?.data || error.message);
    throw error;
  }
};

export const updateDiscipline = async (id, disciplineData) => {
  try {
    const response = await api.post(`${BASE_URL}/update/${id}`, disciplineData);
    return response.data;
  } catch (error) {
    console.error('Error in updateDiscipline:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteDiscipline = async (id) => {
  try {
    const response = await api.post(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in deleteDiscipline:', error.response?.data || error.message);
    throw error;
  }
};

export const addGroupsToDiscipline = async (disciplineId, groupIds) => {
  try {
    const promises = groupIds.map(groupId => 
      api.post(`${BASE_URL}/${disciplineId}/groups/${groupId}`)
    );
    const responses = await Promise.all(promises);

    return responses.map(r => r.data);
  } catch (error) {
    console.error('Error in addStudentsToGroup:', error.response?.data || error.message);
    throw error;
  }
};

export const removeGroupFromDiscipline = async (disciplineId, groupId) => {
  try {
    const response = await api.post(`${BASE_URL}/${disciplineId}/groups/remove/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error in removeGroupFromDiscipline:', error.response?.data || error.message);
    throw error;
  }
};

export const getDisciplineGroups = async (disciplineId) => {
  try {
    const response = await api.get(`${BASE_URL}/${disciplineId}/groups`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const addTeachersToDiscipline = async (disciplineId, teacherIds) => {
  try {
    const promises = teacherIds.map(teacherId =>
      api.post(`${BASE_URL}/${disciplineId}/teachers/${teacherId}`)
    );
    const responses = await Promise.all(promises);
    return responses.map(r => r.data);
  } catch (error) {
    console.error("Error in addTeachersToDiscipline:", error.response?.data || error.message);
    throw error;
  }
};

export const removeTeacherFromDiscipline = async (disciplineId, teacherId) => {
  try {
    const response = await api.post(`${BASE_URL}/${disciplineId}/teachers/remove/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error("Error in removeTeacherFromDiscipline:", error.response?.data || error.message);
    throw error;
  }
};

export const getDisciplinesTeacher = async (teacherId) => {
  try {
    const response = await api.get(`${BASE_URL}/teacher/${teacherId}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error in getDisciplineTeachers:", error.response?.data || error.message);
    throw error;
  }
};


export const GetDisciplinesByGroup = async (groupId) => {
  try {
    const response = await api.get(`${BASE_URL}/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error in GetDisciplinesByGroup:", error.response?.data || error.message);
    throw error;
  }
};