import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function HomePage() {
  // === СУЩЕСТВУЮЩИЕ СОСТОЯНИЯ ===
  const [popularGames, setPopularGames] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [gamesByTag, setGamesByTag] = useState({});
  const [loadedCounts, setLoadedCounts] = useState({});
  const [tagPage, setTagPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState(allTags);
  const [showAllTags, setShowAllTags] = useState(false);

  // === НОВЫЕ СОСТОЯНИЯ ДЛЯ РЕКОМЕНДАЦИЙ ===
  const [recommendations, setRecommendations] = useState([]);
  const [hasPreferences, setHasPreferences] = useState(true); // По умолчанию true, чтобы блок не мигал
  const [isRecalculating, setIsRecalculating] = useState(false);

  const tagSize = 5;
  const initialGameLoad = 5;
  const effectRan = useRef(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuth = !!token;
  

  // === АВТОРИЗАЦИОННЫЕ ЗАГОЛОВКИ ===
  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // === ЭФФЕКТ ДЛЯ РЕКОМЕНДАЦИЙ И ПРОВЕРКИ ПРЕДПОЧТЕНИЙ ===
  useEffect(() => {
    if (isAuth) {
      loadRecommendations();
      checkUserPreferences();
    }
  }, [isAuth]);

  // Загрузка рекомендаций с бэкенда
  const loadRecommendations = () => {
    api
      .get(`/recommendations/user`, authHeaders)
      .then((res) => setRecommendations(res.data))
      .catch((err) => console.error("Ошибка загрузки рекомендаций:", err));
  };

  // Проверка, есть ли у пользователя выбранные теги (для скрытия опросника)
  const checkUserPreferences = () => {
    // Предполагается, что на бэкенде есть эндпоинт, возвращающий true/false 
    // или список предпочтений. Замените URL на ваш актуальный.
    api
      .get(`/preferences/user/has-preferences`, authHeaders)
      .then((res) => setHasPreferences(res.data)) // res.data должен быть boolean
      .catch(() => setHasPreferences(false)); // В случае ошибки показываем опросник
  };

  // Кнопка ручного пересчета
  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await api.post(`/recommendations/recalculate`, {}, authHeaders);
      await loadRecommendations(); // Перезагружаем рекомендации
      await checkUserPreferences(); // Обновляем статус опросника
    } catch (err) {
      console.error("Ошибка при пересчете:", err);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Поиск тегов
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!tagSearchTerm.trim()) {
        setFilteredTags(allTags);
        return;
      }
      api
        .get(`/tags/search?search=${encodeURIComponent(tagSearchTerm)}&size=20`)
        .then((res) => setFilteredTags(res.data || []))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tagSearchTerm, allTags]);

  const loadPopularGames = (size = initialGameLoad) => {
    api
      .get(`/games/popular?size=${size}`)
      .then((res) => setPopularGames(res.data))
      .catch((err) => console.error(err));
  };

  const loadTags = (page = 0) => {
    const endpoint = isAuth 
        ? `/tags/recommended?page=${page}&size=${tagSize}` 
        : `/tags?page=${page}&size=${tagSize}`;

    api
      .get(endpoint, isAuth ? authHeaders : {})
      .then((res) => {
        const newTags = res.data.content || res.data || []; // Поддержка разных ответов
        if (!newTags.length) return;

        setTags((prev) => {
            const existingIds = new Set(prev.map(t => t.id));
            const uniqueNewTags = newTags.filter(t => !existingIds.has(t.id));
            return [...prev, ...uniqueNewTags];
        });

        const initialCounts = {};
        newTags.forEach((tag) => (initialCounts[tag.id] = initialGameLoad));
        setLoadedCounts((prev) => ({ ...prev, ...initialCounts }));

        newTags.forEach((tag) => loadGamesByTag(tag.id, initialGameLoad));
      })
      .catch((err) => console.error(err));
  };

  const loadAllTags = () => {
    api
      .get(`/tags?page=0&size=40`)
      .then((res) => setAllTags(res.data.content || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (effectRan.current) return;
    loadPopularGames();
    loadTags(0);
    loadAllTags();
    effectRan.current = true;
  }, []);

  const loadGamesByTag = (tagId, size) => {
    api
      .get(`/games/tag/${tagId}?page=0&size=${size}`)
      .then((res) => setGamesByTag((prev) => ({ ...prev, [tagId]: res.data })))
      .catch((err) => console.error(err));
  };

  const addMoreGames = (tagId) => {
    const newCount = loadedCounts[tagId] + 5;
    setLoadedCounts((prev) => ({ ...prev, [tagId]: newCount }));
    loadGamesByTag(tagId, newCount);
  };

  const loadMoreTags = () => {
    const nextPage = tagPage + 1;
    loadTags(nextPage);
    setTagPage(nextPage);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) return setSearchResults([]);
    api
      .get(`/games/filter?search=${encodeURIComponent(e.target.value)}`)
      .then((res) => setSearchResults(res.data))
      .catch((err) => console.error(err));
  };

  const GameCard = ({ game }) => {
    const handleClick = (e) => {
      if (e.target.closest(".rating-link")) return;
      navigate(`/games/${game.gameId || game.id}`); // Поддержка RecommendationDto
    };

    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-2 cursor-pointer relative" // добавили relative
      >
        {game.matchPercentage && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
            {game.matchPercentage}% совпадение
          </div>
        )}

        <img
          src={game.posterUrl}
          alt={game.name}
          className="h-48 w-full object-cover rounded-lg mb-2"
        />
        <h3 className="font-semibold text-sm text-gray-800">{game.name}</h3>
        <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
          <a
            href="https://rawg.io"
            target="_blank"
            rel="noopener noreferrer"
            className="rating-link flex items-center gap-1"
          >
            <span>⭐</span>
            <img src="https://rawg.io/favicon.ico" alt="RAWG" className="h-4 w-4" />
            <span>{game.rating}</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 max-w-7xl mx-auto space-y-10 min-h-screen">
      
      {isAuth && !hasPreferences && (
        <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-purple-500">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Давай настроим рекомендации!
            </h2>
            <p className="text-sm text-gray-500">
              Выбери любимые жанры, чтобы мы подобрали идеальные игры.
            </p>
          </div>
          <button
            onClick={() => navigate("/preferences")}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Пройти опрос
          </button>
        </div>
      )}

      {isAuth && hasPreferences && (
         <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
            <p className="text-gray-600 text-sm">
                Твоя история обновляется при просмотре и оценке игр.
            </p>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                isRecalculating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isRecalculating ? "⏳ Обновление..." : "🔄 Обновить подборку"}
            </button>
         </div>
      )}

      {/* ПОИСК И ФИЛЬТРЫ */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex w-2/3">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Поиск игр..."
            className="px-4 py-2 border border-gray-300 rounded-l-lg w-full focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <button
          onClick={() => setShowTagFilter(!showTagFilter)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Фильтр по тегу
        </button>
      </div>

      {showTagFilter && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 space-y-4">
        <input
          type="text"
          placeholder="Найти тег..."
          value={tagSearchTerm}
          onChange={(e) => setTagSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
        />

        <div className="grid grid-cols-5 gap-3">
          {(showAllTags ? filteredTags : filteredTags.slice(0, 5)).map((tag) => (
            <span
              key={tag.id}
              onClick={() => navigate(`/games?tag=${tag.slug}`)}
              className="px-3 py-1 rounded-full cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 transition"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {filteredTags.length > 5 && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setShowAllTags((prev) => !prev)}
              className="text-blue-500 hover:underline"
            >
              {showAllTags ? "Скрыть" : "Показать ещё"}
            </button>
          </div>
        )}
      </div>
      )}

      {searchTerm ? (
        searchResults.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Результаты поиска
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {searchResults.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-gray-500 text-xl">
            Игра не найдена
          </p>
        )
      ) : (
        <>
          {isAuth && recommendations.length > 0 && (
            <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-purple-100">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
                 Рекомендовано для тебя
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {recommendations.slice(0, 5).map((game) => (
                  <GameCard key={`rec-${game.gameId || game.id}`} game={game} />
                ))}
              </div>
              {recommendations.length > 5 && (
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={() => navigate("/recommendations")} 
                    className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                  >
                    Смотреть все подборки →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ПОПУЛЯРНЫЕ ИГРЫ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Популярные игры
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {popularGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
            <div className="flex justify-center mt-3">
              {popularGames.length < 10 ? (
                <button
                  onClick={() =>
                    loadPopularGames(popularGames.length + 5)
                  }
                  className="text-2xl"
                >
                  ⬇️
                </button>
              ) : (
                <button
                  onClick={() => navigate("/games?popular")}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Загрузить ещё
                </button>
              )}
            </div>
          </section>

          {tags.map((tag) => {
            const games = gamesByTag[tag.id] || [];
            const loadedCount = loadedCounts[tag.id] || initialGameLoad;

            return (
              <section key={tag.id}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8 capitalize">
                  {tag.name}
                </h2>
                <div className="grid grid-cols-5 gap-4">
                  {games.map((game) => (
                    <GameCard key={`${tag.id}-${game.id}`} game={game} />
                  ))}
                </div>
                <div className="flex justify-center mt-3">
                  {loadedCount < 15 ? (
                    <button
                      onClick={() => addMoreGames(tag.id)}
                      className="text-2xl"
                    >
                      ⬇️
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/games?tag/${tag.slug}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Загрузить ещё
                    </button>
                  )}
                </div>
              </section>
            );
          })}

          <div className="flex justify-center mt-6">
            <button
              onClick={loadMoreTags}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Загрузить больше тегов
            </button>
          </div>
        </>
      )}
    </div>
  );
}