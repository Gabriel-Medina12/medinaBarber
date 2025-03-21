import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loader from "./components/Loader.jsx";
import Header from "./components/Header.jsx";
import Login from "./pages/auth/Login.jsx";
import Home from "./pages/home.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Footer from "./components/Footer.jsx";
import Contacto from "./pages/contacto.jsx";
import Agendar from "./pages/AgendarCitas.jsx";
import Perfil from "./pages/perfil.jsx";
import EditPerfil from "./pages/editPerfil.jsx";
import "./app.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Función que se ejecuta cuando la página termina de cargar
  //   const simulatedDelay = setTimeout(() => {
  //     console.log("Simulación de carga completada");
  //     setIsLoading(false);
  //   }, 2000);

  //   // Limpieza del timeout
  //   return () => clearTimeout(simulatedDelay);
  // }, []);
    const handleLoad = () => {
      console.log("La página se ha cargado completamente.");
      setIsLoading(false);
    };

    // Si el documento ya está completamente cargado, actualizamos el estado inmediatamente
    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      // Agregamos el listener para detectar el evento "load"
      window.addEventListener("load", handleLoad);

      // Eliminamos el listener cuando el componente se desmonte
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/#servicios" element={<Home />} />
            <Route path="/#siguenos" element={<Home />} />
            <Route path="/pages/auth/login" element={<Login />} />
            <Route path="/pages/auth/forgotPassword" element={<ForgotPassword />} />
            <Route path="/pages/contacto" element={<Contacto />} />
            <Route path="/pages/agendar" element={<Agendar/>}/>
            <Route path="/pages/perfil" element={< Perfil />} />
            <Route path="/pages/edit-perfil" element={< EditPerfil />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;

