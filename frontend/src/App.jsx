import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Loader from "./components/Loader.jsx";
import Header from "./components/Header.jsx";
import Auth from "./pages/auth/login.jsx";
import Home from "./pages/home.jsx";
import ForgotPassword from "./pages/auth/forgotPassword.jsx";
import ResetPassword from "./pages/auth/resetPassword.jsx";
import Footer from "./components/footer.jsx";
import Contacto from "./pages/contacto.jsx";
import Agendar from "./pages/AgendarCitas.jsx";
import Perfil from "./pages/perfil.jsx";
import EditPerfil from "./pages/editPerfil.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";

// Importar componentes de administración
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminAppointments from "./pages/admin/Appointments.jsx";
import AdminHaircuts from "./pages/admin/cortes.jsx";
// import AdminSettings from "./pages/admin/settings.jsx";

import "./App.css"

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Estado que indica si el usuario está autenticado según la existencia de un token en localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("token") ? true : false;
  });
  
  // Estado para verificar si el usuario es administrador
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("userRole") === "admin";
  });

  useEffect(() => {
    const handleLoad = () => {
      // console.log("La página se ha cargado completamente.");
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
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setIsAdmin(false);
  };
  
  // Componente para rutas protegidas de administrador
  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/pages/auth/login" />;
    }
    
    if (!isAdmin) {
      return <Navigate to="/pages/perfil" />;
    }
    
    return children;
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          {/* Le pasamos isAuthenticated, isAdmin y handleLogout al Header */}
          <Header isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/#servicios" element={<Home />} />
            <Route path="/#siguenos" element={<Home />} />
            
            {/* Rutas de autenticación */}
            <Route
              path="/pages/auth/login"
              element={<Auth setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />}
            />
            <Route
              path="/pages/auth/forgotPassword"
              element={<ForgotPassword />}
            />
            <Route path='/pages/auth/reset-password/:token' element={<ResetPassword />} />
            
            {/* Rutas públicas */}
            <Route path="/pages/contacto" element={<Contacto />} />
            <Route path="/pages/agendar" element={<Agendar />} />
            
            {/* Rutas protegidas para usuarios */}
            <Route
              path="/pages/perfil"
              element={
                isAuthenticated ? <Perfil /> : <Navigate to="/pages/auth/login" />
              }
            />
            <Route
              path="/pages/edit-perfil"
              element={
                isAuthenticated ? <EditPerfil /> : <Navigate to="/pages/auth/login" />
              }
            />
            
            {/* Rutas protegidas para administradores */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <AdminRoute>
                  <AdminAppointments />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/haircuts"
              element={
                <AdminRoute>
                  <AdminHaircuts />
                </AdminRoute>
              }
            />
            {/* <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            /> */}
            
            {/* Ruta para manejar páginas no encontradas */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ChatbotWidget/>
          <Footer />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;


