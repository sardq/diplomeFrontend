import {jwtDecode} from "jwt-decode";

export const getCurrentUserFromToken = () => {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (e) {
    console.error("Ошибка при декодировании токена:", e);
    return null;
  }
};
export const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  if (decoded && decoded.role) {
    return decoded.role;
  }
  return null;
};
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    return null;
  }
};
