import React, { useContext } from 'react';
import { AuthContent } from './AuthContent';
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';

const AuthSelection = () => {
  const { email } = useContext(AuthContent);
  const navigate = useNavigate();

  const onEmailAuth = (e) => {
    e.preventDefault();
    axios
      .post(
        "/api/otp/send/email",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        navigate('/emailAuth');
      })
      .catch((error) => {
        console.error("Ошибка при отправке email:", error);
      });
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="text-center fabuttons">
        <button 
          type="button" 
          className="btn btn-secondary w-100 mb-3"
          onClick={onEmailAuth}
        >
          Получить код на почту
        </button>

        <button 
          type="button" 
          className="btn btn-secondary w-100"
          onClick={() => navigate('/login')}
        >
          Вернуться назад
        </button>
      </div>
    </div>
  );
};

export default AuthSelection;
