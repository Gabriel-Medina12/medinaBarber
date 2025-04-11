import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "api";
import AdminSidebar from "../../components/AdminSidebar";
import { Users, Calendar, MessageSquare, TrendingUp } from "lucide-react";
import api from "../../api";

const AdminDashboard = () => {
  document.title = 'Dashboard Admin | Medina Barber';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    appointmentCount: 0,
    contactCount: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }
    
    const fetchData = async () => {
      try {
        // Obtener estadísticas
        const statsResponse = await api.get('/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
          // console.log("Estadísticas cargadas:", statsResponse.data.stats);
        }
        
        // Obtener citas recientes
        const appointmentsResponse = await api.get('/admin/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (appointmentsResponse.data.success) {
          // Tomar solo las 5 citas más recientes
          setRecentAppointments(appointmentsResponse.data.appointments.slice(0, 5));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        console.error('Detalles del error:', error.response?.data);
        
        // Si es un error de autorización, redirigir al login
        if (error.response && error.response.status === 403) {
          alert("No tienes permisos de administrador para acceder a esta página");
          navigate("/pages/perfil");
        } else if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/pages/auth/login");
        }
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Bienvenido al panel de administración de Medina Barber</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>Usuarios</h3>
              <p className="stat-value">{stats.userCount}</p>
              <p className="stat-label">Usuarios registrados</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon appointments">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>Citas</h3>
              <p className="stat-value">{stats.appointmentCount}</p>
              <p className="stat-label">Citas esta semana</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon messages">
              <MessageSquare size={24} />
            </div>
            <div className="stat-info">
              <h3>Mensajes</h3>
              <p className="stat-value">{stats.contactCount}</p>
              <p className="stat-label">Mensajes de contacto</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon growth">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>Crecimiento</h3>
              <p className="stat-value">+{Math.floor(Math.random() * 20) + 5}%</p>
              <p className="stat-label">Este mes</p>
            </div>
          </div>
        </div>
        
        <div className="recent-section">
          <h2>Citas recientes</h2>
          
          {recentAppointments.length > 0 ? (
            <div className="recent-appointments">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.clientName}</td>
                      <td>{appointment.service}</td>
                      <td>{new Date(appointment.date.slice(5,8)+appointment.date.slice(8, 10)+"-"+appointment.date.slice(0, 4)).toLocaleDateString()}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <span className={`status-badge ${appointment.confirmed ? 'confirmed' : 'pending'}`}>
                          {appointment.confirmed ? 'Confirmada' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No hay citas recientes</p>
          )}
          
          <button 
            className="view-all-button"
            onClick={() => navigate('/admin/appointments')}
          >
            Ver todas las citas
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
