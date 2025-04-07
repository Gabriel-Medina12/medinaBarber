import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Perfil = () => {
  document.title = 'Perfil | Medina Barber';
  const navigate = useNavigate();
  
  // Estado para almacenar la información del usuario y manejo de carga/errores
  const [user, setUser] = useState(null);
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Obtener el token del localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }

    // Función para obtener los datos del perfil
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/pages/auth/login");
            throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
          }
          throw new Error("Error al obtener los datos del perfil");
        }

        const data = await res.json();
        setUser(data.user);
        
        // Una vez que tenemos el usuario, obtenemos sus cortes
        const cortesRes = await fetch("http://localhost:3000/api/users/my-cortes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const responseText = await cortesRes.text();
        console.log();

        if (!cortesRes.ok) {
          const errorData = await cortesRes.json();
          throw new Error(errorData.message || "Error al obtener los cortes");
        }


        let cortesData;
  try {
    cortesData = JSON.parse(responseText);
  } catch (e) {
    console.error("Error al parsear JSON:", e);
    throw new Error("La respuesta del servidor no es un JSON válido");
  }
        setCortes(cortesData.cortes || []);
        setLoading(false);
      } catch (err) {
        console.error('Error completo', err);
        setError(err.message || "Error al obtener el perfil o los cortes");
        setLoading(false);
      }
    };

    fetchUserProfile();
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
