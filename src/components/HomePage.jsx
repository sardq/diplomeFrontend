import { useRef, useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [popularGames, setPopularGames] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]); // для фильтра по тегам
  const [gamesByTag, setGamesByTag] = useState({});
  const [loadedCounts, setLoadedCounts] = useState({});
  const [tagPage, setTagPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const tagSize = 5;
  const initialGameLoad = 5;
  const effectRan = useRef(false);

  // Загрузка популярных игр
  const loadPopularGames = (size = initialGameLoad) => {
    axios
      .get(`/api/games/popular?size=${size}`)
      .then((res) => setPopularGames(res.data))
      .catch((err) => console.error(err));
  };

  // Загрузка тегов для секций на главной
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

  // Загрузка всех тегов для фильтра
  const loadAllTags = () => {
    axios
      .get(`/api/tags?page=0&size=40`) // 30-40 тегов
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

  const GameCard = ({ game }) => (
    <div className="w-40 flex-shrink-0 bg-white rounded-xl shadow hover:shadow-lg transition p-2">
      <img
        src={game.posterUrl}
        alt={game.name}
        className="h-48 w-full object-cover rounded-t-xl mb-2"
      />
      <h3 className="font-semibold text-sm">{game.name}</h3>
      <span className="text-yellow-500 font-bold text-sm">⭐ {game.rating}</span>
    </div>
  );

  return (
    <div className="bg-gray-100 p-6 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* Верхняя панель: поиск и фильтр по тегу */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex w-2/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск игр..."
            className="px-4 py-2 border rounded-l w-full"
          />

        </div>
        <button
          onClick={() => setShowTagFilter(!showTagFilter)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-4"
        >
          Фильтр по тегу
        </button>
      </div>

      {/* Секция выбора тега */}
      {showTagFilter && (
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-5 gap-4">
        {allTags.map((tag) => (
          <span
            key={tag.id}
            onClick={() => window.location.href = `/games/tag/${tag.slug}`}
            className="px-2 py-1 rounded cursor-pointer text-gray-700 hover:bg-gray-200 transition"
          >
            {tag.name}
          </span>
        ))}
      </div>
    )}

      {/* Если выполнялся поиск */}
      {searchTerm ? (
        searchResults.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-2xl font-bold mb-2">Результаты поиска</h2>
            <div className="grid grid-cols-5 gap-4">
              {searchResults.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-gray-500 text-xl">Игра не найдена</p>
        )
      ) : (
        <>
          {/* Секция популярных игр */}
          <section className="space-y-2">
            <h2 className="text-2xl font-bold mb-2">Популярные игры</h2>
            <div className="grid grid-cols-5 gap-4">
              {popularGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
            <div className="flex justify-center mt-2">
              {popularGames.length < 10 ? (
                <button
                  onClick={() =>
                    loadPopularGames(popularGames.length + 5)
                  }
                  className="text-2xl"
                  title="Загрузить ещё"
                >
                  ⬇️
                </button>
              ) : (
                <a
                  href="/games/popular"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Загрузить ещё
                </a>
              )}
            </div>
          </section>

          {/* Секции тегов */}
          {tags.map((tag) => {
            const games = gamesByTag[tag.id] || [];
            const loadedCount = loadedCounts[tag.id] || initialGameLoad;

            return (
              <section key={tag.id} className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">{tag.name}</h2>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
                <div className="flex justify-center mt-2">
                  {loadedCount < 15 ? (
                    <button
                      onClick={() => addMoreGames(tag.id)}
                      className="text-2xl"
                      title="Загрузить ещё"
                    >
                      ⬇️
                    </button>
                  ) : (
                    <a
                      href={`/games/tag/${tag.slug}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Загрузить ещё
                    </a>
                  )}
                </div>
              </section>
            );
          })}

          {/* Кнопка загрузить больше тегов */}
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMoreTags}
              className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Загрузить больше тегов
            </button>
          </div>
        </>
      )}
    </div>
  );
}