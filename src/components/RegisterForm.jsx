import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const validateFields = () => {
    if (!username) {
      setError("Пожалуйста, заполните поле никнейма.");
      return false;
    }
    if (!email) {
      setError("Пожалуйста, заполните поле почты.");
      return false;
    }
    if (!password) {
      setError("Пожалуйста, заполните поле пароля.");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Введите корректный Email.");
      return false;
    }
    if (username.length < 3) {
      setError("Никнейм должен быть минимум 3 символов.");
      return false;
    }
    if (password.length < 3) {
      setError("Пароль должен быть минимум 3 символов.");
      return false;
    }
    return true;
  };
  const submit = async () => {
    setError("");
    if (!validateFields()) return;
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) {
        let errorMessage = "Ошибка регистрации";
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
          Регистрация
        </h1>

        {error && (
          <div className="bg-red-200 text-red-800 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <input
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Никнейм"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition mb-4"
          onClick={submit}
        >
          Зарегистрироваться
        </button>

        <div className="flex justify-between text-sm text-gray-600">
          <button
            className="hover:underline"
            onClick={() => navigate("/login")}
          >
            Войти
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