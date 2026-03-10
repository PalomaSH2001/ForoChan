import { useState } from "react";
import authService from "../services/auth";

const LOGIN_STORAGE_KEY = "forochan-user";

export interface UseAuthResult {
  currentUser: string | null;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

function useAuth(): UseAuthResult {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem(LOGIN_STORAGE_KEY);
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const login = async (username: string, password: string) => {
    const authenticatedUsername = await authService.login(username, password);
    setCurrentUser(authenticatedUsername);
    localStorage.setItem(LOGIN_STORAGE_KEY, authenticatedUsername);
    setIsLoginModalOpen(false);
  };

  const register = async (username: string, email: string, password: string) => {
    const registeredUsername = await authService.register(username, email, password);
    setCurrentUser(registeredUsername);
    localStorage.setItem(LOGIN_STORAGE_KEY, registeredUsername);
    setIsRegisterModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOGIN_STORAGE_KEY);
  };

  return {
    currentUser,
    isLoginModalOpen,
    isRegisterModalOpen,
    openLoginModal: () => {
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
    },
    closeLoginModal: () => setIsLoginModalOpen(false),
    openRegisterModal: () => {
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(true);
    },
    closeRegisterModal: () => setIsRegisterModalOpen(false),
    login,
    register,
    logout,
  };
}

export default useAuth;
