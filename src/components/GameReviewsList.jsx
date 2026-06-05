import { useNavigate } from "react-router-dom";

export const GameReviewsList = ({ reviews, handleReaction, hasMore, loadMore }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <span className="text-2xl">💬</span> Мнения игроков
          </h2>
        </div>
        <div className="md:text-right">
          <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest leading-loose">
            Ваши помогают рекомендациям <br className="hidden md:block"/> точнее подбирать игры для вас и других геймеров
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Отзывов пока нет</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="group p-6 md:p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-purple-200 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => navigate(`/user/${review.authorId}`)}
                >
                  {review.avatarUrl ? (
                    <img 
                      src={review.authorAvatar} 
                      className="w-12 h-12 rounded-2xl object-cover border border-gray-50 group-hover:scale-105 transition-transform" 
                      alt={review.login} 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 flex justify-center items-center text-white font-black text-sm group-hover:bg-purple-600 transition-colors">
                      {review.login[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-black text-gray-900 group-hover:text-purple-600 transition-colors text-base">
                      {review.login}
                    </p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Профиль геймера</p>
                  </div>
                </div>

                {review.rating != null && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-yellow-500 font-bold">★</span>
                    <span className="font-black text-gray-900 text-sm">{review.rating}</span>
                    <span className="text-[10px] text-gray-400 font-bold">/ 5</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base border-l-4 border-purple-100 pl-6 italic">
                  {review.review && review.review.trim() !== "" ? (
                    review.review
                  ) : (
                    <span className="text-gray-300 font-medium uppercase text-[10px] tracking-widest">
                      Пользователь оставил оценку без комментария
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-50">
                {['LIKE', 'DISLIKE', 'FUNNY'].map((type) => {
                  const countKey = type === 'FUNNY' ? 'funnyCount' : `${type.toLowerCase()}sCount`;
                  const count = review[countKey] ?? 0;
                  const isActive = review.currentUserReaction === type;

                  const icons = { LIKE: '👍', DISLIKE: '👎', FUNNY: '😂' };
                  const activeStyles = { 
                    LIKE: 'bg-blue-600 text-white border-blue-600', 
                    DISLIKE: 'bg-red-600 text-white border-red-600', 
                    FUNNY: 'bg-orange-500 text-white border-orange-500' 
                  };

                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(review.id, type)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border uppercase tracking-wider ${
                        isActive 
                          ? `${activeStyles[type]} shadow-lg scale-95` 
                          : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100 hover:text-gray-600'
                      }`}
                    >
                      <span className="text-sm leading-none">{icons[type]}</span> 
                      {count}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && reviews.length > 0 && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={loadMore} 
            className="px-14 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-purple-600 transition-all active:scale-95 shadow-sm"
          >
            Показать еще
          </button>
        </div>
      )}
    </div>
  );
};