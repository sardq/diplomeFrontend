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

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (isAuth) {
      loadRecommendations();
      checkUserPreferences();
    }
  }, [isAuth]);

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
    } catch (err) {
      console.error("Ошибка при пересчете:", err);
    } finally {
      setIsRecalculating(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!tagSearchTerm.trim()) {
        setFilteredTags(allTags);
        return;
      }
      api.get(`/tags/search?search=${encodeURIComponent(tagSearchTerm)}&size=20`)
        .then((res) => setFilteredTags(res.data || []))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tagSearchTerm, allTags]);

  const loadPopularGames = (size = initialGameLoad) => {
    api.get(`/games/popular?size=${size}`)
      .then((res) => setPopularGames(res.data))
      .catch((err) => console.error(err));
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
    api.get(`/tags?page=0&size=40`)
      .then((res) => {
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
      .then((res) => setGamesByTag((prev) => ({ ...prev, [tagId]: res.data })))
      .catch((err) => console.error(err));
  };

  const addMoreGames = (tagId) => {
    const newCount = loadedCounts[tagId] + 5;
    setLoadedCounts((prev) => ({ ...prev, [tagId]: newCount }));
    loadGamesByTag(tagId, newCount);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) return setSearchResults([]);
    api.get(`/games/filter?search=${encodeURIComponent(e.target.value)}`)
      .then((res) => setSearchResults(res.data))
      .catch((err) => console.error(err));
  };

  const renderTagSection = (tag, isRecommended = false) => {
    const games = gamesByTag[tag.id] || [];
    const loadedCount = loadedCounts[tag.id] || initialGameLoad;

    return (
      <section key={tag.id} className="animate-fade-in">
        <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize flex items-center gap-2">
          {tag.name}
          {isRecommended && (
            <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded uppercase tracking-wider">
              Твой жанр
            </span>
          )}
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {games.map((game) => (
            <GameCard key={`${tag.id}-${game.id}`} game={game} />
          ))}
        </div>
        <div className="flex justify-center mt-3">
          {loadedCount < 15 ? (
            <button onClick={() => addMoreGames(tag.id)} className="text-2xl">⬇️</button>
          ) : (
            <button onClick={() => navigate(`/games?tag=${tag.slug}`)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Смотреть всё
            </button>
          )}
        </div>
      </section>
    );
  };

  const GameCard = ({ game }) => {
    const handleClick = (e) => {
      if (e.target.closest(".rating-link")) return;
      navigate(`/games/${game.gameId || game.id}`);
    };

    return (
      <div onClick={handleClick} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-2 cursor-pointer relative group">
        {/* Бейдж процента совпадения */}
        {game.matchPercentage && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
            {game.matchPercentage}% совпадение
          </div>
        )}
        
        <div className="overflow-hidden rounded-lg mb-2">
            <img src={game.posterUrl} alt={game.name} className="h-48 w-full object-cover group-hover:scale-105 transition duration-300" />
        </div>
        <h3 className="font-semibold text-sm text-gray-800 truncate mb-1">{game.name}</h3>
        
        {/* СТРОКА РЕЙТИНГОВ */}
        <div className="flex items-center justify-between">
          {/* Рейтинг RAWG */}
          <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
            <span>⭐</span>
            <span>{game.rating}</span>
          </div>

          {/* Локальный рейтинг (если есть) */}
          {game.localRating > 0 && (
            <div 
              className="flex items-center gap-1 text-xs font-bold text-purple-500" 
              title={`Оценок на сайте: ${game.localRatingCount}`}
            >
              <span>💎</span>
              <span>{game.localRating?.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 max-w-7xl mx-auto space-y-12 min-h-screen">
      
      {isAuth && !hasPreferences && (
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border-l-8 border-purple-500">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Давай настроим рекомендации!</h2>
            <p className="text-gray-500">Выбери любимые жанры, чтобы мы подобрали идеальные игры.</p>
          </div>
          <button onClick={() => navigate("/preferences")} className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-bold shadow-lg shadow-purple-200">
            Пройти опрос
          </button>
        </div>
      )}

      {isAuth && hasPreferences && (
         <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
            <p className="text-gray-500 text-sm">Твоя подборка обновляется автоматически на основе твоих оценок.</p>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className={`px-5 py-2 rounded-lg text-white font-bold transition flex items-center gap-2 ${
                isRecalculating ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {isRecalculating ? "Обновляем..." : "🔄 Обновить подборку"}
            </button>
         </div>
      )}

      <div className="flex justify-between items-center gap-4">
        <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Найти игру по названию..."
            className="px-6 py-3 border border-gray-200 rounded-2xl w-full focus:ring-4 focus:ring-purple-100 outline-none transition"
        />
        <button onClick={() => setShowTagFilter(!showTagFilter)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-semibold whitespace-nowrap">
          🔍 По тегам
        </button>
      </div>

      {showTagFilter && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-slide-down">
            <input
                type="text"
                placeholder="Поиск по тегам..."
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 mb-4 focus:bg-white transition"
            />
            <div className="flex flex-wrap gap-2">
                {(showAllTags ? filteredTags : filteredTags.slice(0, 10)).map((tag) => (
                    <span key={tag.id} onClick={() => navigate(`/games?tag=${tag.slug}`)} className="px-4 py-1.5 rounded-full cursor-pointer text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-500 hover:text-white transition">
                        {tag.name}
                    </span>
                ))}
            </div>
            {filteredTags.length > 10 && (
                <button onClick={() => setShowAllTags(!showAllTags)} className="text-indigo-500 text-xs mt-4 font-bold hover:underline">
                    {showAllTags ? "Скрыть" : "Показать все теги"}
                </button>
            )}
        </div>
      )}

      {searchTerm ? (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Результаты поиска</h2>
          <div className="grid grid-cols-5 gap-6">
            {searchResults.length > 0 ? searchResults.map(game => <GameCard key={game.id} game={game} />) : <p className="text-gray-400">Ничего не найдено</p>}
          </div>
        </section>
      ) : (
        <div className="space-y-16">
          {isAuth && recommendations.length > 0 && (
            <section className="bg-indigo-900 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-20 -mr-20 -mt-20"></div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                 Специально для тебя
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {recommendations.slice(0, 5).map((game) => (
                  <GameCard key={`rec-${game.gameId || game.id}`} game={game} />
                ))}
              </div>
              {recommendations.length > 5 && (
                <div className="flex justify-end mt-6">
                  <button onClick={() => navigate("/recommendations")} className="text-indigo-200 hover:text-white font-bold text-sm transition">
                    Смотреть весь список →
                  </button>
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Популярное сейчас</h2>
            <div className="grid grid-cols-5 gap-6">
              {popularGames.map(game => <GameCard key={game.id} game={game} />)}
            </div>
          </section>

          {isAuth && recommendedTags.length > 0 && (
            <div className="space-y-12">
              <h2 className="text-2xl font-bold text-purple-600 border-b border-purple-100 pb-2">Твои любимые жанры</h2>
              {recommendedTags.map(tag => renderTagSection(tag, true))}
              <div className="flex justify-center">
                <button onClick={() => {setRecommendedPage(p => p+1); loadRecommendedTags(recommendedPage+1)}} className="px-8 py-3 bg-purple-50 text-purple-600 rounded-2xl font-bold hover:bg-purple-100 transition">
                    Больше твоих жанров
                </button>
              </div>
            </div>
          )}

          <div className="space-y-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Все категории</h2>
            {generalTags
                .filter(gt => !recommendedTags.find(rt => rt.id === gt.id))
                .map(tag => renderTagSection(tag, false))
            }
            <div className="flex justify-center">
              <button onClick={() => {setGeneralPage(p => p+1); loadGeneralTags(generalPage+1)}} className="px-8 py-3 bg-gray-800 text-white rounded-2xl font-bold hover:bg-gray-900 transition">
                Загрузить ещё категории
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}