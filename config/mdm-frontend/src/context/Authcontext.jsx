import { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  // 1. Initialisation de l'utilisateur à partir du token existant
  const [user, setUser] = useState(null);

  // 2. Utiliser useEffect pour décoder le token au chargement initial
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username || decoded.sub, // 'sub' est souvent utilisé pour le username en JWT
          groups: decoded.groups || [],
        });
      } catch (error) {
        console.error("Token invalide", error);
        logout();
      }
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken); // Déclenchera le useEffect ci-dessus
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/";
  };

  return (
    // 3. IMPORTANT : Ajoutez 'user' dans les valeurs du Provider
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
