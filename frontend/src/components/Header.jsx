import React from "react";
import { Link } from "react-router-dom";

const Header = ({ isAuthenticated, isAdmin, handleLogout }) => {
  return (
    <div className="header">
      <div className="textHeader">
        <p>
          Síguenos en:{" "}
          <ion-icon name="logo-instagram" className="iconInstagram"></ion-icon>{" "}
          <a target="_blank" href="https://www.instagram.com/medinabarber9/">
            @medinabarber9
          </a>
        </p>
      </div>
      <div className="linkInicio">
        {isAuthenticated ? (
          <>
            {/* Si es un usuario normal, mostrar botón de cerrar sesión */}
            {!isAdmin && (
              <button onClick={handleLogout} className="logoutBtn">
                Cerrar Sesión
              </button>
            )}
            
            {/* El icono de persona lleva a diferentes lugares según el rol */}
            <Link to={isAdmin ? "/admin/dashboard" : "/pages/perfil"}>
              <ion-icon name="person" className="person"></ion-icon>
            </Link>
          </>
        ) : (
          // Si no está autenticado, se muestra el enlace de login
          <Link to="/pages/auth/login">
            <ion-icon name="person" className="person"></ion-icon>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;