import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "./service/api";

export default function GamesPage() {
  // === СОСТОЯНИЯ (Логика сохранена) ===
  const [allTags, setAllTags] = useState([]);
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(0);
  const lastItemRef = useRef(null);
  const [tagSearch, setTagSearch] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const navigate = useNavigate();

  const [loadingMore, setLoadingMore] = useState(false);
  const [totalGames, setTotalGames] = useState(0);
  const [tagName, setTagName] = useState("");
  const [hasMore, setHasMore] = useState(true);  
  const [searchParams] = useSearchParams();
  const tagSlug = searchParams.get("tag") || "popular"; 
  const pageSize = 10;

  // === ЗАГРУЗКА ДАННЫХ (Логика сохранена) ===
  useEffect(() => {
    api.get("/tags?page=0&size=40")
      .then(res => {
          const tags = res.data.content || res.data || [];
          setAllTags(tags);
          setFilteredTags(tags);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!tagSearch.trim()) {
        setFilteredTags(allTags);
        return;
      }
      api.get(`/tags/search?search=${tagSearch}&size=20`)
        .then(res => setFilteredTags(res.data || []))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tagSearch, allTags]);

  const loadGames = (pageNum = 0, append = false) => {
    setLoadingMore(true);
    let url;
    if (tagSlug === "popular") {
      url = `/games/popular?page=${pageNum}&size=${pageSize}`;
    } else {
      const tag = allTags.find(t => t.slug === tagSlug);
      if (!tag) { setLoadingMore(false); return; }
      url = `/games/tag/${tag.id}?page=${pageNum}&size=${pageSize}`;
    }

    api.get(url)
      .then(res => {
        const newGames = res.data || [];
        setHasMore(newGames.length === pageSize);
        setGames(prev => append ? [...prev, ...newGames] : newGames);
        setTotalGames(prev => append ? prev + newGames.length : newGames.length);

        if (tagSlug === "popular") {
          setTagName("🔥 Популярные игры");
        } else {
          const tag = allTags.find(t => t.slug === tagSlug);
          setTagName(tag ? (tag.nameRu || tag.name) : "Игры по тегу");
        }
      })
      .catch(err => {console.error(err);
        setHasMore(false);
      })
      
      .finally(() => setLoadingMore(false));
  };

  useEffect(() => {
    loadGames(0, false);
    setPage(0);
  }, [tagSlug, allTags]);

  const loadMore = () => {
    const lastElement = lastItemRef.current;
    const nextPage = page + 1;
    loadGames(nextPage, true);
    setPage(nextPage);

    setTimeout(() => {
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  // === КОМПОНЕНТ КАРТОЧКИ ===
  const GameCard = ({ game, onClick }) => (
    <div 
      onClick={onClick} 
      className="flex flex-col sm:flex-row bg-white rounded-3xl shadow-sm p-5 mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group"
    >
      <div className="flex-shrink-0 w-full sm:w-32 h-44 overflow-hidden rounded-2xl shadow-md mb-4 sm:mb-0">
        <img
          src={game.posterUrl}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
      </div>
      <div className="sm:ml-8 flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-black text-xl text-gray-900 group-hover:text-purple-600 transition-colors truncate">
            {game.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
             <span className="text-yellow-500 font-black flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-sm">
               ⭐ {game.rating}
             </span>
             {game.localRating > 0 && (
               <span className="text-purple-600 font-black flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg text-sm">
                 💎 {game.localRating.toFixed(1)}
               </span>
             )}
          </div>
        </div>
        
        {/* Описание с очисткой от HTML и ограничением строк */}
        <p className="text-gray-500 mt-3 text-sm line-clamp-3 leading-relaxed">
          {game.description?.replace(/<[^>]*>?/gm, '') || "Описание отсутствует..."}
        </p>
        
        <div className="mt-4 flex items-center gap-2">
           <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Подробнее об игре —&gt;</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* СЕКЦИЯ ФИЛЬТРОВ */}
      <div className="max-w-5xl mx-auto pt-8 px-4">
        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 space-y-6 border border-white">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Быстрый поиск по тегам..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none transition font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              onClick={() => navigate(`/games?tag=popular`)}
              className={`px-5 py-2 rounded-xl cursor-pointer text-xs font-black transition-all border ${
                tagSlug === "popular"
                  ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200"
                  : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100"
              }`}
            >
              🔥 ПОПУЛЯРНОЕ
            </span>

            {(showAllTags ? filteredTags : filteredTags.slice(0, 15)).map((tag) => (
              <span
                key={tag.id}
                onClick={() => navigate(`/games?tag=${tag.slug}`)}
                className={`px-4 py-2 rounded-xl cursor-pointer text-xs font-bold transition-all border ${
                  tag.slug === tagSlug
                    ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200"
                    : "bg-white text-gray-500 border-gray-100 hover:border-purple-300 hover:text-purple-600 shadow-sm"
                }`}
              >
                {tag.nameRu || tag.name}
              </span>
            ))}
          </div>

          {filteredTags.length > 15 && (
            <button
              onClick={() => setShowAllTags(prev => !prev)}
              className="w-full text-purple-600 text-[10px] font-black tracking-widest hover:text-purple-800 transition-colors uppercase pt-2"
            >
              {showAllTags ? "▲ Свернуть список" : `▼ Показать все категории (${filteredTags.length})`}
            </button>
          )}
        </div>
      </div>

      {/* СПИСОК ИГР */}
      <div className="max-w-5xl mx-auto mt-12 px-4">
        <div className="flex items-center gap-4 mb-8">
           <h2 className="text-4xl font-black text-gray-900 tracking-tight">{tagName}</h2>
           <div className="h-1 flex-1 bg-gray-200 rounded-full mt-2 opacity-50"></div>
        </div>

        {games.length === 0 && !loadingMore ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-xl font-bold">Игры не найдены 🎮</p>
            <p className="text-gray-300 text-sm mt-2">Попробуйте выбрать другой тег</p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((game, index) => (
              <div 
                key={`${game.id}-${index}`} 
                ref={index === games.length - 1 ? lastItemRef : null}
              >
                <GameCard 
                  game={game} 
                  onClick={() => navigate(`/games/${game.id}`)}
                />
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                    loadingMore 
                    ? 'bg-gray-200 text-gray-400 cursor-wait' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {loadingMore ? "Загрузка..." : "Загрузить ещё"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}