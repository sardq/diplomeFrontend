import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function HomePage() {
  const [popularGames, setPopularGames] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [gamesByTag, setGamesByTag] = useState({});
  const [loadedCounts, setLoadedCounts] = useState({});
  const [tagPage, setTagPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const tagSize = 5;
  const initialGameLoad = 5;
  const effectRan = useRef(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuth = !!token;
  
  const loadPopularGames = (size = initialGameLoad) => {
    axios
      .get(`/api/games/popular?size=${size}`)
      .then((res) => setPopularGames(res.data))
      .catch((err) => console.error(err));
  };

  const loadTags = (page = 0) => {
    axios
      .get(`/api/tags?page=${page}&size=${tagSize}`)
      .then((res) => {
        const newTags = res.data.content || [];
        if (!newTags.length) return;

        setTags((prev) => [...prev, ...newTags]);

        const initialCounts = {};
        newTags.forEach((tag) => (initialCounts[tag.id] = initialGameLoad));
        setLoadedCounts((prev) => ({ ...prev, ...initialCounts }));

        newTags.forEach((tag) => loadGamesByTag(tag.id, initialGameLoad));
      })
      .catch((err) => console.error(err));
  };

  const loadAllTags = () => {
    axios
      .get(`/api/tags?page=0&size=40`)
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
    axios
      .get(`/api/games/tag/${tagId}?page=0&size=${size}`)
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

  const handleSearch = () => {
    if (!searchTerm.trim()) return setSearchResults([]);
    axios
      .get(`/api/games/filter?search=${encodeURIComponent(searchTerm)}`)
      .then((res) => setSearchResults(res.data))
      .catch((err) => console.error(err));
  };

  const GameCard = ({ game }) => {

  const handleClick = () => {
    navigate(`/games/${game.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-2 cursor-pointer"
    >
      <img
        src={game.posterUrl}
        alt={game.name}
        className="h-48 w-full object-cover rounded-lg mb-2"
      />
      <h3 className="font-semibold text-sm text-gray-800">{game.name}</h3>
      <span className="text-yellow-500 font-bold text-sm">
        ⭐ {game.rating}
      </span>
    </div>
  );
};

  return (
    <div className="bg-gray-50 p-6 max-w-7xl mx-auto space-y-10 min-h-screen">

      {/* Опрос */}
      {isAuth && (
        <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Настрой рекомендации
            </h2>
            <p className="text-sm text-gray-500">
              Выбери свои любимые теги
            </p>
          </div>

          <button
            onClick={() => navigate("/preferences")}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Выбери теги
          </button>
        </div>
      )}

      {/* Поиск */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex w-2/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Теги фильтра */}
      {showTagFilter && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-5 gap-3">
          {allTags.map((tag) => (
            <span
              key={tag.id}
              onClick={() => navigate(`/games/tag/${tag.slug}`)}
              className="px-3 py-1 rounded-full cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 transition"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Поиск */}
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
          {/* Популярные */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
                  onClick={() => navigate("/games/popular")}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Загрузить ещё
                </button>
              )}
            </div>
          </section>

          {/* Теги */}
          {tags.map((tag) => {
            const games = gamesByTag[tag.id] || [];
            const loadedCount = loadedCounts[tag.id] || initialGameLoad;

            return (
              <section key={tag.id}>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {tag.name}
                </h2>

                <div className="grid grid-cols-5 gap-4">
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} />
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
                      onClick={() => navigate(`/games/tag/${tag.slug}`)}
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