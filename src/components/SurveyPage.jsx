import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function PreferencesPage() {
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const navigate = useNavigate();

  // Загрузка тегов по поиску
  useEffect(() => {
    api.get(`/tags/search?search=${search}&size=6`)
      .then((res) => setTags(res.data || []))
      .catch(console.error);
  }, [search]);

  // Загрузка предпочтений пользователя
  useEffect(() => {
    api.get("/preferences/user")
      .then((res) => {
        const data = res.data || [];
        const initialSelected = {};
        data.forEach(item => {
          initialSelected[item.tagId] = {
            id: item.tagId,
            name: item.tagName,
            rating: Math.min((item.preferenceWeight * 5), 5) // нормализуем до 5
          };
        });
        setSelectedTags(initialSelected);
      })
      .catch(console.error);
  }, []);

  // Изменение рейтинга тега
  const rateTag = (tag, rating) => {
    setSelectedTags(prev => ({
      ...prev,
      [tag.id]: { id: tag.id, name: tag.name, rating }
    }));
  };

  // Сохранение предпочтений
  const handleSave = () => {
    const tagDtos = Object.values(selectedTags).map(t => ({
      tagId: t.id,
      rating: t.rating
    }));

    api.post(`/preferences/init`, tagDtos)
      .then(() => navigate("/"))
      .catch(console.error);
  };

  // Компонент звездного рейтинга с дробной заливкой
  const Rating = ({ tag }) => {
    const rating = selectedTags[tag.id]?.rating || 0;
    const percentage = (rating / 5) * 100;

    return (
      <div
        className="relative inline-block w-max text-2xl mt-2 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newRating = Math.round((clickX / rect.width) * 5 * 2) / 2; // шаг 0.5
          rateTag(tag, newRating);
        }}
      >
        {/* Нижний слой серых звезд */}
        <div className="flex gap-1 text-gray-300">
          {[1, 2, 3, 4, 5].map(num => <span key={num}>★</span>)}
        </div>
        {/* Верхний слой желтых звезд с обрезкой */}
        <div
          className="absolute top-0 left-0 overflow-hidden flex gap-1 text-yellow-400"
          style={{ width: `${percentage}%` }}
        >
          {[1, 2, 3, 4, 5].map(num => <span key={num}>★</span>)}
        </div>
      </div>
    );
  };

  // Форматирование числа с 2 знаками после запятой
  const formatRating = (rating) => rating.toFixed(2);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Выбор предпочтений</h1>
          <button
            onClick={() => navigate(window.history.length > 1 ? -1 : "/profile")}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            ← Назад
          </button>
        </div>

        <input
          type="text"
          placeholder="Найти тег..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
        />

        <div className="grid grid-cols-2 gap-4">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="font-semibold text-gray-800">{tag.name}</div>
              <Rating tag={tag} />
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Выбранные теги</h2>
          <div className="flex flex-wrap gap-3">
            {Object.values(selectedTags).map(tag => (
              <div
                key={tag.id}
                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium shadow-sm flex items-center gap-2"
              >
                {tag.name} ⭐ {formatRating(tag.rating)}
                <span
                  className="cursor-pointer font-bold hover:text-red-500"
                  onClick={() => setSelectedTags(prev => {
                    const newTags = { ...prev };
                    delete newTags[tag.id];
                    return newTags;
                  })}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition shadow-md"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}