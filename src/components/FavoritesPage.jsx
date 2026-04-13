import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites(0);
  }, []);

  const loadFavorites = (pageToLoad) => {
    api.get(`/interactions/favorites?page=${pageToLoad}&size=5`)
      .then((res) => {
        if (res.data.length < 5) setHasMore(false);

        setFavorites((prev) => [...prev, ...res.data]);
        setPage(pageToLoad);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">

        <div className="flex items-center justify-between">
        <button
            onClick={() => navigate("/profile")}
            className="text-gray-500 hover:text-gray-700 transition"
        >
            ← Назад
        </button>

        <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">
            Избранные игры
        </h1>

        <div className="w-[70px]" />
        </div>

        {favorites.length === 0 && (
          <p className="text-gray-500">Нет игр в избранном.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((game) => (
            <div
              key={game.id}
              className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition"
              onClick={() => navigate(`/games/${game.id}`)}
            >
              <p className="font-semibold">{game.name}</p>
            </div>
          ))}
        </div>

        {/* {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => loadFavorites(page + 1)}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
            >
              Загрузить еще
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}