import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function HomePage() {
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
    if (!tagSearchTerm.trim()) {
      setFilteredTags(allTags);
      return;
    }

    const timeout = setTimeout(() => {
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
      const tags = res.data.content || res.data || [];
      setAllTags(tags);
      setFilteredTags(tags); 
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


  const GameCard = ({ game }) => {
    return (
      <div onClick={() => navigate(`/games/${game.gameId || game.id}`)} 
           className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 p-3 cursor-pointer group border border-gray-50 relative">
        {game.matchPercentage && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-pulse uppercase">
            {game.matchPercentage}% match
          </div>
        )}
        <div className="overflow-hidden rounded-[1.5rem] mb-3 aspect-[3/4]">
            <img src={game.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={game.name} />
        </div>
        <h3 className="font-bold text-sm text-gray-800 truncate mb-2 group-hover:text-purple-600 transition-colors px-1 uppercase tracking-tighter">
          {game.name}
        </h3>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[11px] font-black text-yellow-500">
            <span>⭐</span><span>{game.rating}</span>
          </div>
          {game.localRating > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-black text-purple-500 bg-purple-50 px-2 py-0.5 rounded-lg">
              <span>💎</span><span>{game.localRating.toFixed(1)}</span>
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
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-black text-gray-900 capitalize flex items-center gap-3 tracking-tighter">
            {tag.nameRu || tag.name}
            {isRecommended && <span className="text-[9px] bg-purple-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-200">Твой выбор</span>}
          </h2>
          <button onClick={() => navigate(`/games?tag=${tag.slug}`)} className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:text-purple-800 transition">Все в категории →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {games.map((game) => <GameCard key={`${tag.id}-${game.id}`} game={game} />)}
        </div>
        {loadedCount < 15 && (
          <div className="flex justify-center"><button onClick={() => addMoreGames(tag.id)} className="text-gray-300 hover:text-purple-600 transition-all text-2xl p-2 hover:bg-purple-50 rounded-full">⌄</button></div>
        )}
      </section>
    );
  };

  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-20">
      
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative w-full md:flex-1">
              <span className="absolute left-4 top-3 text-gray-400">🔍</span>
              <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Поиск по названию игры..." 
                     className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none transition font-medium" />
           </div>
           <button onClick={() => setShowTagFilter(!showTagFilter)} 
                   className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all w-full md:w-auto ${showTagFilter ? 'bg-gray-900 text-white shadow-xl' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
             {showTagFilter ? 'Закрыть фильтр' : 'Жанры и теги'}
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {showTagFilter && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-slide-down relative z-20">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Быстрый выбор категории</h3>
                <div className="h-px flex-1 bg-gray-50 mx-6"></div>
              </div>
              
              <input
                  type="text"
                  placeholder="Начните вводить название (например: Action, Хоррор)..."
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl mb-8 outline-none focus:bg-white border border-transparent focus:border-purple-200 transition font-medium"
              />

              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <span onClick={() => {navigate(`/games?tag=popular`); setShowTagFilter(false)}} 
                        className="px-4 py-2 rounded-xl text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-600 hover:text-white transition-all cursor-pointer uppercase">🔥 Популярное</span>
                  
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <span key={tag.id} onClick={() => {navigate(`/games?tag=${tag.slug}`); setShowTagFilter(false)}} 
                            className="px-4 py-2 rounded-xl text-[10px] font-black bg-gray-50 text-gray-500 border border-transparent hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all cursor-pointer uppercase">
                          {tag.nameRu || tag.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-300 text-xs italic p-4">Теги не найдены...</p>
                  )}
              </div>
          </div>
        )}

        {searchTerm ? (
          <section className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900 border-l-8 border-purple-500 pl-4 uppercase tracking-tighter italic">Результаты поиска</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.length > 0 ? searchResults.map(game => <GameCard key={game.id} game={game} />) : <p className="text-gray-400 font-bold uppercase text-xs p-10 text-center w-full">Ничего не найдено...</p>}
            </div>
          </section>
        ) : (
          <>
            {/* HERO: RECOMMENDATIONS */}
            {isAuth && recommendations.length > 0 && (
              <section className="bg-gray-900 p-8 md:p-12 rounded-[3rem] shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 blur-[150px] opacity-20 -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                      <span className="text-purple-400 font-black text-[9px] uppercase tracking-[0.4em] mb-3 block">Neural Engine Selection</span>
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Специально для тебя<span className="text-purple-600">.</span></h2>
                    </div>
                    <button onClick={handleRecalculate} disabled={isRecalculating} 
                            className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isRecalculating ? 'bg-gray-800 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-2xl shadow-purple-900/40'}`}>
                       {isRecalculating ? "Анализируем данные..." : "🔄 Обновить подборку"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recommendations.slice(0, 5).map(game => <GameCard key={game.id} game={game} />)}
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-10">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4 tracking-tighter uppercase">
                <span className="bg-orange-500 text-white p-2 rounded-2xl text-xl shadow-lg shadow-orange-200">🔥</span> Популярные новинки
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {popularGames.map(game => <GameCard key={game.id} game={game} />)}
              </div>
              <div className="flex justify-center pt-4">
                 <button onClick={() => navigate("/games?popular")} className="px-14 py-4 bg-gray-900 text-white rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-black transition-all shadow-xl active:scale-95">Смотреть весь каталог</button>
              </div>
            </section>

            <div className="space-y-24">
                {isAuth && recommendedTags.length > 0 && (
                  <div className="space-y-16 border-t border-gray-100 pt-16">
                    <h2 className="text-2xl font-black text-purple-600 border-l-8 border-purple-500 pl-6 uppercase tracking-tighter italic">Твои интересы</h2>
                    {recommendedTags.map(tag => renderTagSection(tag, true))}
                    <div className="flex justify-center"><button onClick={() => {setRecommendedPage(p => p+1); loadRecommendedTags(recommendedPage+1)}} className="px-10 py-3 bg-purple-50 text-purple-600 rounded-2xl font-black text-[9px] tracking-widest hover:bg-purple-100 transition-colors uppercase border border-purple-100">Больше из моих жанров</button></div>
                  </div>
                )}

                <div className="space-y-16 pt-16 border-t border-gray-100">
                    <h2 className="text-2xl font-black text-gray-300 uppercase tracking-[0.4em] text-center">Библиотека категорий</h2>
                    {generalTags.filter(gt => !recommendedTags.find(rt => rt.id === gt.id)).map(tag => renderTagSection(tag, false))}
                    <div className="flex justify-center"><button onClick={() => {setGeneralPage(p => p+1); loadGeneralTags(generalPage+1)}} className="px-12 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-full font-black text-[9px] tracking-widest hover:bg-gray-900 hover:text-white transition-all uppercase shadow-sm">Загрузить ещё категории</button></div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}