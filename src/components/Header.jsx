import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Header({ email }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.info("Авторизуйтесь, чтобы получать больше рекомендаций!", {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b h-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center h-full">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold">
              GR
            </div>
            <span className="font-semibold text-lg">GameReco</span>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                {email && (
                  <span className="text-sm text-gray-500 hidden sm:block">
                    {email}
                  </span>
                )}

                <button
                  onClick={() => navigate("/profile")}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition"
                >
                  Профиль
                </button>

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

      <ToastContainer />
    </>
  );
}