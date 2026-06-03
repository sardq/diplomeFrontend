import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Header({ email }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.info("Авторизуйтесь, чтобы система подобрала идеальные игры для вас!", {
        position: "bottom-center", 
        autoClose: 5000,
        theme: "dark", 
      });
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-20 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center h-full">
          
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
              G
            </div>
            <span className="font-black text-xl tracking-tighter text-gray-900 uppercase italic">
              Game<span className="text-purple-600">Rec</span>
            </span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 md:gap-6">
            {token ? (
              <>
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Аккаунт</span>
                  <span className="text-sm font-bold text-gray-700">{email}</span>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-purple-100 hover:text-purple-700 transition-all"
                >
                  ПРОФИЛЬ
                </button>

                <button
                  onClick={logout}
                  className="bg-red-50 text-red-500 px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  ВЫХОД
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-600 px-4 py-2 font-bold text-xs hover:text-purple-600 transition-colors uppercase tracking-widest"
                >
                  Войти
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-purple-600 transition-all shadow-xl shadow-gray-200 active:scale-95 uppercase tracking-widest"
                >
                  Регистрация
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ToastContainer 
        limit={1} 
        toastStyle={{ borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}
      />
      
      <div className="h-2"></div>
    </>
  );
}