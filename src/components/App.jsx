import './App.css';
import logo from '../logo.svg';
import React, { useState  } from 'react';

import AppContent from './AppContent';
import Header from './Header';
import { AuthContent } from './AuthContent';

function App() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [is2FAVerified, setIs2FAVerified] = useState(null);
  return (
    <div className="App">
      <div className="app-wrapper">
        <AuthContent.Provider value={{ role, setRole, email, setEmail, is2FAVerified, setIs2FAVerified }}>
            <Header pageTitle="Электронный журнал" logoSrc={logo} />
            <AppContent />
        </AuthContent.Provider>
      </div>
    </div>
  );
}

export default App;
