import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Perfil = () => {
  document.title = 'Perfil | Medina Barber';
  const navigate = useNavigate();
  
  // Estado para almacenar la información del usuario y manejo de carga/errores
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Obtener el token del localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }

    // Obtener los datos del perfil del usuario
    fetch("http://localhost:3000/api/users/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Si el token es inválido, redirigir al login
            localStorage.removeItem("token");
            navigate("/pages/auth/login");
            throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
          }
          throw new Error("Error al obtener los datos del perfil");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al obtener el perfil");
        setLoading(false);
      });
  }, [navigate]);

  // Placeholder images para la grilla
  const placeholderImages = Array(9).fill("/placeholder.svg?height=150&width=150");

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando perfil...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => navigate("/pages/auth/login")}>Volver al inicio de sesión</button>
    </div>
  );
  
  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="user-info">
          <div className="avatar-container">
          <img
            src={user.avatar ? `http://localhost:3000${user.avatar}` : "/placeholder.svg?height=100&width=100"}
            alt="Avatar"
            className="avatar"
          />
          </div>
          <div className="user-details">
            <h3>{user.fullName}</h3>
            <p className="username">@{user.userName}</p>
            <p className="edit-profile-text">
              <Link to="/pages/edit-perfil">Editar perfil</Link>
            </p>
          </div>
        </div>
        <div className="navBar-Corto">
          <Link to="/" className="enlace-Home nav-corto">Inicio</Link> 
          <p className="enlace-Contacto">|</p> 
          <Link to="/pages/perfil" className="enlace-Contacto nav-corto">Perfil</Link>
        </div>
      </div>

      <div className="titulos">
        <h2>PERFIL</h2>
        <hr />
      </div>

      <div className="image-grid">
        {placeholderImages.map((img, index) => (
          <div key={index} className="grid-item">
            <img src={img} alt={`Publicación ${index + 1}`} />
          </div>
        ))}
      </div>

      <div className="instagram-button">
        <a href="https://instagram.com/medinabarber9" target="_blank" rel="noopener noreferrer">
          <ion-icon name="logo-instagram" className="siguenos-ig"></ion-icon> Síguenos en Instagram
        </a>
      </div>
    </div>
  );
};

export default Perfil;