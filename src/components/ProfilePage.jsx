import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api"; // твой axios с JWT

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me") 
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500 text-xl">Загрузка профиля...</span>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        {/* Аватарка и имя */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex justify-center items-center text-gray-400 text-2xl font-bold">
            {user.username[0].toUpperCase()} {/* placeholder инициал */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div>
            <span className="font-semibold">Дата регистрации:</span>
            <p>{formatDate(user.registrationDate)}</p>
          </div>
          <div>
            <span className="font-semibold">Дата рождения:</span>
            <p>{formatDate(user.birthDate)}</p>
          </div>
        </div>

        {/* Кнопка перенастройки тегов */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/preferences")}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-md"
          >
            Настроить любимые теги
          </button>
        </div>
      </div>
    </div>
  );
}