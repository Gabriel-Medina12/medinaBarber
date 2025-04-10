import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { Search, Calendar, Check, X, DollarSign, Filter, Trash2 } from "lucide-react";

const AdminAppointments = () => {
  document.title = 'Gestión de Citas | Medina Barber';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, paid
  const [cancelingAppointment, setCancelingAppointment] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }
    
    const fetchAppointments = async () => {
      try {
        // console.log('Solicitando citas al servidor...');
        
        const response = await axios.get('/api/admin/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          // console.log('Citas recibidas:', response.data.appointments.length);
          setAppointments(response.data.appointments);
        } else {
          console.error('Error en la respuesta:', response.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar citas:', error);
        console.error('Detalles del error:', error.response?.data);
        
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
    
    fetchAppointments();
  }, [navigate]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  
  const filteredAppointments = appointments.filter(appointment => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por estado
    let matchesFilter = true;
    if (filter === "pending") {
      matchesFilter = !appointment.confirmed;
    } else if (filter === "confirmed") {
      matchesFilter = appointment.confirmed && !appointment.paid;
    } else if (filter === "paid") {
      matchesFilter = appointment.confirmed && appointment.paid;
    }
    
    return matchesSearch && matchesFilter;
  });
  
  const handleConfirmAppointment = async (appointmentId, isConfirmed) => {
    const token = localStorage.getItem("token");
    
    try {
      // Cambiamos la ruta para que coincida con el backend
      const response = await axios.put(
        `/api/agendar/confirm/${appointmentId}`, 
        { confirmed: isConfirmed }, // Asegúrate de que el nombre del campo sea correcto
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Actualizar la lista de citas
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, confirmed: isConfirmed } 
            : appointment
        ));
        
        alert(isConfirmed ? "Cita confirmada correctamente" : "Cita marcada como pendiente");
      }
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      // Mostrar más detalles del error
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
      }
      alert("Error al actualizar cita. Consulta la consola para más detalles.");
    }
  };
  
  const handleMarkAsPaid = async (appointmentId, isPaid) => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.put(
        `/api/admin/appointments/${appointmentId}/confirm`, 
        { pagado: isPaid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Actualizar la lista de citas
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, paid: isPaid } 
            : appointment
        ));
        
        alert(isPaid ? "Pago registrado correctamente" : "Pago marcado como pendiente");
      }
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      alert("Error al actualizar pago");
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const refreshAppointments = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get('/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAppointments(response.data.appointments);
        alert("Lista de citas actualizada");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al actualizar citas:', error);
      setLoading(false);
    }
  };
  
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita? Se notificará al cliente por correo electrónico.")) {
      return;
    }
    
    setCancelingAppointment(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.delete(
        `/api/agendar/admin/cancel/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Eliminar la cita de la lista
        setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
        alert("Cita cancelada correctamente. Se ha enviado un correo al cliente.");
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      alert("Error al cancelar la cita. Consulta la consola para más detalles.");
    } finally {
      setCancelingAppointment(false);
    }
  };
  
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando citas...</p>
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
          <h1>Gestión de Citas</h1>
          <div className="admin-actions">
          <button 
            className="refresh-button"
            onClick={refreshAppointments}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar citas"}
          </button>
            
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar citas..." 
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        <div className="appointments-container">
          {filteredAppointments.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Notas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(appointment => (
                  <tr key={appointment.id} className={
                    appointment.confirmed && appointment.paid 
                      ? 'row-paid' 
                      : appointment.confirmed 
                        ? 'row-confirmed' 
                        : 'row-pending'
                  }>
                    <td>{appointment.clientName}</td>
                    <td>{appointment.service}</td>
                    <td>{formatDate(appointment.date.slice(5,8)+appointment.date.slice(8, 10)+"-"+appointment.date.slice(0, 4))}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <div className="notes-cell">
                        {appointment.notes || <span className="no-notes">Sin notas</span>}
                      </div>
                    </td>
                    <td>
                      <div className="status-badges">
                        <span className={`status-badge ${appointment.confirmed ? 'confirmed' : 'pending'}`}>
                          {appointment.confirmed ? 'Confirmada' : 'Pendiente'}
                        </span>
                        {appointment.confirmed && (
                          <span className={`status-badge ${appointment.paid ? 'paid' : 'unpaid'}`}>
                            {appointment.paid ? 'Pagada' : 'No pagada'}
                          </span>
                        )}
                        {appointment.paymentMethod && appointment.paymentMethod !== 'efectivo' && (
                          <span className="status-badge payment-method">
                            {appointment.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Pago Móvil'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className={`action-button ${appointment.confirmed ? 'cancel' : 'confirm'}`}
                          onClick={() => handleConfirmAppointment(appointment.id, !appointment.confirmed)}
                          title={appointment.confirmed ? "Marcar como pendiente" : "Confirmar cita"}
                        >
                          {appointment.confirmed ? <X size={16} /> : <Check size={16} />}
                        </button>
                        
                        {appointment.confirmed && (
                          <button 
                            className={`action-button ${appointment.paid ? 'unpaid' : 'paid'}`}
                            onClick={() => handleMarkAsPaid(appointment.id, !appointment.paid)}
                            title={appointment.paid ? "Marcar como no pagada" : "Registrar pago"}
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                        
                        <button 
                          className="action-button delete"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          title="Cancelar cita"
                          disabled={cancelingAppointment}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <Calendar size={48} />
              <p>No se encontraron citas que coincidan con los criterios de búsqueda</p>
              {filter !== "all" && (
                <button 
                  className="show-all-button"
                  onClick={() => setFilter("all")}
                >
                  Mostrar todas las citas
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;
