import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newBirthDate, setNewBirthDate] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    api.get("/interactions/favorites")
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error(err));

    loadReviews(0);
  }, []);
  const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Валидация на фронте (не больше 5МБ)
  if (file.size > 5 * 1024 * 1024) {
    alert("Файл слишком большой! Максимум 5МБ");
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // Имя 'file' должно совпадать с @RequestParam("file") в Java

    try {
      const res = await api.post("/users/avatar", formData, {
        // ВАЖНО: Убираем ручной Content-Type, Axios сам его поставит правильно для FormData
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      // Обновляем картинку в интерфейсе
      setUser({ ...user, avatarUrl: res.data });
      alert("Аватар успешно обновлен!");
    } catch (err) {
      console.error("Ошибка загрузки:", err.response?.data || err.message);
      alert("Ошибка загрузки. Проверьте консоль.");
    } 
  };
  const loadUserData = () => {
    api.get("/auth/me")
      .then((res) => {
        setUser(res.data);
        if (res.data.birthDate) {
          setNewBirthDate(new Date(res.data.birthDate).toISOString().split('T')[0]);
        }
      })
      .catch((err) => console.error(err));
  };

  // === ФУНКЦИЯ СОХРАНЕНИЯ ДАТЫ ===
  const saveBirthDate = () => {
    api.put("/users/update-birthdate", { birthDate: newBirthDate })
      .then(() => {
        setIsEditingDate(false);
        loadUserData();
      })
      .catch((err) => {
        console.error("Ошибка при обновлении даты:", err);
        alert("Не удалось сохранить дату");
      });
  };

  const loadReviews = (page) => {
    api.get(`/interactions/reviews/my?page=${page}&size=5`)
      .then((res) => {
        if (res.data.length < 5) setHasMoreReviews(false);
        setReviews((prev) => [...prev, ...res.data]);
        setReviewsPage(page);
      })
      .catch((err) => console.error(err));
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500 text-xl">Загрузка профиля...</span>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "Не указана";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        
        {/* Шапка профиля */}
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="relative group cursor-pointer">
            <img 
              src={user.avatarUrl} 
              alt = {user.username[0].toUpperCase()}
              className="w-24 h-24 rounded-full object-cover" 
            />
            <input 
              type="file" 
              onChange={handleAvatarChange} 
              className="hidden" 
              id="avatarInput" 
            />
            <label htmlFor="avatarInput" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                Сменить фото
            </label>
        </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Инфо о пользователе */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Дата регистрации</span>
            <p className="text-gray-800 font-medium">{formatDate(user.registrationDate)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Дата рождения</span>
            
            {isEditingDate ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="date"
                  value={newBirthDate}
                  onChange={(e) => setNewBirthDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-400 outline-none"
                />
                <button 
                  onClick={saveBirthDate}
                  className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-green-600 transition"
                >
                  OK
                </button>
                <button 
                  onClick={() => setIsEditingDate(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-gray-800 font-medium">{formatDate(user.birthDate)}</p>
                <button 
                  onClick={() => setIsEditingDate(true)}
                  className="text-purple-600 text-sm font-bold hover:underline"
                >
                  {user.birthDate ? "Изменить" : "+ Добавить"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/preferences")}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg font-bold"
          >
            ⚙️ Настроить рекомендации
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              ❤️ Избранные игры
            </h2>
            {/* Кнопка "Посмотреть все" (показывается только если есть игры в избранном) */}
            {favorites.length > 0 && (
              <button
                onClick={() => navigate("/favorites")}
                className="text-purple-600 hover:text-purple-800 font-bold text-sm transition-colors"
              >
                Посмотреть весь список ({favorites.length}) →
              </button>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center">
              <p className="text-gray-400 italic">Тут пока пусто. Добавляйте игры в избранное, чтобы они появились здесь.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((game) => (
                <div
                  key={game.id}
                  className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-purple-200 cursor-pointer transition-all flex items-center gap-3 group"
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  <div className="w-12 h-12 overflow-hidden rounded-lg shadow-sm">
                    <img 
                      src={game.posterUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      alt={game.name} 
                    />
                  </div>
                  <p className="font-bold text-gray-800 truncate flex-1">{game.name}</p>
                  <span className="text-gray-300 group-hover:text-purple-500 transition-colors">→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Секция отзывов */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Мои отзывы
          </h2>
          {reviews.length === 0 && <p className="text-gray-500 italic">Вы еще не оставили ни одного отзыва.</p>}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 transition-colors cursor-pointer"
                onClick={() => navigate(`/games/${review.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-purple-600 uppercase text-xs tracking-widest">{review.gameTitile}</p>
                    <span className="text-yellow-500 font-bold">★ {review.rating}/5</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                {review.review && review.review.trim() !== "" ? (
                  `"${review.review}"`
                ) : (
                  <span className="text-gray-400 italic">Без текстового описания</span>
                )}
              </p>
              </div>
            ))}
          </div>
          {hasMoreReviews && reviews.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => loadReviews(reviewsPage + 1)}
                className="px-6 py-2 border-2 border-purple-500 text-purple-500 font-bold rounded-xl hover:bg-purple-50 transition"
              >
                Загрузить еще
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}