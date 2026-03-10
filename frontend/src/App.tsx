import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Thread from "./pages/Thread";
import useAuth from "./hooks/useAuth";
import './App.css'

function App() {
  const {
    currentUser,
    isLoginModalOpen,
    isRegisterModalOpen,
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    login,
    register,
    logout,
  } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              currentUser={currentUser}
              isLoginModalOpen={isLoginModalOpen}
              isRegisterModalOpen={isRegisterModalOpen}
              onOpenLogin={openLoginModal}
              onCloseLogin={closeLoginModal}
              onOpenRegister={openRegisterModal}
              onCloseRegister={closeRegisterModal}
              onLogin={login}
              onRegister={register}
              onLogout={logout}
            />
          }
        />
        <Route
          path="/posts/:id"
          element={
            <Thread
              currentUser={currentUser}
              isLoginModalOpen={isLoginModalOpen}
              isRegisterModalOpen={isRegisterModalOpen}
              onOpenLogin={openLoginModal}
              onCloseLogin={closeLoginModal}
              onOpenRegister={openRegisterModal}
              onCloseRegister={closeRegisterModal}
              onLogin={login}
              onRegister={register}
              onLogout={logout}
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
