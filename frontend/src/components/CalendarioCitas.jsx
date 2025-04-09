"use client"

import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import AppointmentModal from "./AppointmentModal"
import axios from "axios"

function CalendarioCitas() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    clientName: "",
    service: "",
    time: "",
    notes: "",
    email: "", // Añadimos campo para email
  })
  const [userAppointments, setUserAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [userData, setUserData] = useState(null)

  // Servicios disponibles
  const [services, setServices] = useState([])
  

  // Horarios disponibles
  const [timeSlots, setTimeSlots] = useState([
    "10:00", "10:30", "11:00", "11:30","12:00", "12:30", "13:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
  ])

  // Cargar citas del usuario si está logueado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserAppointments(token);
      fetchUserData(token);
    }
    
    // Intentar cargar configuración (servicios y horarios disponibles)
    fetchSettings();
  }, []);
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('/api/users/profile', {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.user) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  const fetchUserAppointments = async (token) => {
    setLoading(true);
    try {
      // console.log('Obteniendo citas con token:', token ? 'Token presente' : 'No hay token');
      
      if (!token) {
        // console.log('No hay token, no se cargarán citas');
        setUserAppointments([]);
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/api/agendar/user', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // console.log('Respuesta de citas:', response.data);
      
      if (response.data.success) {
        setUserAppointments(response.data.appointments || []);
      } else {
        setUserAppointments([]);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      console.error('Detalles del error:', error.response?.data || 'No hay detalles adicionales');
      setUserAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/agendar/settings');
      
      if (response.data.success) {
        if (response.data.settings.services) {
          setServices(response.data.settings.services);
        }
        
        if (response.data.settings.timeSlots) {
          setTimeSlots(response.data.settings.timeSlots);
        }
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  // Obtener el nombre del mes y año actual
  const getMonthYearString = (date) => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Generar días del mes actual con sus posiciones correctas en la semana
  const generateDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Crear un array para almacenar los días del mes
    const days = []

    // Para cada día del mes
    for (let day = 1; day <= daysInMonth; day++) {
      // Crear un objeto de fecha para este día
      const date = new Date(year, month, day)

      // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
      let dayOfWeek = date.getDay()

      // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

      days.push({
        day,
        dayOfWeek,
        date,
      })
    }

    return days
  }

  // Generar una matriz de semanas para el calendario
  const generateCalendarGrid = () => {
    const days = generateDays();
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
  
    // Crear una matriz de 6 semanas x 7 días, inicialmente vacía
    const grid = Array(6)
      .fill()
      .map(() => Array(7).fill(null));
  
    // Colocar cada día en su posición correcta en la matriz
    days.forEach((dayInfo) => {
      const weekIndex = Math.floor((firstDay.dayOfWeek + dayInfo.day - 1) / 7);
      grid[weekIndex][dayInfo.dayOfWeek] = dayInfo;
    });
  
    return grid;
  };

  // Navegar al mes anterior
  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
    setSelectedDay(1) // Seleccionar el primer día del nuevo mes
  }

  // Navegar al mes siguiente
  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
    setSelectedDay(1) // Seleccionar el primer día del nuevo mes
  }

  // Seleccionar un día
  const handleDayClick = (day) => {
    if (day) {
      // Crear una fecha con el día seleccionado
      const selectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day.day
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setMessage({
          text: 'No puedes seleccionar días pasados. Por favor, elige una fecha futura.',
          type: 'error'
        });
        return;
      }
      
      // Si la fecha es válida, actualizar el día seleccionado
      setSelectedDay(day.day);
    }
  };

  // Abrir el formulario de nueva cita
  const handleNewAppointment = () => {
    if (userData){
      setAppointmentData({
        ...AppointmentModal,
        clientName: userData.fullName,
        email: userData.email,
      })
    }

    setShowAppointmentForm(true)
  }

  // Cerrar el formulario
  const handleCloseForm = () => {
    setShowAppointmentForm(false)
    // Limpiar el formulario
    setAppointmentData({
      clientName: "",
      service: "",
      time: "",
      notes: "",
      email: "",
    })
    // Limpiar mensaje
    setMessage({ text: '', type: '' });
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAppointmentData({
      ...appointmentData,
      [name]: value,
    })
  }

  // Enviar el formulario
  const handleSubmit = async (e, finalData) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      
      // console.log('Datos a enviar al servidor:', finalData); // Para depuración
      
      // Verificar que todos los campos obligatorios estén presentes
      if (!finalData.clientName || !finalData.service || !finalData.date || 
          !finalData.time || !finalData.email) {
        setMessage({
          text: 'Por favor completa todos los campos obligatorios',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Preparar datos para enviar al backend
      let formData;
      const headers = {};
      
      // Añadir token si el usuario está logueado
      const token = localStorage.getItem("token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Si es pago con tarjeta y hay comprobante, usar FormData
      if (finalData.paymentMethod === 'tarjeta' && finalData.paymentProof) {
        formData = new FormData();
        formData.append('clientName', finalData.clientName);
        formData.append('service', finalData.service);
        formData.append('date', finalData.date);
        formData.append('time', finalData.time);
        formData.append('notes', finalData.notes || '');
        formData.append('email', finalData.email);
        formData.append('paymentMethod', finalData.paymentMethod);
        
        if (finalData.referenceNumber) {
          formData.append('referenceNumber', finalData.referenceNumber);
        }
        
        if (finalData.paymentProof) {
          formData.append('paymentProof', finalData.paymentProof);
        }
      } else {
        // Para pago en efectivo, enviar como JSON
        formData = {
          clientName: finalData.clientName,
          service: finalData.service,
          date: finalData.date,
          time: finalData.time,
          notes: finalData.notes || '',
          email: finalData.email,
          paymentMethod: finalData.paymentMethod || 'efectivo'
        };
        
        headers['Content-Type'] = 'application/json';
      }
      
      // Enviar al backend
      const response = await axios.post(
        '/api/agendar', 
        formData instanceof FormData ? formData : formData,
        { headers }
      );
      
      if (response.data.success) {
        // Mostrar mensaje de éxito
        setMessage({
          text: 'Cita agendada correctamente. Recibirás un correo de confirmación.',
          type: 'success'
        });
        
        // Si el usuario está logueado, actualizar sus citas
        if (token) {
          fetchUserAppointments(token);
        }
        
        // Cerrar el formulario después de un tiempo
        setTimeout(() => {
          handleCloseForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Error al agendar cita:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      setMessage({
        text: error.response?.data?.message || 'Error al agendar la cita. Inténtalo de nuevo.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }
  

  // Generar mini calendario para la barra lateral
  const generateMiniCalendar = () => {
    const calendarGrid = generateCalendarGrid();
  
    return calendarGrid.map((week, weekIndex) => (
      <React.Fragment key={`week-${weekIndex}`}>
        {week.map((day, dayIndex) => {
          // Verificar si el día es pasado
          let isPastDay = false;
          if (day) {
            const dayDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day.day
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            isPastDay = dayDate < today;
          }
          
          return (
            <div
              key={`day-${weekIndex}-${dayIndex}`}
              className={`mini-day ${day && day.day === selectedDay ? "selected" : ""} 
                         ${!day ? "empty-day" : ""} 
                         ${isPastDay ? "past-day" : ""}`}
              onClick={() => day && !isPastDay && handleDayClick(day)}
            >
              {day ? day.day : ""}
            </div>
          );
        })}
      </React.Fragment>
    ));
  };

    {generateCalendarGrid().map((week, weekIndex) => (
      <React.Fragment key={`week-grid-${weekIndex}`}>
        {week.map((day, dayIndex) => {
          // Verificar si el día es pasado
          let isPastDay = false;
          if (day) {
            const dayDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day.day
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            isPastDay = dayDate < today;
          }
          
          return (
            <div
              key={`grid-day-${weekIndex}-${dayIndex}`}
              className={`day-cell ${!day ? "empty-cell" : ""} 
                         ${day && day.day === selectedDay ? "selected" : ""} 
                         ${isPastDay ? "past-day" : ""}`}
              onClick={() => day && !isPastDay && handleDayClick(day)}
            >
              {day && (
                <>
                  <div className="day-number">{day.day}</div>
                  <div className="day-appointments">
                    {userAppointments
                      .filter(appointment => {
                        const appointmentDate = new Date(appointment.date);
                        return (
                          appointmentDate.getDate() === day.day &&
                          appointmentDate.getMonth() === currentDate.getMonth() &&
                          appointmentDate.getFullYear() === currentDate.getFullYear()
                        );
                      })
                      .map(appointment => (
                        <div 
                          key={appointment.id} 
                          className={`appointment-marker ${appointment.confirmed ? 'confirmed' : 'pending'}`}
                          title={`${appointment.service} - ${appointment.time}`}
                        >
                          {appointment.time}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </React.Fragment>
    ))}

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  return (
    <div className="calendario-container">
      {message.text && (
        <div className={`message-overlay ${message.type}`}>
          <div className="message-content">
            <p>{message.text}</p>
            <button onClick={() => setMessage({ text: '', type: '' })}>Cerrar</button>
          </div>
        </div>
      )}
      
      <div className="calendario-sidebar">
        <div className="sidebar-header">
          <h2>Agenda</h2>
        </div>

        <div className="sidebar-days">
          <div className="day-header">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
          <div className="mini-calendar">{generateMiniCalendar()}</div>
        </div>

        <div className="sidebar-appointments">
          <h3>Mis citas</h3>
          {loading ? (
            <p className="loading-text">Cargando citas...</p>
          ) : userAppointments.length > 0 ? (
            <div className="user-appointments-list">
              {userAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-date">
                    {formatDate(appointment.date)} - {appointment.time}
                  </div>
                  <div className="appointment-service">
                    {appointment.service}
                  </div>
                  <div className={`appointment-status ${appointment.confirmed ? 'confirmed' : 'pending'}`}>
                    {appointment.confirmed ? 'Confirmada' : 'Pendiente'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-appointments">No tienes citas agendadas</p>
          )}
        </div>
      </div>

      <div className="calendario-main">
        <div className="calendario-header">
          <div className="month-navigation">
            <button className="nav-button" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <h2>{getMonthYearString(currentDate)}</h2>
            <button className="nav-button" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendario-actions">
            <button className="nueva-cita-btn" onClick={handleNewAppointment}>
              <span>Nueva cita</span>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="calendario-grid">
          <div className="calendario-days-header">
            <div className="day-name">Lunes</div>
            <div className="day-name">Martes</div>
            <div className="day-name">Miércoles</div>
            <div className="day-name">Jueves</div>
            <div className="day-name">Viernes</div>
            <div className="day-name">Sábado</div>
            <div className="day-name">Domingo</div>
          </div>

          <div className="calendario-days-grid">
            {generateCalendarGrid().map((week, weekIndex) => (
              <React.Fragment key={`week-grid-${weekIndex}`}>
                {week.map((day, dayIndex) => (
                  <div
                    key={`grid-day-${weekIndex}-${dayIndex}`}
                    className={`day-cell ${!day ? "empty-cell" : ""} ${day && day.day === selectedDay ? "selected" : ""}`}
                    onClick={() => day && handleDayClick(day)}
                  >
                    {day && (
                      <>
                        <div className="day-number">{day.day}</div>
                        <div className="day-appointments">
                          {userAppointments
                            .filter(appointment => {
                              const appointmentDate = new Date(appointment.date);
                              return (
                                appointmentDate.getDate() === day.day &&
                                appointmentDate.getMonth() === currentDate.getMonth() &&
                                appointmentDate.getFullYear() === currentDate.getFullYear()
                              );
                            })
                            .map(appointment => (
                              <div 
                                key={appointment.id} 
                                className={`appointment-marker ${appointment.confirmed ? 'confirmed' : 'pending'}`}
                                title={`${appointment.service} - ${appointment.time}`}
                              >
                                {appointment.time}
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {showAppointmentForm && (
        <AppointmentModal
          selectedDay={selectedDay}
          currentDate={currentDate}
          services={services}
          timeSlots={timeSlots}
          appointmentData={appointmentData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleCloseForm={handleCloseForm}
        />
      )}
    </div>
  )
}

export default CalendarioCitas

