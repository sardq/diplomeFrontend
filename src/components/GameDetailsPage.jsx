import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "./service/api";
import { GameHeader } from "./GameHeader";
import { GameMedia } from "./GameMedia";
import { GameReviewsList } from "./GameReviewsList";
import { GameNews } from "./GameNews"; 
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
      api.get("/auth/me").then(res => setCurrentUserId(res.data.id)).catch(console.error);
    }
  }, [isAuth]);

  useEffect(() => {
    loadGame();
    if (isAuth) {
      loadUserReviewAndRating();
      loadFavorite();
      sendView();
    }
  }, [id]);

  useEffect(() => {
    if (currentUserId !== null || !isAuth) {
      loadReviews(0, false);
    }
  }, [id, currentUserId, isAuth]);

  const loadGame = async () => {
    try {
      setGame(null);
      await api.post(`/games/load/${id}`);
      const res = await api.get(`/games/${id}`);
      setGame(res.data);
      console.log("Game details loaded:", res.data);
    } catch (e) { console.error(e); }
  };

  const loadFavorite = () => {
    api.get(`/interactions/favorite`, { params: { gameId: id }, headers: { Authorization: `Bearer ${token}` } })
      .then(res => setIsFavorite(res.data)).catch(console.error);
  };

  const sendView = () => {
    api.post(`/interactions/view`, null, { params: { gameId: id }, headers: isAuth ? { Authorization: `Bearer ${token}` } : {} }).catch(console.error);
  };

  const loadReviews = (pageToLoad = 0, append = false) => {
  api.get(`/interactions/reviews/game/${id}`, {
    params: { page: pageToLoad, size: pageSize }
  })
  .then(res => {
    const data = res.data || [];
    // ТЕПЕРЬ СРАВНИВАЕМ authorId с currentUserId
    const otherReviews = data.filter(r => !isAuth || r.authorId !== currentUserId);

    setReviews(prev => append ? [...prev, ...otherReviews] : otherReviews);
    setHasMore(data.length === pageSize);
  })
  .catch(console.error);
};

  const loadUserReviewAndRating = () => {
    api.get(`/interactions/review/user/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data) {
          setUserRating(res.data.rating);
          setUserReview(res.data.review || "");
          setEditRating(res.data.rating || 0);
          setEditReview(res.data.review || "");
        }
      }).catch(console.error);
  };

  const handleReaction = (reviewId, type) => {
    if (!isAuth) return;
    api.post(`/interactions/reviews/${reviewId}/react`, null, { params: { typeString: type }, headers: { Authorization: `Bearer ${token}` } })
      .then(() => loadReviews(page, false)).catch(console.error);
  };

  const toggleFavorite = () => {
    if (!isAuth) return;
    const request = isFavorite 
      ? api.delete(`/interactions/favorite`, { params: { gameId: id }, headers: { Authorization: `Bearer ${token}` } })
      : api.post(`/interactions/favorite`, null, { params: { gameId: id }, headers: { Authorization: `Bearer ${token}` } });
    request.then(() => setIsFavorite(!isFavorite)).catch(console.error);
  };

  const saveReviewAndRating = () => {
    if (!isAuth) return;
    const requests = [
      api.post(`/interactions/rate`, null, { params: { gameId: id, rating: editRating }, headers: { Authorization: `Bearer ${token}` } }),
      api.post(`/interactions/review`, null, { params: { gameId: id, review: editReview }, headers: { Authorization: `Bearer ${token}` } })
    ];
    Promise.all(requests).then(() => loadUserReviewAndRating()).catch(console.error);
  };

  if (!game) return <div className="flex justify-center items-center h-64 text-gray-500 lg text-lg">Загрузка игры...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      
      <GameHeader 
        game={game} 
        isFavorite={isFavorite} 
        toggleFavorite={toggleFavorite} 
        isAuth={isAuth} 
        navigate={navigate} 
      />

      <GameMedia 
        screenshotUrls={game.screenshotUrls} 
        trailerUrls={game.trailerUrls} 
        walkthroughUrls={game.walkthroughUrls}
      />
      <GameNews articles={game.news} />

      {/* 3. Твой отзыв */}
      <div className="space-y-6">
        {isAuth && (
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
            <p className="font-bold mb-3 text-gray-800">Оцените игру:</p>
            <div className="flex gap-3 text-4xl mb-4">
              {[1, 2, 3, 4, 5].map(num => (
                <span key={num} onClick={() => setEditRating(num)} className={`cursor-pointer transition-colors ${num <= editRating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
              ))}
            </div>
            <textarea
              value={editReview}
              onChange={(e) => setEditReview(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-400 outline-none transition"
              rows={4}
              placeholder="Поделитесь вашим мнением об игре..."
            />
            <button onClick={saveReviewAndRating} className="mt-3 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50" disabled={!editReview.trim() && !editRating}>
              Сохранить отзыв
            </button>
          </div>
        )}

        {isAuth && (userReview || userRating) && (
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm">
            <p className="font-bold text-purple-800 mb-2">Ваша опубликованная оценка:</p>
            <div className="flex gap-1 text-2xl mb-2">
              {[1, 2, 3, 4, 5].map(num => <span key={num} className={num <= userRating ? "text-yellow-500" : "text-gray-300"}>★</span>)}
            </div>
            {userReview && <p className="text-gray-700 italic">"{userReview}"</p>}
          </div>
        )}
      </div>

      {/* 4. Другие отзывы */}
      <GameReviewsList 
        reviews={reviews} 
        handleReaction={handleReaction} 
        hasMore={hasMore} 
        loadMore={() => { setPage(p => p + 1); loadReviews(page + 1, true); }} 
      />

    </div>
  );
}