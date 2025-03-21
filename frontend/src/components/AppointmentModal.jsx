"use client"
import { User, Scissors, Clock, Calendar } from "lucide-react"

function AppointmentModal({
  selectedDay,
  currentDate,
  services,
  timeSlots,
  appointmentData,
  handleInputChange,
  handleSubmit,
  handleCloseForm,
}) {
  // Obtener el nombre del mes
  const getMonthName = (date) => {
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
    return months[date.getMonth()]
  }

  return (
    <div className="appointment-modal-overlay">
      <div className="appointment-modal">
        <div className="modal-header">
          <h3>
            Nueva Cita - {selectedDay} de {getMonthName(currentDate)}, {currentDate.getFullYear()}
          </h3>
          <button className="close-button" onClick={handleCloseForm}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>
              <User size={18} />
              <span>Nombre del cliente</span>
            </label>
            <input
              type="text"
              name="clientName"
              value={appointmentData.clientName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Scissors size={18} />
              <span>Servicio</span>
            </label>
            <select name="service" value={appointmentData.service} onChange={handleInputChange} required>
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <Clock size={18} />
              <span>Hora</span>
            </label>
            <select name="time" value={appointmentData.time} onChange={handleInputChange} required>
              <option value="">Seleccionar hora</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <Calendar size={18} />
              <span>Notas adicionales</span>
            </label>
            <textarea name="notes" value={appointmentData.notes} onChange={handleInputChange} rows={3}></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCloseForm}>
              Cancelar
            </button>
            <button type="submit" className="save-button">
              Guardar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentModal

