import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { Save, Clock, Scissors, Plus, Trash2 } from "lucide-react";

const AdminSettings = () => {
  document.title = 'Configuración | Medina Barber';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [settings, setSettings] = useState({
    timeSlots: [],
    services: []
  });
  
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newService, setNewService] = useState({ name: '', duration: 30, price: 0 });
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }
    
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setSettings(response.data.settings);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        
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
    
    fetchSettings();
  }, [navigate]);
  
  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.post(
        '/api/admin/settings',
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setMessage({ 
          text: 'Configuración guardada correctamente', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMessage({ 
        text: 'Error al guardar la configuración', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddTimeSlot = () => {
    if (!newTimeSlot) return;
    
    // Validar formato de hora (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTimeSlot)) {
      setMessage({ 
        text: 'Formato de hora inválido. Use HH:MM (ejemplo: 14:30)', 
        type: 'error' 
      });
      return;
    }
    
    // Verificar si ya existe
    if (settings.timeSlots.includes(newTimeSlot)) {
      setMessage({ 
        text: 'Este horario ya existe', 
        type: 'error' 
      });
      return;
    }
    
    // Agregar y ordenar
    const newTimeSlots = [...settings.timeSlots, newTimeSlot].sort((a, b) => {
      const [aHour, aMinute] = a.split(':').map(Number);
      const [bHour, bMinute] = b.split(':').map(Number);
      
      if (aHour !== bHour) return aHour - bHour;
      return aMinute - bMinute;
    });
    
    setSettings({
      ...settings,
      timeSlots: newTimeSlots
    });
    
    setNewTimeSlot('');
    setMessage({ text: '', type: '' });
  };
  
  const handleRemoveTimeSlot = (timeSlot) => {
    setSettings({
      ...settings,
      timeSlots: settings.timeSlots.filter(slot => slot !== timeSlot)
    });
  };
  
  const handleAddService = () => {
    if (!newService.name) {
      setMessage({ 
        text: 'El nombre del servicio es obligatorio', 
        type: 'error' 
      });
      return;
    }
    
    if (newService.price <= 0) {
      setMessage({ 
        text: 'El precio debe ser mayor que cero', 
        type: 'error' 
      });
      return;
    }
    
    // Verificar si ya existe un servicio con el mismo nombre
    if (settings.services.some(service => service.name === newService.name)) {
      setMessage({ 
        text: 'Ya existe un servicio con este nombre', 
        type: 'error' 
      });
      return;
    }
    
    const newServiceWithId = {
      ...newService,
      id: Date.now().toString() // ID temporal
    };
    
    setSettings({
      ...settings,
      services: [...settings.services, newServiceWithId]
    });
    
    setNewService({ name: '', duration: 30, price: 0 });
    setMessage({ text: '', type: '' });
  };
  
  const handleRemoveService = (serviceId) => {
    setSettings({
      ...settings,
      services: settings.services.filter(service => service.id !== serviceId)
    });
  };
  
  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    
    setNewService({
      ...newService,
      [name]: name === 'name' ? value : Number(value)
    });
  };
  
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando configuración...</p>
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
          <h1>Configuración</h1>
          <button 
            className="save-settings-button"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            <Save size={18} />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="settings-container">
          <div className="settings-section">
            <div className="section-header">
              <h2>
                <Clock size={20} />
                <span>Horarios Disponibles</span>
              </h2>
            </div>
            
            <div className="time-slots-container">
              <div className="time-slots-grid">
                {settings.timeSlots.map(timeSlot => (
                  <div key={timeSlot} className="time-slot-item">
                    <span>{timeSlot}</span>
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveTimeSlot(timeSlot)}
                      title="Eliminar horario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-time-slot">
                <input 
                  type="text" 
                  placeholder="HH:MM (ej: 14:30)" 
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                />
                <button 
                  className="add-button"
                  onClick={handleAddTimeSlot}
                >
                  <Plus size={16} />
                  <span>Agregar Horario</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <div className="section-header">
              <h2>
                <Scissors size={20} />
                <span>Servicios</span>
              </h2>
            </div>
            
            <div className="services-container">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Nombre del Servicio</th>
                    <th>Duración (min)</th>
                    <th>Precio ($)</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.services.map(service => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.duration} min</td>
                      <td>${service.price.toFixed(2)}</td>
                      <td>
                        <button 
                          className="remove-button"
                          onClick={() => handleRemoveService(service.id)}
                          title="Eliminar servicio"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="add-service">
                <h3>Agregar Nuevo Servicio</h3>
                <div className="service-form">
                  <div className="form-group">
                    <label>Nombre:</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Nombre del servicio" 
                      value={newService.name}
                      onChange={handleServiceChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Duración (min):</label>
                    <input 
                      type="number" 
                      name="duration"
                      min="5"
                      step="5"
                      value={newService.duration}
                      onChange={handleServiceChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Precio ($):</label>
                    <input 
                      type="number" 
                      name="price"
                      min="0"
                      step="0.01"
                      value={newService.price}
                      onChange={handleServiceChange}
                    />
                  </div>
                  
                  <button 
                    className="add-button"
                    onClick={handleAddService}
                  >
                    <Plus size={16} />
                    <span>Agregar Servicio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
