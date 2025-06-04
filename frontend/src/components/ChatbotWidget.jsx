import React, { useState, useEffect, useRef } from 'react';
import '../ChatbotWidget.css';

function ChatbotWidget({ onOpenAppointmentModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationStep, setConversationStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userName, setUserName] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const messagesEndRef = useRef(null);
  const [visibleDatesCount, setVisibleDatesCount] = useState(10);
  const [availableDates, setAvailableDates] = useState([]);
  const [displayedDates, setDisplayedDateRange] = useState([]);
  const APPOINTMENT_DISPLAY_LIMIT = 5;

  // Servicios y horarios (actualizados para junio)
  const services = {
    'Corte de cabello': 5,
    'Arreglo de barba': 3,
    'Corte + barba': 7,
    'Tratamiento de barba': 2
  };

  // Fechas disponibles en formato DD/MM (corregido para junio)
  const availableSlots = {
    '03/06': ['10:00 AM', '2:00 PM'],
    '04/06': ['9:00 AM', '3:00 PM'],
    '05/06': ['11:00 AM', '4:00 PM']
  };

  // Helper para desplazamiento automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addMessage('bot', '¡Hola! Soy tu asistente de Medina Barber. ¿Cómo te llamas?');
      }, 500);
    }
  }, [isOpen, messages.length]);
  const fetchAvailableDates = async () => {
        // En un escenario real, harías una llamada a tu API aquí
        // Por ahora, simulamos algunas fechas futuras
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) { // Generar 30 días futuros
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + i);
            dates.push({
                day: futureDate.getDate(),
                month: futureDate.getMonth(), // 0-indexed
                year: futureDate.getFullYear(),
                formatted: futureDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' }), // Formato "D/M"
                fullFormatted: futureDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), // Formato "lunes, 3 de junio de 2025"
            });
        }
        setAvailableDates(dates);
    };
  useEffect(() => {
    if (isOpen) {
      fetchAvailableDates(); // Carga las fechas cuando el chatbot se abre
      }
  }, [isOpen]);


  const addMessage = (sender, text) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');
    processBotResponse(userMessage);
  };

  // FUNCIÓN CORREGIDA: handleConfirmAppointment
  const handleConfirmAppointment = () => {
    // Asegurarse de que selectedDate sea un objeto Date válido
    let dateToUse;
    
    try {
      // Intentar convertir a Date si no lo es ya
      dateToUse = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      
      // Verificar que sea una fecha válida
      if (isNaN(dateToUse.getTime())) {
        throw new Error('Fecha inválida');
      }
    } catch (error) {
      console.error('Error al procesar la fecha:', selectedDate);
      addMessage('bot', '❌ Error al procesar la fecha. Por favor, intenta nuevamente.');
      return;
    }
    if (selectedDateFromChat) {
        onOpenAppointmentModal(selectedDateFromChat.day, selectedDateFromChat.month, selectedDateFromChat.year);
        // ... (resto de tu lógica)
    } else {
        addMessage('bot', 'No se ha seleccionado una fecha válida. Por favor, intenta de nuevo.');
    }

    
    if (onOpenAppointmentModal) {
      onOpenAppointmentModal({
        date: dateToUse,
        service: selectedService,
        userName: userName
      });
    }
  };

  // FUNCIÓN MEJORADA: parseUserDate
  const parseUserDate = (userInput) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const input = userInput.toLowerCase().trim();
    
    // Caso especial: "ver más"
    if (input === 'ver más') {
      return 'ver_mas'; // Valor especial para manejar este caso
    }
    
    // 1. Fechas relativas
    if (input.includes('hoy')) return today;
    if (input.includes('mañana')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    }
    if (input.includes('pasado mañana')) {
      const dayAfter = new Date(today);
      dayAfter.setDate(today.getDate() + 2);
      return dayAfter;
    }
    
    // 2. Aceptar formatos "03/06" y "3/6"
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})/;
    const match = input.match(dateRegex);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // Meses en JS: 0-11
      const parsedDate = new Date(currentYear, month, day);
      // Validar fecha (que no sea en el pasado)
      if (parsedDate >= today && parsedDate.getMonth() === month) {
        return parsedDate;
      }
    }
    
    // 3. Formato textual ("3 de junio")
    const monthNames = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    const textMatch = input.match(/(\d{1,2})\s+de\s+(\w+)/);
    if (textMatch) {
      const day = parseInt(textMatch[1]);
      const monthName = textMatch[2].toLowerCase();
      if (monthNames.hasOwnProperty(monthName)) {
        const month = monthNames[monthName];
        const parsedDate = new Date(currentYear, month, day);
        if (parsedDate >= today) {
          return parsedDate;
        }
      }
    }
    
    return null; // Fecha no válida
  };

  const parseDateInput = (input) => {
        const lowerCaseInput = input.toLowerCase();
        const today = new Date();
        let targetDate = null;

        if (lowerCaseInput.includes('hoy')) {
            targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        } else if (lowerCaseInput.includes('mañana')) {
            targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        } else {
            // Intentar parsear "D/M" o "D de Mes"
            const parts = lowerCaseInput.match(/(\d{1,2})[/\sde\s]*(\d{1,2}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
            if (parts) {
                let day = parseInt(parts[1], 10);
                let month;
                if (isNaN(parts[2])) { // Si es un nombre de mes
                    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                    month = monthNames.indexOf(parts[2]);
                } else { // Si es un número de mes
                    month = parseInt(parts[2], 10) - 1; // 0-indexed
                }

                if (!isNaN(day) && month !== -1) {
                    let year = today.getFullYear();
                    // Si el mes es anterior al actual, asumimos el próximo año
                    if (month < today.getMonth() && day > today.getDate()) {
                         // No cambiar de año automáticamente a menos que el mes sea muy atrás
                         // Por simplicidad, asumimos el año actual por ahora.
                    } else if (month < today.getMonth() && day <= today.getDate()) {
                        year = today.getFullYear() + 1; // Para el caso de "3 de enero" en diciembre
                    }

                    targetDate = new Date(year, month, day);

                    // Validar si la fecha está en el pasado (excepto si es hoy)
                    if (targetDate.setHours(0,0,0,0) < today.setHours(0,0,0,0)) {
                        targetDate = new Date(year + 1, month, day); // Prueba con el próximo año
                        if (targetDate.setHours(0,0,0,0) < today.setHours(0,0,0,0)) {
                            targetDate = null; // Aún en el pasado, inválida
                        }
                    }

                }
            }
        }

        if (targetDate && !isNaN(targetDate.getTime())) {
            return {
                day: targetDate.getDate(),
                month: targetDate.getMonth(), // 0-indexed
                year: targetDate.getFullYear(),
                formatted: targetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' }),
                fullFormatted: targetDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            };
        }
        return null;
    };

    const parseTimeInput = (input) => {
        // Ejemplo simple para parsear "10:00", "10 am", "2 pm"
        const lowerCaseInput = input.toLowerCase();
        const match = lowerCaseInput.match(/(\d{1,2})(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?/);
        if (match) {
            let hour = parseInt(match[1], 10);
            let minutes = match[2] ? parseInt(match[2].substring(1), 10) : 0;
            const ampm = match[3];

            if (ampm && ampm.includes('p')) {
                if (hour < 12) hour += 12; // Convertir a formato 24h
            } else if (ampm && ampm.includes('a') && hour === 12) {
                hour = 0; // Medianoche
            }
            return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        return null;
    };


  const generateAvailableDates = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 3);
    const available = {};
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) {
        const dateKey = `${d.getDate()}/${d.getMonth() + 1}`;
        available[dateKey] = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
      }
    }
    return Object.fromEntries(
      Object.entries(available).slice(0, visibleDatesCount)
    );
  };

  // Formatear fecha para mostrar al usuario
  const formatDateForUser = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // FUNCIÓN MEJORADA: processBotResponse
  const processBotResponse = async (userMessage) => {
    let botResponse = '';
    let nextStep = conversationStep;
    
    switch (conversationStep) {
      case 0: // Saludo inicial
        if (lowerCaseMessage.includes('agendar') || lowerCaseMessage.includes('cita')) {
          botResponse = '¡Claro! Te guiaré para agendar tu cita.';
          nextStep = 1; // Preguntar por la acción
        } else if (lowerCaseMessage.includes('pregunta') || lowerCaseMessage.includes('duda')) {
          botResponse = 'Estoy aquí para ayudarte con agendamientos. Para otras preguntas, puedes contactarnos directamente al +58 412-2911866.';
          nextStep = 0;
        } else if (lowerCaseMessage.includes('horarios') || lowerCaseMessage.includes('disponibilidad')) {
          addMessage('bot', 'Consultando horarios disponibles...');
          // Pasamos a un nuevo paso para mostrar los horarios disponibles
          nextStep = 3;
          setTimeout(() => processBotResponse('show_schedules'), 500); // Llama a la siguiente lógica para mostrar horarios
            return; // Importante para evitar que se procese el caso 1 inmediatamente
        } else {
          botResponse = 'No entendí eso. ¿Te gustaría agendar una cita o consultar horarios?';
          nextStep = 0;
        }
        break;
        
      case 1: // Después de "agendar" - Preguntar si quiere ver calendario o preguntar fecha
                if (lowerCaseMessage.includes('agendar')) { // Si el usuario vuelve a decir agendar
                    botResponse = '¿Quieres que abra el calendario para que elijas la fecha, o prefieres que te muestre las fechas disponibles aquí en el chat?';
                    nextStep = 2;
                } else {
                    botResponse = '¿Cómo te gustaría agendar? ¿Quieres que te muestre las fechas disponibles o abro el calendario directamente?';
                    nextStep = 2;
                }
                break;

            case 2: // Preguntar si quiere ver fechas en chat o abrir calendario
                if (lowerCaseMessage.includes('calendario') || lowerCaseMessage.includes('abrir')) {
                    addMessage('bot', '¡Entendido! Abriendo el formulario de agendamiento...');
                    setTimeout(() => {
                        onOpenAppointmentModal(new Date().getDate(), new Date().getMonth(), new Date().getFullYear()); // Abre el modal con la fecha actual
                        setIsOpen(false); // Cierra el chat
                        setMessages([]); // Limpia el chat
                        setConversationStep(0); // Reinicia
                    }, 1000);
                    return; // Salir para no añadir otra respuesta de bot
                } else if (lowerCaseMessage.includes('fechas') || lowerCaseMessage.includes('disponibles') || lowerCaseMessage.includes('mostrar')) {
                    addMessage('bot', 'Consultando horarios disponibles...');
                    nextStep = 3;
                    setTimeout(() => processBotResponse('show_schedules'), 500); // Llama a la siguiente lógica para mostrar horarios
                    return;
                } else {
                    botResponse = 'Por favor, dime si quieres "abrir calendario" o "mostrar fechas disponibles" aquí en el chat.';
                    nextStep = 2;
                }
                break;

            case 3: // Mostrar horarios disponibles (manejo de "show_schedules" y "ver más")
                if (userMessage === 'show_schedules' || lowerCaseMessage.includes('ver más')) {
                    let startIndex = displayedDateRange.start;
                    let endIndex = displayedDateRange.end;

                    if (lowerCaseMessage.includes('ver más')) {
                        startIndex = displayedDateRange.end;
                        endIndex = Math.min(availableDates.length, displayedDateRange.end + APPOINTMENT_DISPLAY_LIMIT);
                    }

                    if (startIndex >= availableDates.length) {
                        botResponse = 'No hay más fechas disponibles por ahora. Intenta seleccionar una de las fechas mostradas o prueba otro día.';
                        nextStep = 4; // Avanza para pedir selección de fecha
                        break;
                    }

                    const datesToShow = availableDates.slice(startIndex, endIndex);
                    if (datesToShow.length === 0) {
                        botResponse = 'Lo siento, no hay fechas disponibles en este momento.';
                        nextStep = 0; // Reinicia la conversación
                    } else {
                        const dateOptions = datesToShow.map(date => `• ${date.formatted}`);
                        botResponse = `📅 Selecciona una fecha (ej. "4/6" o "mañana"): \n${dateOptions.join('\n')}`;

                        if (endIndex < availableDates.length) {
                            botResponse += '\nO escribe "ver más" para cargar próximas fechas.';
                        }
                        setDisplayedDateRange({ start: startIndex, end: endIndex });
                        nextStep = 4; // Espera la selección de fecha
                    }
                } else {
                    // Esta lógica debería manejar la entrada de la fecha
                    nextStep = 4; // Asumimos que si no es 'show_schedules' o 'ver más', es un intento de fecha
                    // La lógica para parsear la fecha se moverá a case 4.
                    return processBotResponse(userMessage); // Re-procesar el mensaje en el caso 4
                }
                break;

            case 4: // Esperando selección de fecha por parte del usuario
                // Lógica para parsear la fecha ingresada por el usuario
                const parsedDate = parseDateInput(userMessage);

                if (parsedDate) {
                    setSelectedDateFromChat(parsedDate); // Guarda la fecha parseada
                    // Buscar horarios disponibles para esa fecha específica
                    const formattedDateForDisplay = parsedDate.fullFormatted; // Formato completo para el usuario
                    const demoTimeSlots = ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']; // Simulamos horarios
                    botResponse = `Horarios disponibles para ${formattedDateForDisplay}: \n${demoTimeSlots.map(t => `• ${t}`).join('\n')}\nPor favor, selecciona una hora (ej. "10:00 AM").`;
                    nextStep = 5; // Espera la hora
                } else if (lowerCaseMessage.includes('ver más')) {
                    // Si el usuario escribe "ver más" en el caso 4, volvemos a procesar en el caso 3
                    nextStep = 3;
                    return processBotResponse('ver más');
                } else {
                    botResponse = '❌ No entendí la fecha. Por favor, intenta un formato como: "4/6", "mañana", "3 de junio", o "hoy".';
                    nextStep = 4; // Permanece en el mismo paso para reintentar la fecha
                }
                break;

            case 5: // Esperando selección de hora
                // Lógica para parsear la hora ingresada por el usuario
                const selectedHour = parseTimeInput(userMessage);
                if (selectedHour && selectedDateFromChat) {
                    setAppointmentDetails({
                        ...selectedDateFromChat, // Ya tiene day, month, year
                        time: selectedHour,
                    });
                    botResponse = `Perfecto. Tu cita para el ${selectedDateFromChat.fullFormatted} a las ${selectedHour} está casi lista. ¿Quieres confirmar? (Sí/No)`;
                    nextStep = 6; // Espera confirmación
                } else {
                    botResponse = '❌ No entendí la hora. Por favor, selecciona una hora de las disponibles (ej. "10:00 AM").';
                    nextStep = 5; // Permanece en el mismo paso
                }
                break;

            case 6: // Esperando confirmación de la cita
                if (lowerCaseMessage.includes('sí') || lowerCaseMessage.includes('si') || lowerCaseMessage.includes('confirmar')) {
                    addMessage('bot', '¡Excelente! Abriendo el formulario de agendamiento para finalizar los detalles.');
                    setTimeout(() => {
                        if (onOpenAppointmentModal && appointmentDetails) {
                            onOpenAppointmentModal(
                                appointmentDetails.day,
                                appointmentDetails.month,
                                appointmentDetails.year
                            );
                            setIsOpen(false);
                            setMessages([]);
                            setConversationStep(0); // Reinicia la conversación
                            setAppointmentDetails(null); // Limpia los detalles
                        }
                    }, 1000);
                    return;
                } else if (lowerCaseMessage.includes('no') || lowerCaseMessage.includes('cancelar')) {
                    botResponse = 'Cita cancelada. ¿Hay algo más en lo que pueda ayudarte?';
                    nextStep = 0; // Reinicia
                    setAppointmentDetails(null);
                } else {
                    botResponse = '¿Sí o No?';
                    nextStep = 6;
                }
                break;

            default:
                botResponse = 'Lo siento, no entendí. ¿Te gustaría agendar una cita o consultar horarios?';
                nextStep = 0;
                break;
        }
        if (botResponse) {
            setTimeout(() => {
                addMessage('bot', botResponse);
                setConversationStep(nextStep);
            }, 500);
        }
    };


  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬 Chat'}
      </button>
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Medina Barber</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatbotWidget;
