import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/tags?page=0&size=100").then(res => setAllTags(res.data || []));
  }, []);

  useEffect(() => {
    fetchFavorites(0, false);
  }, [search, selectedTag]);

  const fetchFavorites = (pageToLoad, append = true) => {
    setIsLoading(true);
    api.get(`/interactions/favorites/filter`, {
      params: { 
        search: search || null, 
        tagId: selectedTag || null, 
        page: pageToLoad 
      }
    })
    .then((res) => {
      const newItems = res.data.content || [];
      setHasMore(!res.data.last);
      setFavorites(prev => append ? [...prev, ...newItems] : newItems);
      setPage(pageToLoad);
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold transition-colors"
          >
            <span className="text-xl">←</span> 
            <span className="hidden sm:inline uppercase tracking-wider text-xs">В профиль</span>
          </button>
          
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
            ❤️ Моё Избранное
          </h1>
          
          <div className="w-10 sm:w-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 flex flex-col md:flex-row gap-4 border border-gray-50">
          <div className="relative flex-1">
            <span className="absolute left-4 top-3 text-gray-400">🔍</span>
            <input 
              type="text"
              placeholder="Поиск по названию..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none transition font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative md:w-64">
            <span className="absolute left-4 top-3 text-gray-400">🏷️</span>
            <select 
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none transition font-bold text-gray-600 appearance-none cursor-pointer"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">Все жанры</option>
              {allTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.nameRu || tag.name}</option>
              ))}
            </select>
            <span className="absolute right-4 top-3.5 text-gray-300 pointer-events-none">▼</span>
          </div>
        </div>

        {/* СЕТКА ИГР (Адаптивная) */}
        {favorites.length === 0 && !isLoading ? (
          <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <div className="text-6xl mb-4">🌙</div>
            <h3 className="text-xl font-bold text-gray-400">Ничего не нашли...</h3>
            <p className="text-gray-300 mt-1">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map(game => (
              <div 
                key={game.id} 
                onClick={() => navigate(`/games/${game.id}`)}
                className="bg-white p-3 rounded-[24px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-100 group relative"
              >
                <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
                  <img 
                    src={game.posterUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                    alt={game.name} 
                  />
                </div>
                
                <h3 className="font-black text-sm text-gray-800 group-hover:text-purple-600 truncate px-1 transition-colors">
                  {game.name}
                </h3>
                
                <div className="flex items-center justify-between mt-3 px-1 border-t border-gray-50 pt-3">
                   <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-xs">⭐</span>
                      <span className="text-xs font-black text-gray-400">{game.rating}</span>
                   </div>
                   
                   {game.localRating > 0 && (
                     <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-lg">
                        <span className="text-xs">💎</span>
                        <span className="text-xs font-black text-purple-600">{game.localRating.toFixed(1)}</span>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && favorites.length > 0 && (
          <div className="flex justify-center mt-12">
            <button 
              onClick={() => fetchFavorites(page + 1, true)}
              disabled={isLoading}
              className={`px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                isLoading 
                ? 'bg-gray-200 text-gray-400 cursor-wait' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isLoading ? "Загружаем..." : "Показать больше"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}