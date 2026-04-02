import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api"; // твой axios с JWT

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Получаем профиль
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));

    // Получаем избранное
    api.get("/interactions/favorites")
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error(err));

    // Загружаем первые 5 отзывов
    loadReviews(0);
  }, []);

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
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        {/* Аватарка и имя */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex justify-center items-center text-gray-400 text-2xl font-bold">
            {user.username[0].toUpperCase()}
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

        {/* Список избранного */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Избранные игры</h2>
          {favorites.length === 0 && <p className="text-gray-500">Нет игр в избранном.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((game) => (
              <div
                key={game.id}
                className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition"
                onClick={() => navigate(`/games/${game.id}`)}
              >
                <p className="font-semibold">{game.name}</p>
              </div>
            ))}
          </div>
          {favorites.length > 0 && (
            <div className="flex justify-end mt-2">
              <button
                onClick={() => navigate("/favorites")}
                className="text-purple-500 hover:underline"
              >
                Посмотреть все избранные
              </button>
            </div>
          )}
        </div>

        {/* Список отзывов */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Мои отзывы</h2>
          {reviews.length === 0 && <p className="text-gray-500">Нет отзывов.</p>}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition"
                onClick={() => navigate(`/games/${review.id}`)}
              >
                <p className="text-gray-700">{review.gameTitile}</p>
                <p className="text-gray-700">{review.review}</p>
                <p className="text-gray-500 text-sm">Оценка: {review.rating} / 5</p>
              </div>
            ))}
          </div>
          {hasMoreReviews && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => loadReviews(reviewsPage + 1)}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
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