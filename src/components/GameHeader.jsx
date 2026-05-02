export const GameHeader = ({ game, isFavorite, toggleFavorite, isAuth, navigate }) => (
  <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row gap-6 relative">
    <button
      onClick={() => navigate(-1)}
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
    >
      ← Назад
    </button>
    <img src={game.posterUrl} alt={game.name} className="w-full md:w-64 h-80 object-cover rounded-xl shadow-md" />
    <div className="flex flex-col gap-3 flex-1">
      <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
      
      {/* СЕКЦИЯ РЕЙТИНГОВ */}
      <div className="flex items-center gap-8 my-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Рейтинг RAWG</span>
          <span className="text-yellow-500 text-xl font-bold flex items-center gap-1">
            ⭐ {game.rating}
          </span>
        </div>

        {/* Наш локальный рейтинг (показываем, если есть хотя бы один голос) */}
        {game.localRatingCount > 0 ? (
          <div className="flex flex-col border-l border-gray-100 pl-8">
            <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Наше сообщество</span>
            <div className="flex items-baseline gap-2">
              <span className="text-purple-600 text-xl font-bold flex items-center gap-1">
                💎 {game.localRating?.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                ({game.localRatingCount} оценок)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col border-l border-gray-100 pl-8 opacity-50">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Наше сообщество</span>
             <span className="text-xs text-gray-400 mt-1 italic">Пока нет оценок</span>
          </div>
        )}

        {game.metacriticRate && (
          <div className="flex flex-col border-l border-gray-100 pl-8">
            <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">Metacritic</span>
            <span className="text-green-600 text-xl font-bold">{game.metacriticRate}</span>
          </div>
        )}
      </div>

      <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: game.description }} />

      <div className="flex flex-wrap gap-2 mt-2">
        {game.tags?.map((tag) => (
          <span
            key={tag.id}
              onClick={() => navigate(`/games?tag=${tag.slug}`)}
            className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm cursor-pointer hover:bg-purple-100 transition font-medium border border-purple-100"
          >
            {tag.nameRu || tag.name}
          </span>
        ))}
      </div>

      <button
        onClick={toggleFavorite}
        className={`mt-4 w-fit px-8 py-2.5 rounded-xl text-white font-bold shadow-md transition-all active:scale-95 ${isFavorite ? "bg-red-500 hover:bg-red-600" : "bg-indigo-500 hover:bg-indigo-600"}`}
        disabled={!isAuth}
      >
        {isFavorite ? "❤️ В избранном" : "🤍 Добавить в избранное"}
      </button>
    </div>
  </div>
);