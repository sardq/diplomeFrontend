import './App.css';
import logo from '../logo.svg';
import React, { useState  } from 'react';

import AppContent from './AppContent';
import Header from './Header';
import { AuthContent } from './AuthContent';

function App() {
  const [email, setEmail] = useState(null);

  return (
    <div className="App flex flex-col h-screen">
      <AuthContent.Provider value={{ email, setEmail }}>
        <Header pageTitle="Электронный журнал" logoSrc={logo} />

        <main className="flex-1 overflow-y-auto mt-20"> 
          <AppContent />
        </main>
      </AuthContent.Provider>
    </div>
  );
}

export default App;
