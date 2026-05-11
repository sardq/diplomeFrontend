import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function RecommendationsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get(`/recommendations/sessions/user`)
      .then(res => {
        setSessions(res.data);
        // Автоматически загружаем последнюю сессию, если список не пуст
        if (res.data.length > 0) {
          loadSessionDetails(res.data[0].id);
        }
      })
      .catch(console.error);
  }, [token]);

  const loadSessionDetails = (sessionId) => {
    setIsLoading(true);
    api.get(`/recommendations/session/${sessionId}`)
      .then(res => {
        setSelectedSession(res.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-[#fcfcff] min-h-screen pb-20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ХЕДЕР */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-gray-400 hover:text-purple-600 font-bold transition-colors uppercase tracking-[0.2em] text-[10px]"
          >
            ← На главную
          </button>
          <div className="flex flex-col md:items-end">
          </div>
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* ЛЕВАЯ КОЛОНКА: СПИСОК СЕССИЙ */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Ваши подборки</h2>
            <div className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="p-6 bg-white rounded-3xl border border-dashed border-gray-200 text-center w-full">
                  <p className="text-gray-400 text-xs font-bold uppercase">История пуста</p>
                </div>
              ) : (
                sessions.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => loadSessionDetails(s.id)}
                    className={`flex-shrink-0 w-64 lg:w-full p-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 border-2 ${
                      selectedSession?.id === s.id 
                      ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-200' 
                      : 'bg-white border-gray-50 hover:border-purple-200 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className={`font-black text-sm uppercase tracking-tighter ${selectedSession?.id === s.id ? 'text-white' : 'text-gray-900'}`}>
                        Подборка #{s.id}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedSession?.id === s.id ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
                        {s.itemsCount} игр
                      </span>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedSession?.id === s.id ? 'text-purple-100' : 'text-gray-400'}`}>
                      {new Date(s.generatedAt).toLocaleDateString()} — {new Date(s.generatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: ДЕТАЛИ СЕССИИ */}
          <div className="lg:col-span-3">
            {selectedSession ? (
              <div className={`bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-gray-50 pb-8">
                  <div>
                    <span className="text-purple-600 font-black text-[9px] uppercase tracking-[0.3em] mb-2 block">Результаты анализа</span>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
                      Подборка от {new Date(selectedSession.generatedAt).toLocaleDateString()}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {selectedSession.items.map(item => (
                    <div 
                      key={item.gameId} 
                      className="group bg-gray-50/50 p-3 rounded-[2rem] border border-transparent hover:border-purple-200 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer"
                      onClick={() => navigate(`/games/${item.gameId}`)}
                    >
                      <div className="relative aspect-video overflow-hidden rounded-2xl mb-4 bg-gray-200">
                        <img src={item.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.name} />
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">
                           {Math.round(item.recommendationScore * 100)}% match
                        </div>
                      </div>
                      <h3 className="font-black text-xs text-gray-800 uppercase tracking-tighter px-2 truncate group-hover:text-purple-600 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 px-2 mt-2">
                        <span className="text-yellow-500 text-[10px]">★</span>
                        <span className="text-[10px] font-black text-gray-400">{item.rating}</span>
                        {item.localRating > 0 && (
                          <>
                             <span className="text-gray-200 mx-1">|</span>
                             <span className="text-purple-500 font-black text-[10px]">💎 {item.localRating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6">📂</div>
                 <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Выберите сессию</h3>
                 <p className="text-gray-400 text-sm mt-2 font-medium">Нажмите на нужную дату слева, чтобы <br/> просмотреть историю рекомендаций</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}