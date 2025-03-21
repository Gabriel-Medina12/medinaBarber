"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import AppointmentModal from "./AppointmentModal"

function CalendarioCitas() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    clientName: "",
    service: "",
    time: "",
    notes: "",
  })

  // Servicios disponibles
  const services = [
    { id: "haircut", name: "Corte de cabello" },
    { id: "beard", name: "Afeitado de barba" },
    { id: "beard", name: "Alineado de barba" },
    { id: "paquetes", name: "Paquete 1" },
    { id: "paquetes", name: "Paquete 2" },
    { id: "paquetes", name: "Paquete 3" },
    { id: "paquetes", name: "Paquete 4" },
  ]

  // Horarios disponibles
  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ]

  // Obtener el nombre del mes y año actual
  const getMonthYearString = (date) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
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
    const days = generateDays()
    const firstDay = days[0]
    const lastDay = days[days.length - 1]

    // Crear una matriz de 6 semanas x 7 días, inicialmente vacía
    const grid = Array(6)
      .fill()
      .map(() => Array(7).fill(null))

    // Colocar cada día en su posición correcta en la matriz
    days.forEach((dayInfo) => {
      const weekIndex = Math.floor((firstDay.dayOfWeek + dayInfo.day - 1) / 7)
      grid[weekIndex][dayInfo.dayOfWeek] = dayInfo
    })

    return grid
  }

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
      setSelectedDay(day.day)
    }
  }

  // Abrir el formulario de nueva cita
  const handleNewAppointment = () => {
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
    })
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
  const handleSubmit = (e) => {
    e.preventDefault()

    // Aquí normalmente enviarías los datos al backend
    console.log("Nueva cita:", {
      ...appointmentData,
      day: selectedDay,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toISOString(),
    })

    // Cerrar el formulario
    setShowAppointmentForm(false)

    // Limpiar el formulario
    setAppointmentData({
      clientName: "",
      service: "",
      time: "",
      notes: "",
    })

    // Aquí podrías mostrar un mensaje de éxito
    alert("Cita agendada correctamente. Los datos se enviarían al backend.")
  }

  // Generar mini calendario para la barra lateral
  const generateMiniCalendar = () => {
    const calendarGrid = generateCalendarGrid()

    return calendarGrid.map((week, weekIndex) => (
      <React.Fragment key={`week-${weekIndex}`}>
        {week.map((day, dayIndex) => (
          <div
            key={`day-${weekIndex}-${dayIndex}`}
            className={`mini-day ${day && day.day === selectedDay ? "selected" : ""} ${!day ? "empty-day" : ""}`}
            onClick={() => day && handleDayClick(day)}
          >
            {day ? day.day : ""}
          </div>
        ))}
      </React.Fragment>
    ))
  }

  return (
    <div className="calendario-container">
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
          <h3>Todas mis citas</h3>
          {/* <p className="no-appointments">Las citas se cargarán desde la base de datos</p>
          <div className="sidebar-info">
            <p>Para agregar una nueva cita, haz clic en el botón "Nueva cita" en la parte superior.</p>
            <p>Las citas se mostrarán aquí una vez que se carguen desde el backend.</p>
          </div> */}
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
            {/* <div className="search-container">
              <input type="text" placeholder="Buscar" className="search-input" />
              <Search size={18} className="search-icon" />
            </div> */}
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
                          {/* Aquí se mostrarían las citas cargadas desde el backend */}
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

