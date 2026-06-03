import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newBirthDate, setNewBirthDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    api.get("/interactions/favorites")
      .then((res) => setFavorites(res.data))
      .catch((err) => console.error(err));
    loadReviews(0);
  }, []);

  const loadUserData = () => {
    api.get("/auth/me")
      .then((res) => {
        setUser(res.data);
        if (res.data.birthDate) {
          setNewBirthDate(new Date(res.data.birthDate).toISOString().split('T')[0]);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой! Максимум 5МБ");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      const res = await api.post("/users/avatar", formData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      setUser({ ...user, avatarUrl: res.data });
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const saveBirthDate = () => {
    api.put("/users/update-birthdate", { birthDate: newBirthDate })
      .then((res) => { setIsEditingDate(false); setUser(res.data); })
      .catch((err) => console.error(err));
  };

  const loadReviews = (page) => {
    api.get(`/interactions/reviews/my?page=${page}&size=5`)
      .then((res) => {
        if (res.data.length < 5) setHasMoreReviews(false);
        setReviews((prev) => page === 0 ? res.data : [...prev, ...res.data]);
        setReviewsPage(page);
      })
      .catch((err) => console.error(err));
  };

  if (!user) return (
    <div className="flex justify-center items-center h-screen text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">
      Загрузка профиля...
    </div>
  );

  return (
    <div className="bg-[#fcfcff] min-h-screen pb-20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* НАВИГАЦИЯ */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-gray-400 hover:text-purple-600 font-bold transition-colors uppercase tracking-[0.2em] text-[10px]"
          >
            ← На главную
          </button>
          <div className="h-px flex-1 bg-gray-100 mx-8 hidden md:block"></div>
        </div>

        {/* ОСНОВНОЙ БЛОК (Bento Card) */}
        <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-gray-100 flex flex-col md:flex-row gap-10 items-center md:items-start transition-all shadow-sm">
          
          {/* Аватар */}
          <div className="relative group flex-shrink-0">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border border-gray-100 bg-gray-50 transition-all ${isUploading ? 'opacity-50' : ''}`}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full bg-purple-50 flex justify-center items-center text-purple-600 text-6xl font-black">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <input type="file" onChange={handleAvatarChange} className="hidden" id="avatarInput" disabled={isUploading} />
            <label htmlFor="avatarInput" className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-all cursor-pointer backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Сменить фото</span>
            </label>
          </div>

          {/* Инфо и настройки */}
          <div className="flex-1 space-y-6 w-full">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">{user.username}</h2>
              <p className="text-gray-400 font-bold text-xs tracking-wider mt-1">{user.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Дата регистрации</span>
                <p className="text-gray-700 font-bold text-sm">{new Date(user.registrationDate).toLocaleDateString()}</p>
              </div>

              <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Дата рождения</span>
                {isEditingDate ? (
                  <div className="flex items-center gap-2">
                    <input type="date" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)}
                           className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-purple-400" />
                    <button onClick={saveBirthDate} className="text-purple-600 font-black text-[10px] uppercase">ОК</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-gray-700 font-bold text-sm">{user.birthDate ? new Date(user.birthDate).toLocaleDateString() : "Не указана"}</p>
                    <button onClick={() => setIsEditingDate(true)} className="text-purple-500 text-[9px] font-black hover:underline uppercase tracking-widest">Изменить</button>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => navigate("/preferences")}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-100">
              ⚙️ Настроить рекомендации
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest italic">❤️ Избранное</h3>
            {favorites.length > 0 && (
              <button onClick={() => navigate("/favorites")} className="text-[9px] font-black text-purple-600 hover:text-purple-800 transition-all uppercase tracking-widest">
                Смотреть всё ({favorites.length}) →
              </button>
            )}
          </div>
          
          {favorites.length === 0 ? (
            <div className="py-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
              <p className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Ваш список пуст</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {favorites.map((game) => (
                <div key={game.id} onClick={() => navigate(`/games/${game.id}`)}
                     className="bg-white p-2 rounded-[1.5rem] border border-gray-50 hover:border-purple-200 transition-all cursor-pointer group">
                  <div className="overflow-hidden rounded-xl mb-3 aspect-[3/4] bg-gray-50">
                    <img src={game.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="" />
                  </div>
                  <p className="font-bold text-[10px] text-gray-700 truncate px-1 uppercase tracking-tighter text-center">{game.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest px-4 italic">✍️ Мои отзывы</h3>
          {reviews.length === 0 ? (
            <div className="py-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
               <p className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Вы еще не писали обзоров</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} onClick={() => navigate(`/games/${review.id}`)}
                     className="p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-purple-100 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black text-purple-600 uppercase tracking-[0.2em] bg-purple-50 px-3 py-1 rounded-lg">
                        {review.gameTitile}
                      </span>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-gray-900 font-black text-[11px]">{review.rating}</span>
                      </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed border-l-2 border-purple-200 pl-6 italic">
                    {review.review && review.review.trim() !== "" ? review.review : "Вы поставили оценку без текстового комментария"}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {hasMoreReviews && reviews.length > 0 && (
            <div className="flex justify-center mt-6">
              <button onClick={() => loadReviews(reviewsPage + 1)}
                      className="px-10 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 shadow-sm">
                Загрузить ещё
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}