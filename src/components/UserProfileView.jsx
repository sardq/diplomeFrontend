import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./service/api";

export default function UserProfileView() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/users/public/${userId}`)
      .then(res => {
        setProfile(res.data);
        loadReviews(0, false);
      })
      .catch(err => console.error("Ошибка загрузки профиля:", err));
  }, [userId]);

  const loadReviews = (pageToLoad, append = true) => {
    setLoading(true);
    api.get(`/interactions/reviews/users/${userId}?page=${pageToLoad}&size=5`)
      .then(res => {
        const data = res.data || [];
        if (data.length < 5) setHasMore(false);
        setReviews(prev => append ? [...prev, ...data] : data);
        setPage(pageToLoad);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  if (!profile) return (
    <div className="flex justify-center items-center h-screen text-gray-400 font-black tracking-widest animate-pulse uppercase text-xs">
      Поиск игрока в базе...
    </div>
  );

  return (
    <div className="bg-[#fcfcff] min-h-screen pb-20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-400 hover:text-purple-600 font-bold transition-colors uppercase tracking-[0.2em] text-[10px]"
          >
            ← Назад
          </button>
          <div className="h-px flex-1 bg-gray-100 mx-8 hidden md:block"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 flex flex-col md:flex-row gap-10 items-center md:items-start transition-all shadow-sm relative overflow-hidden">
          
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full bg-purple-50 flex justify-center items-center text-purple-600 text-6xl font-black">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">{profile.username}</h2>
              <div className="flex justify-center md:justify-start mt-2">
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-purple-100">
                   🎮 Игрок сообщества
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest px-4 italic">
            Обзоры от {profile.username}
          </h3>
          
          {reviews.length === 0 ? (
            <div className="py-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
              <p className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Пользователь пока не оставил ни одного отзыва</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  onClick={() => navigate(`/games/${review.id}`)}
                  className="p-6 md:p-8 bg-white rounded-[2rem] border border-gray-100 hover:border-purple-100 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-black text-purple-600 uppercase tracking-[0.2em] bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                      {review.gameTitile}
                    </span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-gray-900 font-black text-[11px]">{review.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm leading-relaxed border-l-2 border-purple-200 pl-6 italic">
                    {review.review && review.review.trim() !== "" ? review.review : "Пользователь поставил оценку без текста"}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {hasMore && reviews.length > 0 && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => loadReviews(page + 1)} 
                disabled={loading}
                className="px-12 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 shadow-sm"
              >
                {loading ? "Загрузка..." : "Смотреть ещё отзывы"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}