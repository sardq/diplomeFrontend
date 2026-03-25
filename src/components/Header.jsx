import { useNavigate } from "react-router-dom";

export default function Header({ email }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold">
            GR
          </div>
          <span className="font-semibold text-lg">
            GameReco
          </span>
        </div>

        <div className="hidden md:flex gap-6 text-gray-600">
          <button onClick={() => navigate("/")} className="hover:text-black">
            Главная
          </button>
          <button className="hover:text-black">
            Каталог
          </button>
          <button className="hover:text-black">
            Рекомендации
          </button>
        </div>

        <div className="flex items-center gap-4">
          {token ? (
            <>
              {email && <span className="text-sm text-gray-500 hidden sm:block">{email}</span>}
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Войти
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}