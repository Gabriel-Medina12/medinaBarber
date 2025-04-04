import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Loader from "./components/Loader.jsx";
import Header from "./components/Header.jsx";
import Auth from "./pages/auth/login.jsx";
import Home from "./pages/home.jsx";
import ForgotPassword from "./pages/auth/forgotPassword.jsx";
import ResetPassword from "./pages/auth/resetPassword.jsx";
import Footer from "./components/Footer.jsx";
import Contacto from "./pages/contacto.jsx";
import Agendar from "./pages/AgendarCitas.jsx";
import Perfil from "./pages/perfil.jsx";
import EditPerfil from "./pages/editPerfil.jsx";
import "./app.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Estado que indica si el usuario está autenticado según la existencia de un token en localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("token") ? true : false;
  });

  useEffect(() => {
    const handleLoad = () => {
      console.log("La página se ha cargado completamente.");
      setIsLoading(false);
    };

    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  // Función para cerrar sesión: elimina el token y actualiza el estado
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          {/* Le pasamos isAuthenticated y handleLogout al Header */}
          <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/#servicios" element={<Home />} />
            <Route path="/#siguenos" element={<Home />} />
            {/* Ruta de autenticación para login/registro */}
            <Route
              path="/pages/auth/login"
              element={<Auth setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/pages/auth/forgotPassword"
              element={<ForgotPassword />}
            />
            <Route path='/pages/auth/reset-password/:token' element={<ResetPassword />} />
            <Route path="/pages/contacto" element={<Contacto />} />
            <Route path="/pages/agendar" element={<Agendar />} />
            {/* Ruta protegida: Si no está autenticado lo redirige a login */}
            <Route
              path="/pages/perfil"
              element={
                isAuthenticated ? <Perfil /> : <Navigate to="/pages/auth/login" />
              }
            />
            <Route
              path="/pages/edit-perfil"
              element={<EditPerfil />}
            />
          </Routes>
          <Footer />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;


