import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites(0, false);
  }, []);

  const loadFavorites = (pageToLoad, append = true) => {
    setIsLoading(true);
    // Размер страницы 6, чтобы сетка 2x3 или 3x2 выглядела ровно
    api.get(`/interactions/favorites?page=${pageToLoad}&size=6`)
      .then((res) => {
        const data = res.data || [];
        
        // Если пришло меньше 6 элементов, значит это последняя страница
        if (data.length < 6) setHasMore(false);

        if (append) {
          setFavorites((prev) => [...prev, ...data]);
        } else {
          setFavorites(data);
        }
        setPage(pageToLoad);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-8">
        
        {/* Шапка с кнопкой назад */}
        <div className="flex items-center justify-between border-b pb-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-semibold transition-colors"
          >
            <span className="text-xl">←</span> Профиль
          </button>

          <h1 className="text-3xl font-extrabold text-gray-900">
            Избранные игры
          </h1>

          <div className="w-[85px]" /> {/* Для центровки заголовка */}
        </div>

        {/* Состояние, если список пуст */}
        {!isLoading && favorites.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="text-6xl text-gray-200">❤️</div>
            <p className="text-xl text-gray-400 font-medium">В вашем списке избранного пока пусто</p>
            <button 
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-purple-100 text-purple-600 rounded-xl font-bold hover:bg-purple-200 transition"
            >
              Найти игры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((game) => (
              <div
                key={game.id}
                className="group p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:border-purple-200 cursor-pointer transition-all flex flex-col gap-4"
                onClick={() => navigate(`/games/${game.id}`)}
              >
                {/* Картинка игры */}
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-200 relative">
                  <img
                    src={game.posterUrl}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                    ❤️
                  </div>
                </div>
                
                {/* Название */}
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-purple-600 transition-colors truncate">
                  {game.name}
                </h3>
              </div>
            ))}
          </div>
        )}

        {/* Кнопка "Загрузить еще" */}
        {hasMore && favorites.length > 0 && (
          <div className="flex justify-center mt-12 pt-6 border-t border-gray-50">
            <button
              onClick={() => loadFavorites(page + 1)}
              disabled={isLoading}
              className="px-10 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:bg-gray-300"
            >
              {isLoading ? "Загрузка..." : "Показать больше"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}