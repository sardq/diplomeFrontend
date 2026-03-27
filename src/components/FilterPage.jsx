import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function GamesPage() {
  const [allTags, setAllTags] = useState([]);
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalGames, setTotalGames] = useState(0);
  const [tagName, setTagName] = useState("");
  
  const [searchParams] = useSearchParams();
  const tagSlug = searchParams.get("tag") || "popular"; // popular по умолчанию
  const pageSize = 10;

  // Загрузка тегов для фильтра
  useEffect(() => {
    axios.get("/api/tags?page=0&size=40")
      .then(res => setAllTags(res.data.content || []))
      .catch(err => console.error(err));
  }, []);

  // Загрузка игр
  const loadGames = (pageNum = 0, append = false) => {
    let url = tagSlug === "popular"
      ? `/api/games/popular?page=${pageNum}&size=${pageSize}`
      : `/api/games/tag/${tagSlug}?page=${pageNum}&size=${pageSize}`;

    axios.get(url)
      .then(res => {
        if (append) {
          setGames(prev => [...prev, ...res.data]);
        } else {
          setGames(res.data);
        }
        setTotalGames(prev => append ? prev + res.data.length : res.data.length);

        // Установим название для заголовка
        if (tagSlug === "popular") {
          setTagName("Популярные игры");
        } else {
          const tag = allTags.find(t => t.slug === tagSlug);
          setTagName(tag ? tag.name : "Игры по тегу");
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadGames(0, false);
    setPage(0);
  }, [tagSlug, allTags]);

  const loadMore = () => {
    const nextPage = page + 1;
    loadGames(nextPage, true);
    setPage(nextPage);
  };

  const GameCard = ({ game }) => (
    <div className="flex bg-white rounded-xl shadow p-4 mb-4 hover:shadow-lg transition">
      <img
        src={game.posterUrl}
        alt={game.name}
        className="h-32 w-24 object-cover rounded mr-4"
      />
      <div>
        <h3 className="font-semibold text-lg">{game.name}</h3>
        <span className="text-yellow-500 font-bold">⭐ {game.rating}</span>
        <p className="text-gray-600 mt-2">{game.description}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 p-6 max-w-5xl mx-auto min-h-screen">

      {/* Секция фильтра тегов */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-5 gap-4">
        {allTags.map(tag => (
          <span
            key={tag.id}
            onClick={() => window.location.href = `/games?tag=${tag.slug}`}
            className={`px-2 py-1 rounded cursor-pointer transition
              ${tag.slug === tagSlug ? "bg-gray-300 font-semibold" : "hover:bg-gray-200"}`}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Заголовок */}
      <h2 className="text-2xl font-bold mb-6">{tagName}</h2>

      {/* Список игр */}
      {games.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Игра не найдена</p>
      ) : (
        <>
          {games.map(game => <GameCard key={game.id} game={game} />)}

          {/* Кнопка загрузить еще */}
          {games.length < totalGames + pageSize && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Загрузить ещё
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}