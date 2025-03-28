import React from "react";
import { Link } from "react-router-dom";

const Header = ({ isAuthenticated, handleLogout }) => {
  return (
    <div className="header">
      <div className="textHeader">
        <p>
          Síguenos en:{" "}
          <ion-icon name="logo-instagram" className="iconInstagram"></ion-icon>{" "}
          <a href="https://www.instagram.com/medinabarber9/">
            @medinabarber9
          </a>
        </p>
      </div>
      <div className="linkInicio">
        {isAuthenticated ? (
          <>
            <button onClick={handleLogout} className="logoutBtn">
              Cerrar Sesión
            </button>
            {/* Enlace al perfil */}
            <Link to="/pages/perfil">
              <ion-icon name="person" className="person"></ion-icon>
            </Link>
            {/* Botón para cerrar sesión */}
          </>
        ) : (
          // Si no está autenticado, se muestra el enlace de login (y registro según convenga)
          <Link to="/pages/auth/login">
            <ion-icon name="person" className="person"></ion-icon>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;