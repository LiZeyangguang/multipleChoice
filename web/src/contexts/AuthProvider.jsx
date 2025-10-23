/*
KEEP TRACK OF AUTHENTICATION IN SESSION
- ARSENY
*/


import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';

export const AuthContext = createContext();  // named export

export function AuthProvider({ children }) {  // named export
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   api.checkAuth()
  //     .then(userData => setUser(userData))
  //     .catch(() => setUser(null))
  //     .finally(() => setLoading(false));
  // }, []);


    useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await api.checkAuth(); // returns user or null
        if (mounted) setUser(u);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
