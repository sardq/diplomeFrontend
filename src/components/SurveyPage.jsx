import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";
import { AuthContent } from "./AuthContent";
export default function PreferencesPage() {
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const {email} = useContext(AuthContent);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    api.get(`/tags/search?search=${search}&size=6`)
      .then((res) => setTags(res.data || []))
      .catch(console.error);
  }, [search]);

  const rateTag = (tag, rating) => {
    setSelectedTags((prev) => ({
      ...prev,
      [tag.id]: { ...tag, rating }
    }));
  };

  const handleSave = () => {
    const tagDtos = Object.values(selectedTags).map(t => ({
        tagId: t.id,
        rating: t.rating
        }));
  
    api.post(`/preferences/init`, tagDtos)
      .then(() => navigate("/"))
      .catch(console.error);
  };

  const Rating = ({ tag }) => (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <span
          key={num}
          onClick={() => rateTag(tag, num)}
          className={`cursor-pointer text-2xl transition ${
            selectedTags[tag.id]?.rating >= num
              ? "text-yellow-400 scale-110"
              : "text-gray-300 hover:text-yellow-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-gray-900">
          Выбор предпочтений
        </h1>

        <input
          type="text"
          placeholder="Найти тег..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
        />

        {/* Теги */}
        <div className="grid grid-cols-2 gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="font-semibold text-gray-800">
                {tag.name}
              </div>
              <Rating tag={tag} />
            </div>
          ))}
        </div>

        {/* Выбранные */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Выбранные теги
          </h2>

          <div className="flex flex-wrap gap-3">
            {Object.values(selectedTags).map((tag) => (
                <div
                key={tag.id}
                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium shadow-sm flex items-center gap-2"
                >
                {tag.name} ⭐ {tag.rating}
                <span
                    className="cursor-pointer font-bold hover:text-red-500"
                    onClick={() => {
                    setSelectedTags((prev) => {
                        const newTags = { ...prev };
                        delete newTags[tag.id];
                        return newTags;
                    });
                    }}
                >
                    ×
                </span>
                </div>
            ))}
            </div>
        </div>

        {/* Кнопка */}
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