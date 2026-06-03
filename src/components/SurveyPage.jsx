import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function PreferencesPage() {
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/tags/search?search=${search}&size=8`) 
      .then((res) => setTags(res.data || []))
      .catch(console.error);
  }, [search]);

  useEffect(() => {
    api.get("/preferences/user")
      .then((res) => {
        const data = res.data || [];
        const initialSelected = {};
        data.forEach(item => {
          initialSelected[item.tagId] = {
            id: item.tagId,
            name: item.tagName,
            nameRu: item.tagNameRu,
            rating: Math.min((item.preferenceWeight * 5), 5)  
          };
        });
        setSelectedTags(initialSelected);
      })
      .catch(console.error);
  }, []);

  const rateTag = (tag, rating) => {
    setSelectedTags(prev => ({
      ...prev,
      [tag.id]: { id: tag.id, name: tag.name, nameRu: tag.nameRu || tag.name, rating }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const tagDtos = Object.values(selectedTags).map(t => ({
      tagId: t.id,
      rating: t.rating
    }));

    api.post(`/preferences/init`, tagDtos)
      .then(() => navigate("/"))
      .catch(console.error)
      .finally(() => setIsSaving(false));
  };

 const Rating = ({ tag }) => {
    const rating = selectedTags[tag.id]?.rating || 0;
    const percentage = (rating / 5) * 100;

    return (
      <div
        className="relative inline-flex mt-3 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newRating = Math.min(5, Math.max(0, Math.round((clickX / rect.width) * 10) / 2));
          rateTag(tag, newRating);
        }}
      >
        <div className="flex text-3xl text-gray-200 group-hover:text-gray-300 transition-colors tracking-widest">
          ★★★★★
        </div>
        
        <div
          className="absolute top-0 left-0 flex text-3xl tracking-widest text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] pointer-events-none"
          style={{ 
            backgroundImage: `linear-gradient(90deg, #FACC15 ${percentage}%, transparent ${percentage}%)`,
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent'
          }}
        >
          ★★★★★
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#fcfcff] min-h-screen pb-20 p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-400 hover:text-purple-600 font-bold transition-colors uppercase tracking-[0.2em] text-[10px] mb-4"
            >
              ← Назад
            </button>
          </div>
          <div className="md:text-right max-w-xs">
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest leading-relaxed">
              Ваши оценки помогают гибридному алгоритму <br/> точнее формировать персональную ленту
            </p>
          </div>
        </div>

        <div className="relative group">
          <span className="absolute left-6 top-5 text-xl group-focus-within:scale-110 transition-transform">🔍</span>
          <input
            type="text"
            placeholder="Начните вводить жанр или тег (например: Экшен, RPG)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium text-gray-700 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="bg-white p-6 rounded-[2rem] border border-gray-50 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Категория</span>
              <div className="font-black text-xl text-gray-800 group-hover:text-purple-600 transition-colors">
                {tag.nameRu || tag.name}
              </div>
              <Rating tag={tag} />
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter italic">
                Нажмите на звезды для оценки
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-6 pt-10 border-t border-gray-100">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest italic">🎯 Твоя база интересов</h2>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">
               Выбрано: {Object.keys(selectedTags).length}
            </span>
          </div>

          {Object.keys(selectedTags).length === 0 ? (
            <div className="p-12 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Список предпочтений пуст. Найдите и оцените жанры выше.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.values(selectedTags).map(tag => (
                <div
                  key={tag.id}
                  className="px-6 py-3 bg-white border border-purple-100 text-gray-800 rounded-full font-bold shadow-sm flex items-center gap-3 animate-fade-in hover:border-purple-500 transition-colors"
                >
                  <span className="text-sm">{tag.nameRu || tag.name}</span>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">⭐ {tag.rating.toFixed(1)}</span>
                  <button
                    className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-lg leading-none pb-1"
                    onClick={() => setSelectedTags(prev => {
                      const newTags = { ...prev };
                      delete newTags[tag.id];
                      return newTags;
                    })}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-10">
          <button
            onClick={handleSave}
            disabled={isSaving || Object.keys(selectedTags).length === 0}
            className={`px-16 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${
              isSaving || Object.keys(selectedTags).length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-purple-600 shadow-purple-200'
            }`}
          >
            {isSaving ? "АНАЛИЗ ДАННЫХ..." : "СОХРАНИТЬ И ПРИМЕНИТЬ"}
          </button>
        </div>

      </div>
    </div>
  );
}