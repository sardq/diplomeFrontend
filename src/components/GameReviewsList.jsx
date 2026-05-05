export const GameReviewsList = ({ reviews, handleReaction, hasMore, loadMore }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <h2 className="text-xl font-bold mb-5">Обзоры других пользователей</h2>
    {reviews.length === 0 ? (
      <p className="text-gray-500 text-center py-4">Пока нет отзывов. Станьте первым!</p>
    ) : (
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-none border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs uppercase">
                  {review.login?.charAt(0)}
                </div>
                <p className="text-sm text-gray-600 font-semibold">Пользователь #{review.login}</p>
              </div>
              {review.rating != null && (
                <span className="text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-lg text-sm">⭐ {review.rating}</span>
              )}
            </div>
            <p className="text-gray-800 mt-3 leading-relaxed">{review.review || "Без текста"}</p>
            <div className="flex gap-3 mt-4">
            {['LIKE', 'DISLIKE', 'FUNNY'].map((type) => {
              // Определяем правильное имя поля из DTO
              const countKey = type === 'FUNNY' ? 'funnyCount' : `${type.toLowerCase()}sCount`;
              const count = review[countKey] ?? 0; // Используем ?? вместо ||

              return (
                <button
                  key={type}
                  onClick={() => handleReaction(review.id, type)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm transition border ${
                    review.currentUserReaction === type 
                      ? 'bg-purple-50 text-purple-600 border-purple-200 font-bold' 
                      : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {type === 'LIKE' ? '👍' : type === 'DISLIKE' ? '👎' : '😂'} {count}
                </button>
              );
            })}
          </div>
          </div>
        ))}
      </div>
    )}
    {hasMore && reviews.length > 0 && (
      <div className="flex justify-center mt-8 pt-4 border-t border-gray-50">
        <button onClick={loadMore} className="px-8 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition">
          Загрузить ещё отзывы
        </button>
      </div>
    )}
  </div>
);