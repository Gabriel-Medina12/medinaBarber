import React, { useState, useEffect, useRef } from 'react';
import '../ChatbotWidget.css'; // Asegúrate de que este archivo CSS exista
import barberGif from '../assets/img/barber-spin.gif'; // Asegúrate de que esta ruta sea correcta

// Importar el componente de calendario y sus estilos
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos básicos del calendario

console.log("📦 ChatbotWidget cargado");

const sendEmailNotification = (data) => {
  fetch('https://hook.us2.make.com/vitopvucvw6efs96tkz8fh8e7ix5qrky', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => console.log('✅ Webhook enviado a Make'))
    .catch(err => console.error('❌ Error al enviar a Make:', err));
};

function ChatbotWidget({ autoOpen = true, autoOpenDelay = 3000 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formStep, setFormStep] = useState(0); // Paso inicial para la bienvenida y elección (agendar/consulta)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false); // Nuevo estado para controlar la visibilidad del calendario

  // --- NUEVAS FUNCIONES DE UTILIDAD ---

  // Horario de atención y simulación de citas ocupadas
  const weeklySchedule = {
      'lunes': ['08:00', '09:00', '10:00', '11:00'],
      'martes': ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      'miércoles': ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      'jueves': ['08:00', '09:00', '10:00', '11:00'],
      'viernes': ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      'sábado': ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
  };

  // Simulación de turnos ocupados (ejemplo, en un sistema real vendría de una base de datos)
  const bookedAppointments = {
      '2025-06-25': ['10:00', '11:00', '15:00'], // Miércoles 25 de junio de 2025
      '2025-06-26': ['10:00', '16:00'],   // Jueves 26 de junio de 2025
      '2025-06-28': ['11:00', '13:00'],   // Sábado 28 de junio de 2025
      '2025-07-05': ['12:00'], // Ejemplo para el 5 de julio
  };

  // Objeto con respuestas predefinidas para FAQs
  const faqResponses = {
      'servicios': 'Ofrecemos corte de cabello, arreglo de barba y el combo completo. Nuestros barberos son expertos en los últimos estilos. ¿Te gustaría saber más de alguno en específico?',
      'precios': 'Nuestros precios son los siguientes: Corte de cabello: $10, Arreglo de barba: $8, Combo (corte + barba): $16. ¡Tenemos promociones especiales de vez en cuando!',
      'ubicacion': 'Estamos ubicados en la [Tu Dirección Exacta aquí, por ejemplo: Av. Principal, Centro Comercial El Sol, Local 5], ¡justo al lado de [Referencia, por ejemplo: la panadería La Esquina]! Te esperamos.',
      'contacto': 'Puedes contactarnos directamente al teléfono 0426-117-88-59 o por WhatsApp al mismo número. ¡Estamos a la orden!',
      'peluquero': 'Contamos con un equipo de barberos expertos. Todos son increíbles, ¡puedes confiar en cualquiera de ellos para un excelente servicio!',
      'promociones': '¡Claro! Mantente atento a nuestras redes sociales para las últimas promociones. Actualmente, si agendas tu primer combo, tienes un 10% de descuento.',
      'cancelar': 'Para cancelar o modificar tu cita, por favor, avísanos con al menos 24 horas de anticipación. Así podemos organizar la agenda y ofrecerle el espacio a otro cliente. Puedes llamarnos o escribirnos por WhatsApp.',
      // Agrega más preguntas y respuestas según necesites
  };


  const formatFriendlyDate = (dateString) => {
      // Importante: Añadir 'T00:00:00' para que JavaScript interprete la fecha en UTC y evite desfases horarios
      // que podrían cambiar el día en algunas zonas.
      const date = new Date(dateString + 'T00:00:00');
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      return date.toLocaleDateString('es-VE', options);
  };

  const suggestAvailableTimes = (dateString) => {
      // Importante: Añadir 'T00:00:00' para que JavaScript interprete la fecha en UTC y evite desfases horarios
      const date = new Date(dateString + 'T00:00:00');
      const dayOfWeek = date.toLocaleDateString('es-VE', { weekday: 'long' });
      // Normalizar el nombre del día para que coincida con las claves de weeklySchedule (ej: "miércoles" a "miercoles")
      const fullDayName = dayOfWeek.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const dailySlots = weeklySchedule[fullDayName] || [];
      const bookedSlots = bookedAppointments[dateString] || [];

      const availableSlots = dailySlots.filter(slot => !bookedSlots.includes(slot));
      
      // Formatea los horarios para AM/PM y asegura que horas como '00' se muestren como '12' AM
      return availableSlots.map(slot => {
          const [hour, minute] = slot.split(':');
          let formattedHour = parseInt(hour);
          const ampm = formattedHour >= 12 ? 'p.m.' : 'a.m.';
          formattedHour = formattedHour > 12 ? formattedHour - 12 : formattedHour;
          formattedHour = formattedHour === 0 ? 12 : formattedHour; // 00:00 es 12 a.m.
          return `${formattedHour}:${minute} ${ampm}`;
      });
  };

  const steps = [
    { key: 'welcome', question: '¡Hola! Bienvenido a Medina Barber 💈. ¿En qué podemos ayudarte hoy? ¿Deseas agendar una cita o tienes alguna consulta?' },
    { key: 'name', question: '¡Excelente! Para empezar, ¿podrías decirme tu nombre, por favor? Así sé cómo dirigirme a ti. 😊' },
    { key: 'email', question: '¡Un gusto! Ahora, ¿cuál es tu correo electrónico? Así podemos enviarte la confirmación de tu cita. 📧' },
    { key: 'phone', question: 'Perfecto. Y para estar conectados, ¿cuál es tu número de teléfono? 📞' },
    { key: 'service', question: '¿Qué servicio te gustaría agendar hoy? ¿Un corte de cabello, arreglar la barba o el combo completo de corte y barba? ¡Tú eliges! 😉' },
    { key: 'date', question: '¡Entendido! Por favor, selecciona la fecha de tu preferencia en el calendario:' }, // La pregunta de la fecha ahora solo introduce el calendario
    { key: 'time', question: '¿A qué hora te gustaría agendar?' } // Esta pregunta se lanzará después de seleccionar la fecha
  ];

  useEffect(() => {
    const chatbotClosed = localStorage.getItem('chatbotClosed');
    if (autoOpen && !chatbotClosed) {
      setTimeout(() => {
        setIsOpen(true);
        if (messages.length === 0) { // Evita duplicar el mensaje si ya se cargó
            addMessage('bot', steps[0].question); // Saludo inicial
        }
      }, autoOpenDelay);
    } else if (!chatbotClosed && isOpen) {
        if (messages.length === 0) {
            addMessage('bot', steps[0].question);
        }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return; // No enviar mensajes vacíos
    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');

    // Lógica para el primer paso (elegir entre agendar cita o consulta)
    if (formStep === 0) {
        if (userMessage.toLowerCase().includes('cita') || userMessage.toLowerCase().includes('agendar')) {
            setTimeout(() => {
                addMessage('bot', steps[1].question); // Pasa a preguntar el nombre
                setFormStep(1);
                setShowCalendar(false); // Asegura que el calendario esté oculto para esta rama
            }, 600);
        } else if (userMessage.toLowerCase().includes('consulta') || userMessage.toLowerCase().includes('pregunta') || userMessage.toLowerCase().includes('horario') || userMessage.toLowerCase().includes('otra consulta')) {
            setTimeout(() => {
                let botResponse = `¡Claro! Con gusto te ayudo con tu consulta. Nuestro horario de atención es:
                \n• Lunes: 8:00 a.m. - 12:00 p.m.
                \n• Martes: 10:00 a.m. - 6:00 p.m.
                \n• Miércoles: 10:00 a.m. - 6:00 p.m.
                \n• Jueves: 8:00 a.m. - 12:00 p.m.
                \n• Viernes: 10:00 a.m. - 6:00 p.m.
                \n• Sábado: 11:00 a.m. - 5:00 p.m.
                \n\n`; // Incluye el horario por defecto

                let foundFaq = false;
                const lowerCaseMessage = userMessage.toLowerCase();

                // Intenta encontrar una respuesta en las FAQs
                for (const key in faqResponses) {
                    if (lowerCaseMessage.includes(key)) {
                        botResponse += faqResponses[key] + "\n\n"; // Añade la respuesta de la FAQ
                        foundFaq = true;
                        break; // Solo responde a la primera FAQ encontrada
                    }
                }

                if (!foundFaq && !lowerCaseMessage.includes('horario')) {
                    // Si no encontró FAQ específica y no preguntó solo por horario
                    botResponse += `Disculpa, no pude encontrar una respuesta específica para eso. ¿Sobre qué te gustaría consultar? Por ejemplo, puedo darte información sobre nuestros **servicios**, **precios**, **ubicación**, **contacto** o **promociones**. En caso de tener una consulta diferente, te invito a contactarnos a través de nuestro número 0426-117-88-59 o nuestro correo medinabarber1@gmail.com. ¿Te parece una opción?`;
                } else if (foundFaq && !lowerCaseMessage.includes('horario')) {
                    // Si encontró FAQ pero no se preguntó por horario, solo añadir el complemento
                    botResponse += '¿Hay algo más en lo que pueda ayudarte con esto, o te gustaría agendar una cita?';
                } else if (lowerCaseMessage.includes('horario') && !foundFaq) {
                    // Si solo preguntó por horario y no encontró otra FAQ
                    botResponse += '¿Te gustaría agendar una cita ahora o tienes alguna otra consulta?';
                }
                
                addMessage('bot', botResponse);
                setShowCalendar(false); // Asegura que el calendario esté oculto para esta rama
                // Permanece en el paso 0 para re-evaluar la intención del usuario
            }, 600);
        } else {
             setTimeout(() => {
                addMessage('bot', `Disculpa, no entendí tu respuesta. ¿Deseas agendar una cita o tienes alguna consulta?`);
                setShowCalendar(false); // Asegura que el calendario esté oculto
            }, 600);
        }
        return; // Detiene la ejecución para que no avance a los pasos de agendamiento
    }

    const currentKey = steps[formStep].key;
    const updatedData = { ...formData, [currentKey]: userMessage };
    setFormData(updatedData);

    // Lógica para los pasos intermedios (nombre, email, teléfono, servicio)
    // Se excluye 'date' y 'time' de la progresión automática vía input, ya que 'date' usa calendario
    // y 'time' es el paso final de input antes de la confirmación.
    if (formStep < steps.length - 1 && currentKey !== 'date' && currentKey !== 'time') {
        setTimeout(() => {
            addMessage('bot', steps[formStep + 1].question);
            setFormStep(formStep + 1);
            // Si el siguiente paso es la fecha, mostrar el calendario
            if (steps[formStep + 1].key === 'date') {
                setShowCalendar(true);
            } else {
                setShowCalendar(false); // Asegura que el calendario se oculte si no es el paso de fecha
            }
        }, 600);
    } else if (currentKey === 'time') {
        // Este es el último paso del formulario, procesar la cita
        setTimeout(() => {
            addMessage('bot', `¡Genial, ${updatedData.name}! Tu cita para ${updatedData.service} ha sido agendada para el ${formatFriendlyDate(updatedData.date)} a las ${updatedData.time}. ¡Te esperamos!`);
            
            // Mensaje de política de cancelación
            setTimeout(() => {
                addMessage('bot', `Queremos recordarte que, si necesitas cancelar o modificar tu cita, por favor, avísanos con al menos 24 horas de anticipación. ¡Así podemos organizar la agenda y ofrecerle el espacio a otro cliente! 😉`);
            }, 1000); // Pequeño retraso para que el mensaje anterior se asimile

            console.log('📤 Enviando al webhook:', updatedData);
            sendEmailNotification(updatedData);

            // Reiniciar el chatbot después de un momento
            setTimeout(() => {
                addMessage('bot', '¡Tu solicitud ha sido enviada con éxito! Pronto nos comunicaremos contigo para confirmar los detalles. ¡Gracias por elegir Medina Barber! 💈 ¿Hay algo más en lo que pueda ayudarte hoy?');
                setFormStep(0); // Vuelve al paso inicial (bienvenida/consulta/agendar)
                setFormData({ name: '', email: '', phone: '', service: '', date: '', time: '' });
            }, 2000); // Retraso para el mensaje final
        }, 600);
    }
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (!newState) {
      localStorage.setItem('chatbotClosed', 'true');
    } else {
      localStorage.removeItem('chatbotClosed'); // Eliminar al abrir manualmente
      if (messages.length === 0) { // Si no hay mensajes, iniciar la conversación
        addMessage('bot', steps[0].question);
      }
    }
  };

  // Función para manejar la selección de fecha desde el calendario
  const handleDateSelect = (date) => {
      // date.toISOString().slice(0, 10) obtiene 'AAAA-MM-DD'
      const selectedDateISO = date.toISOString().slice(0, 10);
      const friendlyDate = formatFriendlyDate(selectedDateISO);

      addMessage('user', friendlyDate); // Muestra la fecha seleccionada por el usuario
      setFormData({ ...formData, date: selectedDateISO });
      
      // Simular la búsqueda de horarios disponibles
      setTimeout(() => {
          const availableTimes = suggestAvailableTimes(selectedDateISO);
          let botResponse = '';

          if (availableTimes.length > 0) {
              botResponse = `¡Excelente! Para el ${friendlyDate}, tenemos disponibilidad en los siguientes horarios: ${availableTimes.join(', ')}. ¿Cuál te gustaría reservar?`;
              addMessage('bot', botResponse);
              setFormStep(formStep + 1); // Avanza al paso de la hora
              setShowCalendar(false); // Oculta el calendario definitivamente si hay tiempos disponibles
          } else {
              // Si no hay disponibilidad, se mantiene en el mismo formStep (fecha)
              // y se vuelve a mostrar el calendario para que elija otra fecha.
              botResponse = `Lo siento, para el ${friendlyDate} ya estamos full. ¿Te gustaría agendar para otra fecha? Por favor, selecciona otra fecha en el calendario.`;
              addMessage('bot', botResponse);
              setShowCalendar(true); // Vuelve a mostrar el calendario para que elija otra fecha
              // No se cambia el formStep, se queda en el paso de la fecha hasta que elija una disponible
          }
      }, 600);
  };


  return (
    <>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={handleToggle}>
          <img src={barberGif} alt="Abrir chatbot" className="chatbot-icon" />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-widget open">
          <div className="chatbot-container">
            <div className="chatbot-header">
              <img
                src={barberGif}
                alt="Medina Barber"
                className="chatbot-header-icon"
                onClick={handleToggle}
                style={{ cursor: 'pointer' }}
              />
              <h3 className="chatbot-title">Medina Barber</h3>
              <button className="chatbot-close" onClick={handleToggle}>✕</button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg, index) => {
                return (
                  <div key={index} className={`message ${msg.sender}`}>
                    {msg.text}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chatbot-input">
              {/* Renderiza el calendario si estamos en el paso de la fecha (formStep 5) y showCalendar es true */}
              {formStep === 5 && showCalendar ? (
                <div className="calendar-wrapper">
                    <Calendar
                        onChange={handleDateSelect}
                        value={new Date()} // Inicia el calendario en la fecha actual
                        minDate={new Date()} // No permite seleccionar fechas pasadas
                        locale="es-ES" // Asegura el idioma español
                    />
                </div>
              ) : (
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  // Deshabilitar input si el calendario está visible y estamos en el paso de la fecha
                  disabled={formStep === 5 && showCalendar}
                />
              )}
              {/* El botón "Enviar" también se deshabilita si el calendario está abierto y esperando una selección */}
              <button type="submit" disabled={formStep === 5 && showCalendar}>Enviar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
