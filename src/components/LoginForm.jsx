import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [emailLogin, setEmailLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const validateFields = () => {
    if (!emailLogin) {
      setError("Пожалуйста, заполните поле почты.");
      return false;
    }
    if (!password) {
      setError("Пожалуйста, заполните поле пароля.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLogin)) {
      setError("Введите корректный emailLogin.");
      return false;
    }
    if (password.length < 3) {
      setError("Пароль должен быть минимум 3 символов.");
      return false;
    }
    return true;
  };
  const login = async () => {
    setError("");
    if (!validateFields()) return;
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email:emailLogin, password }),
      });

       if (!response.ok) {
        let errorMessage = "Ошибка авторизации";
        try {
          const errData = await response.json();
          if (errData?.message) errorMessage = errData.message;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Авторизация
        </h1>

        {error && (
          <div className="bg-red-200 text-red-800 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <input
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          value={emailLogin}
          onChange={(e) => setEmailLogin(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mb-4"
          onClick={login}
        >
          Войти
        </button>

        <div className="flex justify-between text-sm text-gray-600">
          <button
            className="hover:underline"
            onClick={() => navigate("/register")}
          >
            Регистрация
          </button>
          <button
            className="hover:underline"
            onClick={() => navigate("/")}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}