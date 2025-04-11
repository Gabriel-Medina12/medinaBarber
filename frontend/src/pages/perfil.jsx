import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const Perfil = () => {
  document.title = 'Perfil | Medina Barber';
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar token antes de hacer la solicitud
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/pages/auth/login");
          return;
        }

        // Obtener datos en paralelo
        const [profileRes, cortesRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/users/my-cortes')
        ]);

        setUser(profileRes.data.user);
        setCortes(cortesRes.data.cortes || []);
        
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    const handleError = (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/pages/auth/login", {
          state: { message: "Tu sesión ha expirado. Por favor inicia sesión nuevamente." }
        });
      }
      setError(error.response?.data?.message || "Error al cargar los datos");
    };

    fetchData();
  }, [navigate]);

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
            src={
              user.avatar 
                ? user.avatar.startsWith('http') 
                  ? user.avatar 
                  : `http://localhost:3000${user.avatar}`
                : "/placeholder.svg?height=100&width=100"
            }
            alt="Avatar"
            className="avatar"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "/placeholder.svg?height=100&width=100";
            }}
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
        <h2>MIS CORTES</h2>
        <hr />
      </div>

      <div className="image-grid">
        {cortes.length > 0 ? (
          cortes.map((corte, index) => (
            <div key={corte.id} className="grid-item">
              <img 
                src={`http://localhost:3000${corte.imagenUrl}`} 
                alt={`Corte ${index + 1}`} 
              />
              {corte.descripcion && (
                <div className="corte-descripcion">
                  <p>{corte.descripcion}</p>
                  <small>{new Date(corte.fecha).toLocaleDateString()}</small>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-cortes-message">
            <p>Aún no tienes cortes registrados. Visítanos pronto para añadir tu primer corte.</p>
          </div>
        )}
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
