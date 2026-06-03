import React from 'react';

export const AuthContent = React.createContext({
  role: null,
  setRole: () => {},
  email: null,
  setEmail: () => {},
  is2FAVerified: false,
  setIs2FAVerified: () =>{}
});