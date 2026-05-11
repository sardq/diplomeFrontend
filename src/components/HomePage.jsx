import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function HomePage() {
  // === СОСТОЯНИЯ (Логика сохранена полностью) ===
  const [popularGames, setPopularGames] = useState([]);
  const [recommendedTags, setRecommendedTags] = useState([]); 
  const [generalTags, setGeneralTags] = useState([]);        
  const [allTags, setAllTags] = useState([]);
  const [gamesByTag, setGamesByTag] = useState({});
  const [loadedCounts, setLoadedCounts] = useState({});
  const [recommendedPage, setRecommendedPage] = useState(0);
  const [generalPage, setGeneralPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [hasPreferences, setHasPreferences] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const tagSize = 5;
  const initialGameLoad = 5;
  const effectRan = useRef(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuth = !!token;

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // === ЭФФЕКТЫ И ЗАГРУЗКА (Логика сохранена) ===
  useEffect(() => { if (isAuth) { loadRecommendations(); checkUserPreferences(); } }, [isAuth]);

  const loadRecommendations = () => {
    api.get(`/recommendations/user`, authHeaders)
      .then((res) => setRecommendations(res.data))
      .catch((err) => console.error("Ошибка загрузки рекомендаций:", err));
  };

  const checkUserPreferences = () => {
    api.get(`/preferences/user/has-preferences`, authHeaders)
      .then((res) => setHasPreferences(res.data))
      .catch(() => setHasPreferences(false));
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await api.post(`/recommendations/recalculate`, {}, authHeaders);
      await loadRecommendations();
      await checkUserPreferences();
      setRecommendedTags([]);
      setRecommendedPage(0);
      loadRecommendedTags(0);
    } catch (err) { console.error(err); } finally { setIsRecalculating(false); }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!tagSearchTerm.trim()) { setFilteredTags(allTags); return; }
      api.get(`/tags/search?search=${encodeURIComponent(tagSearchTerm)}&size=20`)
        .then((res) => setFilteredTags(res.data || []))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tagSearchTerm, allTags]);

  const loadPopularGames = (size = initialGameLoad) => {
    api.get(`/games/popular?size=${size}`).then((res) => setPopularGames(res.data));
  };

  const loadRecommendedTags = (page = 0) => {
    if (!isAuth) return;
    api.get(`/tags/recommended?page=${page}&size=${tagSize}`, authHeaders)
      .then((res) => {
        const newTags = res.data.content || res.data || [];
        setRecommendedTags((prev) => {
            const ids = new Set(prev.map(t => t.id));
            return [...prev, ...newTags.filter(t => !ids.has(t.id))];
        });
        processNewTags(newTags);
      });
  };

  const loadGeneralTags = (page = 0) => {
    api.get(`/tags?page=${page}&size=${tagSize}`)
      .then((res) => {
        const newTags = res.data.content || res.data || [];
        setGeneralTags((prev) => {
            const ids = new Set(prev.map(t => t.id));
            return [...prev, ...newTags.filter(t => !ids.has(t.id))];
        });
        processNewTags(newTags);
      });
  };

  const processNewTags = (newTags) => {
    if (!newTags.length) return;
    const initialCounts = {};
    newTags.forEach((tag) => {
        initialCounts[tag.id] = initialGameLoad;
        loadGamesByTag(tag.id, initialGameLoad);
    });
    setLoadedCounts((prev) => ({ ...prev, ...initialCounts }));
  };

  const loadAllTags = () => {
    api.get(`/tags?page=0&size=40`).then((res) => {
      setAllTags(res.data.content || []);
      setFilteredTags(res.data.content || []);
    });
  };

  useEffect(() => {
    if (effectRan.current) return;
    loadPopularGames();
    loadGeneralTags(0);
    if (isAuth) loadRecommendedTags(0);
    loadAllTags();
    effectRan.current = true;
  }, [isAuth]);

  const loadGamesByTag = (tagId, size) => {
    api.get(`/games/tag/${tagId}?page=0&size=${size}`)
      .then((res) => setGamesByTag((prev) => ({ ...prev, [tagId]: res.data })));
  };

  const addMoreGames = (tagId) => {
    const newCount = (loadedCounts[tagId] || initialGameLoad) + 5;
    setLoadedCounts((prev) => ({ ...prev, [tagId]: newCount }));
    loadGamesByTag(tagId, newCount);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) return setSearchResults([]);
    api.get(`/games/filter?search=${encodeURIComponent(e.target.value)}`)
      .then((res) => setSearchResults(res.data));
  };

  // === КОМПОНЕНТЫ ОТОБРАЖЕНИЯ ===

  const GameCard = ({ game }) => {
    const handleClick = (e) => {
      if (e.target.closest(".rating-link")) return;
      navigate(`/games/${game.gameId || game.id}`);
    };

    return (
      <div 
        onClick={handleClick} 
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-3 cursor-pointer relative group border border-gray-100"
      >
        {/* Match Percentage Badge */}
        {game.matchPercentage && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
            {game.matchPercentage}% совпадение
          </div>
        )}
        
        <div className="overflow-hidden rounded-xl mb-3 aspect-[3/4]">
            <img 
              src={game.posterUrl} 
              alt={game.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
            />
        </div>

        <h3 className="font-bold text-sm text-gray-800 truncate mb-2 group-hover:text-purple-600 transition-colors">
          {game.name}
        </h3>
        
        <div className="flex items-center justify-between border-t pt-2 border-gray-50">
          <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
            <span>⭐</span>
            <span>{game.rating}</span>
          </div>

          {game.localRating > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-purple-500">
              <span>💎</span>
              <span>{game.localRating?.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTagSection = (tag, isRecommended = false) => {
    const games = gamesByTag[tag.id] || [];
    const loadedCount = loadedCounts[tag.id] || initialGameLoad;

    return (
      <section key={tag.id} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-900 capitalize flex items-center gap-3">
            {tag.nameRu || tag.name}
            {isRecommended && (
              <span className="text-[10px] bg-purple-100 text-purple-600 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                Твой жанр
              </span>
            )}
          </h2>
          <button 
            onClick={() => navigate(`/games?tag=${tag.slug}`)}
            className="text-sm font-bold text-purple-600 hover:text-purple-800 transition"
          >
            Все в категории →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {games.map((game) => (
            <GameCard key={`${tag.id}-${game.id}`} game={game} />
          ))}
        </div>

        {loadedCount < 15 && (
          <div className="flex justify-center">
            <button 
              onClick={() => addMoreGames(tag.id)} 
              className="text-gray-400 hover:text-purple-600 transition-all text-2xl p-2 hover:bg-purple-50 rounded-full"
            >
              ⌄
            </button>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-2/3">
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Поиск по 30,000+ играм..."
                className="w-full px-12 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none transition font-medium"
            />
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          </div>
          
          <button 
            onClick={() => setShowTagFilter(!showTagFilter)} 
            className={`px-6 py-3 rounded-2xl font-bold transition-all w-full md:w-auto ${
              showTagFilter ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Жанры и теги
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-16">
        
        {/* ТЕГ-ФИЛЬТР (Адаптивный) */}
        {showTagFilter && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-slide-down">
              <input
                  type="text"
                  placeholder="Начните вводить название тега..."
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl mb-6 outline-none focus:bg-white border border-transparent focus:border-purple-200 transition"
              />
              <div className="flex flex-wrap gap-2">
                  {(showAllTags ? filteredTags : filteredTags.slice(0, 15)).map((tag) => (
                      <span 
                        key={tag.id} 
                        onClick={() => navigate(`/games?tag=${tag.slug}`)} 
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-600 hover:bg-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-200 transition-all cursor-pointer"
                      >
                          {tag.nameRu || tag.name}
                      </span>
                  ))}
              </div>
              {filteredTags.length > 15 && (
                  <button onClick={() => setShowAllTags(!showAllTags)} className="text-purple-600 text-xs mt-6 font-black hover:underline block mx-auto">
                      {showAllTags ? "СВЕРНУТЬ СПИСОК" : `ПОКАЗАТЬ ВСЕ (${filteredTags.length})`}
                  </button>
              )}
          </div>
        )}

        {/* БАННЕР ОПРОСА */}
        {isAuth && !hasPreferences && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8 rounded-3xl shadow-2xl shadow-purple-200 flex flex-col md:flex-row justify-between items-center text-white gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black mb-2 tracking-tight">Персонализируй это!</h2>
              <p className="opacity-90 font-medium">Расскажи нам о своих вкусах, и мы подберем игры специально под тебя.</p>
            </div>
            <button onClick={() => navigate("/preferences")} className="px-10 py-4 bg-white text-purple-700 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl whitespace-nowrap">
              ПРОЙТИ ОПРОС
            </button>
          </div>
        )}

        {/* РЕЗУЛЬТАТЫ ПОИСКА */}
        {searchTerm ? (
          <section className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900 border-l-8 border-purple-500 pl-4">Результаты поиска</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.length > 0 ? searchResults.map(game => <GameCard key={game.id} game={game} />) : <p className="text-gray-400 text-xl font-medium">Ничего не найдено...</p>}
            </div>
          </section>
        ) : (
          <>
            {/* ГЛАВНЫЕ РЕКОМЕНДАЦИИ (HERO SECTION) */}
            {isAuth && recommendations.length > 0 && (
              <section className="bg-gray-900 p-10 rounded-[40px] shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 blur-[150px] opacity-20 -mr-40 -mt-40"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <span className="text-purple-400 font-black text-xs uppercase tracking-[0.3em]">Рекомендовано</span>
                      <h2 className="text-4xl font-black text-white mt-2 tracking-tight">Твоя личная подборка</h2>
                    </div>
                    <button onClick={() => navigate("/recommendations")} className="text-purple-300 hover:text-white font-bold text-sm transition">
                      Архив подборок →
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {recommendations.slice(0, 5).map((game) => (
                      <GameCard key={`rec-${game.gameId || game.id}`} game={game} />
                    ))}
                  </div>

                  {hasPreferences && (
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <p className="text-white/60 text-sm font-medium">Подборка обновляется на основе твоей активности.</p>
                      <button
                        onClick={handleRecalculate}
                        disabled={isRecalculating}
                        className={`px-8 py-3 rounded-xl font-black transition-all flex items-center gap-3 ${
                          isRecalculating ? "bg-gray-700 cursor-not-allowed text-gray-400" : "bg-purple-500 text-white hover:bg-purple-400 shadow-lg shadow-purple-500/20"
                        }`}
                      >
                        {isRecalculating ? "СЧИТАЕМ..." : "🔄 ПЕРЕСЧИТАТЬ ПОДБОРКУ"}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ПОПУЛЯРНОЕ */}
            <section className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="bg-orange-100 p-2 rounded-xl">🔥</span> Популярные новинки
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {popularGames.map(game => <GameCard key={game.id} game={game} />)}
              </div>
              <div className="flex justify-center">
                 <button 
                  onClick={() => navigate("/games?popular")} 
                  className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95"
                 >
                    СМОТРЕТЬ ВСЕ ПОПУЛЯРНЫЕ
                 </button>
              </div>
            </section>

            {/* ПЕРСОНАЛЬНЫЕ ТЕГИ */}
            {isAuth && recommendedTags.length > 0 && (
              <div className="space-y-20 py-10 border-t border-gray-100">
                {recommendedTags.map(tag => renderTagSection(tag, true))}
                <div className="flex justify-center">
                  <button onClick={() => {setRecommendedPage(p => p+1); loadRecommendedTags(recommendedPage+1)}} className="px-8 py-3 bg-purple-50 text-purple-600 rounded-2xl font-bold hover:bg-purple-100 transition border border-purple-100">
                      БОЛЬШЕ ИЗ МОИХ ЖАНРОВ
                  </button>
                </div>
              </div>
            )}

            {/* ОБЩИЕ КАТЕГОРИИ */}
            <div className="space-y-20 pt-20 border-t border-gray-100">
              <h2 className="text-4xl font-black text-gray-900 text-center">Все категории</h2>
              {generalTags
                  .filter(gt => !recommendedTags.find(rt => rt.id === gt.id))
                  .map(tag => renderTagSection(tag, false))
              }
              <div className="flex justify-center">
                <button onClick={() => {setGeneralPage(p => p+1); loadGeneralTags(generalPage+1)}} className="px-10 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-300 transition-all">
                  ЗАГРУЗИТЬ ЕЩЁ КАТЕГОРИИ
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}