import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function GamesPage() {
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
  
  const [searchParams] = useSearchParams();
  const tagSlug = searchParams.get("tag") || "popular"; // popular по умолчанию
  const pageSize = 10;

  // Загрузка тегов для фильтра
  useEffect(() => {
    axios.get("/api/tags?page=0&size=40")
      .then(res => setAllTags(res.data.content || []))
      .catch(err => console.error(err));
  }, []);
  useEffect(() => {
  const timeout = setTimeout(() => {
    if (!tagSearch.trim()) {
      setFilteredTags(allTags);
      return;
    }

    axios.get(`/api/tags/search?search=${tagSearch}&size=20`)
      .then(res => setFilteredTags(res.data || []))
      .catch(console.error);
  }, 300);
  
    return () => clearTimeout(timeout);
  }, [tagSearch, allTags]);
  const visibleTags = showAllTags
      ? filteredTags
      : filteredTags.slice(0, 5);
  const loadGames = (pageNum = 0, append = false) => {
    let url;

    if (tagSlug === "popular") {
      url = `/api/games/popular?page=${pageNum}&size=${pageSize}`;
    } else {
      const tag = allTags.find(t => t.slug === tagSlug);

      if (!tag) {
        console.error("Tag not found:", tagSlug);
        return;
      }

      url = `/api/games/tag/${tag.id}?page=${pageNum}&size=${pageSize}`;
    }
    axios.get(url)
      .then(res => {
        if (append) {
          setGames(prev => [...prev, ...res.data]);
        } else {
          setGames(res.data);
        }
        setTotalGames(prev => append ? prev + res.data.length : res.data.length);

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
  const lastElement = lastItemRef.current;

  const nextPage = page + 1;

  setLoadingMore(true);

  loadGames(nextPage, true);

  setPage(nextPage);

  setTimeout(() => {
    if (lastElement) {
      lastElement.scrollIntoView({
        behavior: "auto", 
        block: "start"
      });
    }
  }, 100);
};

  const GameCard = ({ game, onClick }) => (
    <div onClick={onClick} className="flex bg-white rounded-xl shadow p-4 mb-4 hover:shadow-lg transition">
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

      <div className="bg-white p-4 rounded shadow mb-6 space-y-4">

  <input
    type="text"
    placeholder="Найти тег..."
    value={tagSearch}
    onChange={(e) => setTagSearch(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
  />

      <div className="grid grid-cols-5 gap-4">
        {visibleTags.map(tag => (
          <span
            key={tag.id}
            onClick={() => navigate(`/games?tag=${tag.slug}`)}
            className={`px-2 py-1 rounded cursor-pointer transition text-center
              ${tag.slug === tagSlug 
                ? "bg-gray-300 font-semibold" 
                : "hover:bg-gray-200"}`}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {filteredTags.length > 5 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAllTags(prev => !prev)}
            className="text-blue-500 hover:underline"
          >
            {showAllTags ? "Скрыть" : "Показать ещё"}
          </button>
        </div>
      )}
    </div>

      <h2 className="text-2xl font-bold mb-6">{tagName}</h2>

      {games.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Игра не найдена</p>
      ) : (
        <>
          {games.map((game,index) =>
          <div key={game.id} ref={index === games.length - 1 ? lastItemRef : null}>
          <GameCard  game={game} onClick={() => navigate(`/games/${game.id}`)}/>
            </div> )}

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