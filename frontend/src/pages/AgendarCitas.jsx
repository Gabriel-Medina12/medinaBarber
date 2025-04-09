import React, { useState, useEffect } from "react";
import axios from "axios";
import CalendarioCitas from "../components/CalendarioCitas";
import { useNavigate } from "react-router-dom";

function Agendar() {
  document.title = 'Agendar Cita | Medina Barber';
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      // Si no hay token, redirigir al login
      navigate('/pages/auth/login', { 
        state: { 
          message: 'Debes iniciar sesión para agendar una cita',
          redirectTo: '/pages/agendar'
        } 
      });
      return;
    }

    // Cargar configuración de servicios y horarios
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/agendar/settings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setServices(response.data.settings.services);
          setTimeSlots(response.data.settings.timeSlots);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        // Si hay un error de autenticación (401), redirigir al login
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/pages/auth/login', { 
            state: { 
              message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
              redirectTo: '/pages/agendar'
            } 
          });
          return;
        }
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [navigate]);

  return (
    <div className="app">
      <div className="navbarCorto-subpages">
        <div className="logo-MB logo">
          <a href="/"><img src="../src/assets/img/LogoMedinaBarber.PNG" alt=""/></a>
        </div>
        <div className="navBar-Corto">
          <a href="/" className="enlace-Home nav-corto">Inicio</a> <p className="enlace-Contacto">|</p> <a href="/pages/agendar" className="enlace-Contacto nav-corto">Agendar</a>
        </div>
      </div>
      <div>
        <div className="titulos">
          <h2>Agendar</h2>
          <hr />
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando calendario...</p>
          </div>
        ) : (
          <CalendarioCitas 
            services={services} 
            timeSlots={timeSlots}
            setMessage={setMessage}
          />
        )}
        
        {message.text && (
          <div className={`message-overlay ${message.type}`}>
            <div className="message-content">
              <p>{message.text}</p>
              <button onClick={() => setMessage({ text: '', type: '' })}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Agendar;
