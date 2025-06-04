"use client"

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock } from "lucide-react";
import AppointmentModal from "./AppointmentModal";
import ChatbotWidget from "./ChatbotWidget";
import api from "../api";
import img1 from '../assets/img/Logo Medina Barber.png';
import "../pages/AgendarCitas.css";

function CalendarioCitas() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    clientName: "",
    service: "",
    time: "",
    notes: "",
    email: "",
  });
  const [userData, setUserData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const services = [
    { id: 1, name: "Corte de cabello", price: 5 },
    { id: 2, name: "Arreglo de barba", price: 3 },
    { id: 3, name: "Corte y barba", price: 7 }
  ];
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserData(response.data.user);
          setAppointmentData(prev => ({
            ...prev,
            clientName: response.data.user.fullName || '',
            email: response.data.user.email || ''
          }));
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const fetchWeekAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/appointments/week', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data.appointments || []);
      }
    } catch (error) {
      console.error("Error al obtener citas:", error);
    }
  };

  useEffect(() => {
    fetchWeekAppointments();
  }, [currentDate]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const days = [];
  
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="day empty"></div>);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear();
    
    const isSelected = i === selectedDay;
    
    const isPastDay =
      currentDate.getFullYear() < new Date().getFullYear() ||
      (currentDate.getFullYear() === new Date().getFullYear() &&
        currentDate.getMonth() < new Date().getMonth()) ||
      (currentDate.getFullYear() === new Date().getFullYear() &&
        currentDate.getMonth() === new Date().getMonth() &&
        i < new Date().getDate());

    const hasAppointment = appointments.some(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === i &&
             aptDate.getMonth() === currentDate.getMonth() &&
             aptDate.getFullYear() === currentDate.getFullYear();
    });

    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

    days.push(
      <div
        key={i}
        className={`day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${isPastDay ? "past-day" : ""} ${hasAppointment ? "has-appointment" : ""} ${isWeekend ? "weekend" : ""}`}
        onClick={() => {
          if (!isPastDay) {
            setSelectedDay(i);
          }
        }}
        style={{ '--delay': i }}
        tabIndex={isPastDay ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isPastDay) {
            e.preventDefault();
            setSelectedDay(i);
          }
        }}
      >
        {i}
        {hasAppointment && <div className="appointment-indicator"></div>}
      </div>
    );
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenAppointmentForm = useCallback((
    day = new Date().getDate(),
    month = new Date().getMonth(),
    year = new Date().getFullYear()
) => {
    // Validar si day, month, year son números válidos antes de crear Date
    const targetDate = new Date(year, month, day);
    if (isNaN(targetDate.getTime())) {
        console.warn("Fecha inválida recibida del chatbot. Usando fecha actual.");
        targetDate = new Date(); // Fallback a la fecha actual si es inválida
    }

    setSelectedDay(targetDate.getDate());
    setCurrentDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)); // Esto asegura que el calendario se posicione en el mes correcto
    setShowAppointmentForm(true);

    
    setAppointmentData(prev => ({
      ...prev,
      clientName: userData?.fullName || '',
      email: userData?.email || ''
    }));
    
    setFormErrors({});
    setLoading(false);
  }, [userData]);

  const handleCloseAppointmentForm = () => {
    setShowAppointmentForm(false);
    setAppointmentData({
      clientName: "",
      service: "",
      time: "",
      notes: "",
      email: "",
    });
    setFormErrors({});
    setLoading(false);
    fetchWeekAppointments();
  };

  const handleFinalApiSubmission = async (e, finalData) => {
    e.preventDefault();

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.post("/agendar", finalData, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        console.log("Cita agendada exitosamente:", response.data);
        alert("¡Cita agendada con éxito! Revisa tu correo electrónico.");
        handleCloseAppointmentForm();
      } else {
        console.error("Error al agendar:", response.data.message);
        alert("Error al agendar la cita: " + (response.data.message || "Inténtalo de nuevo."));
      }
    } catch (error) {
      console.error("Error de red o servidor:", error);
      alert("Hubo un problema de conexión. Por favor, inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModalFromChatbot = useCallback((day, month, year) => {
    handleOpenModalFromChatbot = useCallback((day, month, year)=>{
      handleOpenModalFromChatbot(day, month, year);
    }, [handleOpenAppointmentForm], [handleOpenAppointmentForm]);
    if (selectedDateFromChat) {
      handleOpenAppointmentForm(selectedDateFromChat.getDate(), selectedDateFromChat);
    } else {
      handleOpenAppointmentForm(new Date().getDate());
    }
  }, [userData]);

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const getWeekAppointments = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startOfWeek && aptDate <= endOfWeek;
    });
  };

  const weekAppointments = getWeekAppointments();

  return (
    <div className="agendar-citas-page">
      <div className="main-content">
        <div className="headers-container" style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
          <h1 className="title">AGENDAR CITA</h1>
          <a href="/">
            <img src={img1} alt="Logo Medina Barber" className="logo" />
          </a>
        </div>

        <div className="calendar-container">
          <div className="calendar-section">
            <div className="calendar-nav">
              <button 
                onClick={handlePrevMonth} 
                className="nav-button"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button 
                onClick={handleNextMonth} 
                className="nav-button"
                aria-label="Mes siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-grid-header">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>
            
            <div className="calendar-grid">{days}</div>
          </div>

          <div className="sidebar">
            <div className="week-appointments">
              <h4>
                <Calendar size={20} style={{ display: 'inline', marginRight: '8px' }} />
                Citas de la Semana
              </h4>
              {weekAppointments.length > 0 ? (
                <div className="appointments-list">
                  {weekAppointments.map((appointment, index) => (
                    <div key={index} className="appointment-item">
                      <div className="appointment-date">
                        {new Date(appointment.date).toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-time">
                          <Clock size={14} />
                          {appointment.time}
                        </div>
                        <div className="appointment-service">
                          {appointment.service}
                        </div>
                        <div className="appointment-client">
                          {appointment.clientName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay citas programadas esta semana</p>
              )}
            </div>
            
            <button
              className="new-appointment-button"
              onClick={() => handleOpenAppointmentForm(selectedDay)}
              disabled={loading}
            >
              <Plus size={20} />
              {loading ? 'Procesando...' : 'Nueva Cita'}
            </button>
          </div>
        </div>

        <ChatbotWidget onOpenAppointmentModal={handleOpenModalFromChatbot} />

        {showAppointmentForm && (
          <AppointmentModal
            selectedDay={selectedDay}
            currentDate={currentDate}
            services={services}
            timeSlots={timeSlots}
            appointmentData={appointmentData}
            handleInputChange={handleInputChange}
            handleSubmit={handleFinalApiSubmission}
            handleCloseForm={handleCloseAppointmentForm}
            userData={userData}
          />
        )}
      </div>
    </div>
  );
}

export default CalendarioCitas;