import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./service/api"; // Используем ваш настроенный axios

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateFields = () => {
    if (!username || username.length < 3) {
      setError("Никнейм должен содержать минимум 3 символа");
      return false;
    }
    if (!email) {
      setError("Пожалуйста, введите Email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Введите корректный адрес почты");
      return false;
    }
    if (!password || password.length < 3) {
      setError("Пароль слишком короткий (минимум 3 символа)");
      return false;
    }
    return true;
  };

  const submit = async () => {
    setError("");
    if (!validateFields()) return;

    setIsLoading(true);
    try {
      // Перешли на использование вашего api (axios)
      const response = await api.post("/auth/register", {
        email,
        password,
        username,
      });

      const data = response.data;
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.id) localStorage.setItem("userId", data.id);
        navigate("/");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || "Ошибка регистрации";
      setError(typeof message === 'string' ? message : "Этот Email или никнейм уже заняты");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden px-4">
      {/* Декоративные градиентные пятна (как на странице входа) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 blur-[120px] opacity-30 -ml-20 -mt-20 rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 blur-[120px] opacity-30 -mr-20 -mb-20 rounded-full"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/20 relative z-10">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Регистрация</h1>
          <p className="text-gray-500 mt-2 font-medium">Создайте аккаунт, чтобы начать</p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-shake">
             {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <input
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-green-100 outline-none transition font-medium text-gray-700"
              placeholder="Электронная почта"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <input
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-green-100 outline-none transition font-medium text-gray-700"
              placeholder="Ваш никнейм"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <input
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-green-100 outline-none transition font-medium text-gray-700"
              type="password"
              placeholder="Придумайте пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>

          <button
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 ${
              isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 shadow-green-200'
            }`}
            onClick={submit}
            disabled={isLoading}
          >
            {isLoading ? "СОЗДАЕМ..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
          </button>
        </div>

        {/* Ссылки */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm font-bold">
            <button
              className="text-green-600 hover:text-green-800 transition-colors uppercase tracking-wider text-[11px]"
              onClick={() => navigate("/login")}
            >
              Уже есть аккаунт? Войти
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider text-[11px]"
              onClick={() => navigate("/")}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}