import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); 
  const navigate = useNavigate();

  // Define logout as a function declaration for hoisting
  const logout = useCallback(() => { // Memoize logout
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login"); 
  }, [navigate]); // navigate is stable, but good practice to list

  const decodeJwt = useCallback((token) => { // Memoize decodeJwt
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding JWT:", e);
      return null;
    }
  }, []); // No dependencies, so it's stable

  const refreshToken = useCallback(async () => { // Memoize refreshToken
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      return false;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshTokenValue }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return true;
      } else {
        console.error("Failed to refresh token:", await response.json());
        logout(); 
        return false;
      }
    } catch (error) {
      console.error("Network error during token refresh:", error);
      logout(); 
      return false;
    }
  }, [logout]); // logout is a dependency

  const fetchUserDetails = useCallback(async (accessToken) => { // Memoize fetchUserDetails
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newAccessToken = localStorage.getItem('access_token');
          await fetchUserDetails(newAccessToken); 
        } else {
          logout(); 
        }
      } else {
        console.error("Failed to fetch user details:", await response.json());
        logout(); 
      }
    } catch (error) {
      console.error("Network error fetching user details:", error);
      logout(); 
    }
  }, [logout, refreshToken]); // logout and refreshToken are dependencies

  const refetchCart = useCallback(async () => {
    console.log("Triggering cart re-fetch...");
  }, []);

  // Initial check on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        const decodedToken = decodeJwt(accessToken);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
          await fetchUserDetails(accessToken);
        } else {
          const refreshed = await refreshToken();
          if (refreshed) {
            const newAccessToken = localStorage.getItem("access_token");
            await fetchUserDetails(newAccessToken); 
          } else {
            logout(); 
          }
        }
      }
      setLoadingAuth(false);
    };
    checkAuthStatus();
  }, [decodeJwt, fetchUserDetails, refreshToken, logout]); // All functions are now stable dependencies

  const login = useCallback(async (accessToken, refreshTokenValue) => { // Memoize login
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshTokenValue);
    await fetchUserDetails(accessToken);
  }, [fetchUserDetails]);

  const updateUserInfo = useCallback((newUserInfo) => { // Memoize updateUserInfo
    setUser(prevUser => ({ ...prevUser, ...newUserInfo }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loadingAuth,
        login,
        logout,
        updateUserInfo,
        refetchCart, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
