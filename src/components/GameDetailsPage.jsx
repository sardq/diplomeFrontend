import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "./service/api";

export default function GameDetailsPage() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [userReview, setUserReview] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadGame();
    loadUserInteraction();
    loadFavorite();
    loadReviews();
    loadUserReview();
    sendView();
  }, [id]);

  const loadGame = () => {
    api.get(`/games/${id}`)
      .then(res => setGame(res.data))
      .catch(console.error);
  };

  const loadFavorite = () => {
    if (!token) return;

    api.get(`/interactions/favorite`, {
      params: { gameId: id },
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setIsFavorite(res.data))
      .catch(console.error);
  };

  const sendView = () => {
    if (!token) return;

    api.post(`/interactions/view`, null, {
      params: { gameId: id },
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);
  };

  const loadReviews = () => {
    api.get(`/interactions/reviews/game/${id}`)
      .then(res => setReviews(res.data))
      .catch(console.error);
  };

  const loadUserInteraction = () => {
    if (!token) return;

    api.get(`/interactions/user/game/${id}`, {
      params: { type: "Rated" },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data) setUserRating(res.data.rating || 0);
    })
    .catch(console.error);
  };

  const loadUserReview = () => {
    if (!token) return;

    api.get(`/interactions/user/game/${id}`, {
      params: { type: "Review" },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data) {
        setUserReview(res.data.review);
        setReviewText(res.data.review);
      }
    })
    .catch(console.error);
  };

  const rateGame = (rating) => {
    setUserRating(rating);

    api.post(`/interactions/rate`, null, {
      params: { gameId: id, rating },
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);
  };

  const toggleFavorite = () => {
    if (!token) return;

    const request = isFavorite
      ? api.delete(`/interactions/favorite`, {
          params: { gameId: id },
          headers: { Authorization: `Bearer ${token}` }
        })
      : api.post(`/interactions/favorite`, null, {
          params: { gameId: id },
          headers: { Authorization: `Bearer ${token}` }
        });

    request
      .then(() => setIsFavorite(!isFavorite))
      .catch(console.error);
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;

    api.post(`/interactions/review`, null, {
      params: { gameId: id, review: reviewText },
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setUserReview(reviewText); // теперь пользователь оставил отзыв
      loadReviews();
    })
    .catch(console.error);
  };

  if (!game) return <div>Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* ОСНОВНАЯ ИНФА */}
      <div className="bg-white p-6 rounded-xl shadow flex gap-6">
        <img
          src={game.posterUrl}
          alt={game.name}
          className="w-64 h-80 object-cover rounded-xl"
        />

        <div className="flex flex-col gap-3 flex-1">
          <h1 className="text-3xl font-bold">{game.name}</h1>

          <span className="text-yellow-500 text-lg font-bold">
            ⭐ {game.rating}
          </span>

          {game.metacritic && (
            <span className="text-green-600 font-semibold">
              Metacritic: {game.metacritic}
            </span>
          )}

          <p className="text-gray-600">{game.description}</p>

          {/* ТЕГИ */}
          <div className="flex flex-wrap gap-2 mt-2">
            {game.tags?.map(tag => (
              <span key={tag.id} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                {tag.name}
              </span>
            ))}
          </div>

          {/* ИЗБРАННОЕ */}
          <button
            onClick={toggleFavorite}
            className={`mt-3 px-4 py-2 rounded-lg text-white ${
              isFavorite ? "bg-red-500" : "bg-gray-400"
            }`}
          >
            {isFavorite ? "❤️ В избранном" : "🤍 В избранное"}
          </button>

          {/* РЕЙТИНГ */}
          <div className="mt-4">
            <p className="font-semibold mb-1">Оценить игру:</p>
            <div className="flex gap-2 text-2xl">
              {[1,2,3,4,5].map(num => (
                <span
                  key={num}
                  onClick={() => rateGame(num)}
                  className={`cursor-pointer ${num <= userRating ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ОТЗЫВ */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3">
          {userReview ? "Редактировать обзор" : "Написать обзор"}
        </h2>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
          rows={4}
          placeholder="Напишите ваш отзыв..."
        />

        <button
          onClick={submitReview}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg"
          disabled={!reviewText.trim()}
        >
          {userReview ? "Сохранить изменения" : "Отправить"}
        </button>
      </div>

      {/* СПИСОК ОТЗЫВОВ */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3">Обзоры пользователей</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500">Пока нет отзывов</p>
        ) : (
          reviews.map((review, index) => (
            <div key={review.id || index} className="border-b py-3 last:border-none">
              <p className="text-sm text-gray-500">Пользователь #{review.login}</p>
              <p className="text-gray-800">{review.review}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}