import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function GameDetailsPage() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const isAuth = !!token;
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");

  const [editRating, setEditRating] = useState(0);
  const [editReview, setEditReview] = useState("");

  const [reviews, setReviews] = useState([]); 
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5;
  const [currentUserId, setCurrentUserId] = useState(null);

useEffect(() => {
  if (isAuth) {
    api.get("/auth/me")
      .then(res => setCurrentUserId(res.data.id))
      .catch(console.error);
  }
}, [isAuth]);

  useEffect(() => {
    loadGame();
    sendView();

    if (isAuth) {
      loadUserReviewAndRating();
      loadFavorite();
    }
  }, [id]);
  useEffect(() => {
    if (currentUserId !== null || !isAuth) {
      loadReviews(0, false);
    }
  }, [id, currentUserId, isAuth]);
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage, true);
  };

  const loadGame = () => {
    api.get(`/games/${id}`)
      .then(res => setGame(res.data))
      .catch(console.error);
  };

  const loadFavorite = () => {
    api.get(`/interactions/favorite`, {
      params: { gameId: id },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setIsFavorite(res.data))
    .catch(console.error);
  };

  const sendView = () => {
    api.post(`/interactions/view`, null, {
      params: { gameId: id },
      headers: isAuth ? { Authorization: `Bearer ${token}` } : {}
    }).catch(console.error);
  };

  const loadReviews = (pageToLoad = 0, append = false) => {
    api.get(`/interactions/reviews/game/${id}`, {
      params: { page: pageToLoad, size: pageSize }
    })
    .then(res => {
      const data = res.data || [];
      console.log(data);
      console.log(currentUserId);
      const otherReviews = data.filter(r => !isAuth || r.id !== currentUserId);
      console.log(otherReviews);

      if (append) {
        setReviews(prev => [...prev, ...otherReviews]);
      } else {
        setReviews(otherReviews);
      }

      setHasMore(data.length === pageSize);
    })
    .catch(console.error);
  };

  const loadUserReviewAndRating = () => {
    api.get(`/interactions/review/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data) {
        setUserRating(res.data.rating || 0);
        setUserReview(res.data.review || "");
        setEditRating(res.data.rating || 0);
        setEditReview(res.data.review || "");
      }
    })
    .catch(console.error);
  };

  const toggleFavorite = () => {
    if (!isAuth) return;

    const request = isFavorite
      ? api.delete(`/interactions/favorite`, {
          params: { gameId: id },
          headers: { Authorization: `Bearer ${token}` }
        })
      : api.post(`/interactions/favorite`, null, {
          params: { gameId: id },
          headers: { Authorization: `Bearer ${token}` }
        });

    request.then(() => setIsFavorite(!isFavorite)).catch(console.error);
  };

  const saveReviewAndRating = () => {
    if (!isAuth) return;

    const requests = [
      api.post(`/interactions/rate`, null, {
        params: { gameId: id, rating: editRating },
        headers: { Authorization: `Bearer ${token}` }
      }),
      api.post(`/interactions/review`, null, {
        params: { gameId: id, review: editReview },
        headers: { Authorization: `Bearer ${token}` }
      })
    ];

    Promise.all(requests)
      .then(() => {
        loadUserReviewAndRating();
      })
      .catch(console.error);
  };

  if (!game) return <div>Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      <div className="bg-white p-6 rounded-xl shadow flex gap-6 relative">
  
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
      >
        ← Назад
      </button>
        <img src={game.posterUrl} alt={game.name} className="w-64 h-80 object-cover rounded-xl" />
        <div className="flex flex-col gap-3 flex-1">
          <h1 className="text-3xl font-bold">{game.name}</h1>
          <span className="text-yellow-500 text-lg font-bold">⭐ {game.rating}</span>
          {game.metacritic && <span className="text-green-600 font-semibold">Metacritic: {game.metacritic}</span>}
          <p className="text-gray-600">{game.description}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {game.tags?.map(tag => (
              <span key={tag.id} className="px-3 py-1 bg-gray-200 rounded-full text-sm">{tag.name}</span>
            ))}
          </div>

          <button
            onClick={toggleFavorite}
            className={`mt-3 px-4 py-2 rounded-lg text-white ${isFavorite ? "bg-red-500" : "bg-gray-400"}`}
            disabled={!isAuth}
            title={!isAuth ? "Требуется авторизация" : ""}
          >
            {isFavorite ? "❤️ В избранном" : "🤍 В избранное"}
          </button>
        </div>
      </div>

      {isAuth && (
        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <p className="font-semibold mb-1">Напишите ваш отзыв:</p>
          <div className="flex gap-3 text-3xl mb-2">
            {[1,2,3,4,5].map(num => (
              <span
                key={num}
                onClick={() => setEditRating(num)}
                className={`cursor-pointer ${num <= editRating ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={editReview}
            onChange={(e) => setEditReview(e.target.value)}
            className="w-full border rounded-lg p-3 mb-2"
            rows={4}
            placeholder="Напишите ваш отзыв..."
          />
          <button
            onClick={saveReviewAndRating}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg"
            disabled={!editReview.trim() && !editRating}
          >
            Сохранить отзыв и рейтинг
          </button>
        </div>
      )}

      {isAuth && (userReview || userRating) && (
        <div className="bg-gray-50 p-4 rounded-xl shadow mb-4">
          <p className="font-semibold mb-1">Ваш отзыв:</p>
          {userRating > 0 && (
            <div className="flex gap-1 text-2xl mb-2">
              {[1,2,3,4,5].map(num => (
                <span key={num}>{num <= userRating ? "★" : "☆"}</span>
              ))}
            </div>
          )}
          {userReview && <p className="text-gray-800">{userReview}</p>}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3">Обзоры других пользователей</h2>
        {reviews.length === 0 && <p className="text-gray-500">Пока нет отзывов</p>}
        {reviews.map((review, index) => (
          <div key={review.id || index} className="border-b py-3 last:border-none">
            <p className="text-sm text-gray-500">Пользователь #{review.login}</p>
            <p className="text-gray-800">{review.review}</p>
            {review.rating != null && <p className="text-yellow-500 font-bold">⭐ {review.rating}</p>}
          </div>
        ))}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Загрузить ещё
            </button>
          </div>
        )}
      </div>
    </div>
  );
}