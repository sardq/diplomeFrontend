import React from 'react';

export const GameHeader = ({ game, isFavorite, toggleFavorite, isAuth, navigate }) => {
  // 1. Логика фильтрации сделок (CheapShark)
  const uniqueDeals = [];
  const seenStores = new Set();
  if (game.deals && Array.isArray(game.deals)) {
    const sortedDeals = [...game.deals].sort((a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice));
    for (const deal of sortedDeals) {
      if (!seenStores.has(deal.storeID)) {
        uniqueDeals.push(deal);
        seenStores.add(deal.storeID);
      }
    }
  }

  const csStoreNames = { "1": "Steam", "2": "GamersGate", "3": "GreenManGaming", "7": "GOG", "11": "Humble Store", "15": "Fanatical", "25": "Epic Games" };

  const getStoreName = (url) => {
    if (!url) return "Магазин";
    if (url.includes("steampowered.com")) return "Steam";
    if (url.includes("playstation.com")) return "PS Store";
    if (url.includes("xbox.com")) return "Xbox Store";
    if (url.includes("epicgames.com")) return "Epic Games";
    if (url.includes("gog.com")) return "GOG";
    if (url.includes("microsoft.com")) return "MS Store";
    return "В магазин";
  };

  return (
    <div className="bg-white rounded-[2rem] flex flex-col lg:flex-row gap-8 p-6 md:p-8 relative overflow-hidden border border-gray-100 shadow-sm">
      
      {/* Кнопка Назад */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 right-6 z-20 bg-gray-50 p-2 px-3 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 font-black text-[9px] uppercase tracking-widest text-gray-400"
      >
        ← Назад
      </button>

      {/* Постер */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <img 
          src={game.posterUrl} 
          className="w-full h-[400px] lg:h-96 object-cover rounded-[1.5rem] border border-gray-100 shadow-sm transition-transform hover:scale-[1.01] duration-500" 
          alt={game.name} 
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4 break-words uppercase tracking-tighter italic">
          {game.name}
        </h1>

        {/* РЕЙТИНГИ */}
        <div className="flex flex-wrap gap-4 md:gap-8 mb-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Глобальный рейтинг</span>
            <span className="text-2xl font-black text-yellow-500 flex items-center gap-2">⭐ {game.rating}</span>
          </div>

          {game.localRating > 0 && (
            <div className="flex flex-col border-l border-gray-100 pl-6 md:pl-8">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Наше сообщество</span>
              <span className="text-2xl font-black text-purple-600 flex items-center gap-2">💎 {game.localRating.toFixed(1)}</span>
            </div>
          )}

          {game.metacriticRate && (
            <div className="flex flex-col border-l border-gray-100 pl-6 md:pl-8 hidden sm:flex">
              <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em] mb-1">Metacritic</span>
              <span className="text-2xl font-black text-green-600 flex items-center gap-2">{game.metacriticRate}</span>
            </div>
          )}
        </div>

        {/* ПЛАТФОРМЫ */}
        <div className="flex flex-wrap gap-2 mb-4">
          {game.platforms?.map(p => (
            <span key={p} className="px-2 py-1 bg-gray-50 text-gray-400 text-[9px] font-black rounded border border-gray-100 uppercase">{p}</span>
          ))}
        </div>

        {/* ОПИСАНИЕ - с зажимом текста и прокруткой */}
        <div 
          className="text-gray-500 text-sm leading-relaxed mb-6 max-h-32 overflow-y-auto pr-2 custom-scrollbar" 
          dangerouslySetInnerHTML={{ __html: game.descriptionRu || game.description }} 
        />

        {/* МОНИТОРИНГ ЦЕН (CheapShark) */}
        {uniqueDeals.length > 0 && (
          <div className="space-y-3 mb-8">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Лучшие цены</span>
            <div className="flex flex-wrap gap-3">
              {uniqueDeals.slice(0, 4).map((deal, i) => {
                const rub = Math.round(parseFloat(deal.salePrice) * (game.usdRate || 92));
                const isFree = parseFloat(deal.salePrice) === 0;
                return (
                  <a 
                    key={i} 
                    target="_blank" rel="noreferrer"
                    className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center min-w-[100px] hover:border-green-400 hover:bg-white transition-all group"
                  >
                    <span className="text-[9px] font-bold text-gray-400 uppercase mb-1 group-hover:text-green-600 transition-colors">
                      {csStoreNames[deal.storeID] || "Shop"}
                    </span>
                    <span className={`font-black text-sm ${isFree ? 'text-green-500' : 'text-gray-700'}`}>
                      {isFree ? "FREE" : `${rub} ₽`}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ТЕГИ И ДЕЙСТВИЯ */}
        <div className="mt-auto flex flex-col gap-6 pt-6 border-t border-gray-50">
          <div className="flex flex-wrap gap-2">
            {game.tags?.map((tag, idx) => (
              <span 
                key={idx} 
                onClick={() => navigate(`/games?tag=${game.tags[idx].toLowerCase().replace(/\s+/g, "-")}`)}
                className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black cursor-pointer hover:bg-purple-600 hover:text-white transition-all border border-purple-100 uppercase"
              >
                {tag.nameRu}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* ОФИЦИАЛЬНЫЕ ССЫЛКИ НА МАГАЗИНЫ (RAWG) */}
            {game.storeLinks?.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-gray-200"
              >
                🛒 {getStoreName(url)}
              </a>
            ))}

            {/* ИЗБРАННОЕ */}
            <button
              onClick={toggleFavorite}
              className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                isFavorite 
                  ? "bg-red-500 text-white border-b-4 border-red-700" 
                  : "bg-indigo-600 text-white border-b-4 border-indigo-800 hover:bg-indigo-500 shadow-indigo-100"
              } ${!isAuth ? 'opacity-40 cursor-not-allowed' : ''}`}
              disabled={!isAuth}
            >
              {isFavorite ? "❤️ В избранном" : "🤍 Добавить в избранное"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};