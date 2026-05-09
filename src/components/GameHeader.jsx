export const GameHeader = ({ game, isFavorite, toggleFavorite, isAuth, navigate }) => {
  const uniqueDeals = [];
  const seenStores = new Set();
  if (game.deals) {
  const sortedDeals = [...game.deals].sort((a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice));
  
  for (const deal of sortedDeals) {
    if (!seenStores.has(deal.storeID)) {
      uniqueDeals.push(deal);
      seenStores.add(deal.storeID);
    }
  }
}

  // Маппинг ID магазинов CheapShark (основные)
  const csStoreNames = {
    "1": "Steam",
    "2": "GamersGate",
    "3": "GreenManGaming",
    "7": "GOG",
    "8": "Origin",
    "11": "Humble Store",
    "15": "Fanatical",
    "21": "WinGameStore",
    "23": "GameBillet",
    "25": "Epic Games",
    "31": "Blizzard"
  };

  const getStoreName = (url) => {
    if (url.includes("steampowered.com")) return "Steam";
    if (url.includes("playstation.com")) return "PS Store";
    if (url.includes("xbox.com")) return "Xbox Store";
    if (url.includes("epicgames.com")) return "Epic Games";
    if (url.includes("gog.com")) return "GOG";
    if (url.includes("microsoft.com")) return "Microsoft Store";
    return "Магазин";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row gap-8 relative overflow-hidden">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition z-10"
      >
        ← Назад
      </button>
      
      <div className="flex-shrink-0">
        <img src={game.posterUrl} alt={game.name} className="w-full md:w-64 h-80 object-cover rounded-xl shadow-lg" />
      </div>
      
      <div className="flex flex-col gap-4 flex-1 min-w-0"> {/* min-w-0 исправляет overflow flex-элементов */}
        <h1 className="text-4xl font-extrabold text-gray-900 break-words">{game.name}</h1>
        
        {/* РЕЙТИНГИ */}
        <div className="flex flex-wrap items-center gap-6 py-2 border-y border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold">RAWG</span>
            <span className="text-yellow-500 text-xl font-black">⭐ {game.rating}</span>
          </div>

          {game.localRating > 0 && (
            <div className="flex flex-col border-l border-gray-100 pl-6">
              <span className="text-[10px] text-purple-400 uppercase font-bold">Наше сообщество</span>
              <span className="text-purple-600 text-xl font-black">💎 {game.localRating?.toFixed(1)}</span>
            </div>
          )}

          {game.metacriticRate && (
            <div className="flex flex-col border-l border-gray-100 pl-6">
              <span className="text-[10px] text-green-500 uppercase font-bold">Metacritic</span>
              <span className="text-green-600 text-xl font-black">{game.metacriticRate}</span>
            </div>
          )}
        </div>

        {/* ПЛАТФОРМЫ */}
        <div className="flex items-center gap-2">
          {game.platforms?.map((platform) => (
            <span key={platform} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase">
              {platform}
            </span>
          ))}
        </div>

        {/* ОПИСАНИЕ (С исправлением выхода за рамки) */}
        <div 
          className="text-gray-600 leading-relaxed text-sm break-words max-w-full prose prose-blue" 
          dangerouslySetInnerHTML={{ __html: game.description }} 
        />

        {/* ЦЕНЫ (С подписями и ссылками) */}
        {uniqueDeals.length > 0 && (
          <div className="mt-2 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Лучшие цены</p>
            <div className="flex flex-wrap gap-3">
              {uniqueDeals.slice(0, 4).map((deal, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 min-w-[100px]">
                  <span className="text-[9px] font-black text-gray-400 uppercase">
                    {csStoreNames[deal.storeID] || "Магазин"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold text-base">${deal.salePrice}</span>
                    {parseFloat(deal.savings) > 0 && (
                      <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        -{Math.round(deal.savings)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ТЕГИ */}
        <div className="flex flex-wrap gap-2 mt-2">
          {game.tags?.map((tag, index) => (
            <span
              key={index}
              onClick={() => navigate(`/games?tag=${game.tags[index].toLowerCase().replace(/\s+/g, "-")}`)}
              className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[11px] cursor-pointer hover:bg-purple-600 hover:text-white transition font-bold border border-purple-100"
            >
              {tag.nameRu}
            </span>
          ))}
        </div>

        {/* КНОПКИ ДЕЙСТВИЯ */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-50">
          {game.storeLinks?.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-lg shadow-gray-200"
            >
               🛒 {getStoreName(url)}
            </a>
          ))}

          <button
            onClick={toggleFavorite}
            className={`px-6 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 text-xs ${
              isFavorite ? "bg-red-500 shadow-red-100" : "bg-indigo-600 shadow-indigo-100"
            }`}
            disabled={!isAuth}
          >
            {isFavorite ? "❤️ В ИЗБРАННОМ" : "🤍 В ИЗБРАННОЕ"}
          </button>
        </div>

      </div>
    </div>
  );
};