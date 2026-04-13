import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function RecommendationsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get(`/recommendations/sessions/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSessions(res.data))
    .catch(console.error);
  }, [token]);

  const loadSessionDetails = (sessionId) => {
    axios.get(`/api/recommendations/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSelectedSession(res.data))
    .catch(console.error);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <button onClick={() => navigate("/")} className="text-purple-600 font-bold">← На главную</button>
      <h1 className="text-3xl font-bold">Архив твоих рекомендаций</h1>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-3">
          {sessions.map(s => (
            <div 
              key={s.id} 
              onClick={() => loadSessionDetails(s.id)}
              className={`p-4 rounded-lg cursor-pointer border transition ${selectedSession?.id === s.id ? 'bg-purple-100 border-purple-500' : 'bg-white hover:bg-gray-100'}`}
            >
              <p className="font-bold">Подборка №{s.id}</p>
              <p className="text-xs text-gray-500">{new Date(s.generatedAt).toLocaleString()}</p>
              <p className="text-xs font-semibold text-purple-600">Игр: {s.itemsCount}</p>
            </div>
          ))}
        </div>

        <div className="col-span-3 bg-white p-6 rounded-xl shadow-sm">
          {selectedSession ? (
            <div>
              <h2 className="text-xl font-bold mb-4">Результаты подбора от {new Date(selectedSession.generatedAt).toLocaleDateString()}</h2>
              <div className="grid grid-cols-3 gap-4">
                {selectedSession.items.map(item => (
                  <div key={item.gameId} className="border p-2 rounded-lg cursor-pointer" onClick={() => navigate(`/games/${item.gameId}`)}>
                    <img src={item.posterUrl} className="h-32 w-full object-cover rounded-md mb-2" alt="" />
                    <p className="text-sm font-bold truncate">{item.name}</p>
                    <p className="text-xs text-green-600 font-bold">Совпадение: {Math.round(item.recommendationScore * 100)}%</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-20">Выбери сессию слева, чтобы увидеть список игр</p>
          )}
        </div>
      </div>
    </div>
  );
}