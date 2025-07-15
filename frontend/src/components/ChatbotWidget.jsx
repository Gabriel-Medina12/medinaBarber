import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../ChatbotWidget.css';
import barberGif from '../assets/img/barber-spin.gif';
import ReactMarkdown from 'react-markdown';

console.log("📦 ChatbotWidget cargado");

const sendEmailNotification = (data) => {
  fetch('https://hook.us2.make.com/96eolgbrj5jgydphponitbe1hptm9q54', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => console.log('✅ Webhook enviado a Make:', res))
    .catch(err => console.error('❌ Error al enviar a Make:', err));
};

function ChatbotWidget({ autoOpen = true, autoOpenDelay = 3000 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formStep, setFormStep] = useState(0);
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [hasWelcomeMessageBeenShown, setHasWelcomeMessageBeenShown] = useState(false);

  // --- Datos y funciones de utilidad ---
  const weeklySchedule = {
    'lunes': ['08:00', '09:00', '10:00', '11:00'],
    'martes': ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    'miercoles': ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    'jueves': ['08:00', '09:00', '10:00', '11:00'],
    'viernes': ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    'sabado': ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
  };

  const bookedAppointments = {
    '2025-06-25': ['10:00', '11:00', '15:00'],
    '2025-06-26': ['10:00', '16:00'],
    '2025-06-28': ['11:00', '13:00'],
    '2025-07-05': ['12:00'],
  };

  const faqOptions = {
    'servicios': { numbers: ['1', 'servicios', 'servicio'], response: 'Ofrecemos corte de cabello, arreglo de barba y el combo completo. Nuestros barberos son expertos en los últimos estilos. ¿Te gustaría saber más de alguno en específico?' },
    'precios': { numbers: ['2', 'precios', 'precio'], response: 'Nuestros precios son los siguientes: Corte de cabello: $10, Arreglo de barba: $8, Combo (corte + barba): $16. ¡Tenemos promociones especiales de vez en cuando!' },
    'horarios': { numbers: ['3', 'horarios', 'horario'], response: `Nuestro horario de atención es:
              \n• Lunes: 8:00 a.m. - 12:00 p.m.
              \n• Martes: 10:00 a.m. - 6:00 p.m.
              \n• Miércoles: 10:00 a.m. - 6:00 p.m.
              \n• Jueves: 8:00 a.m. - 12:00 p.m.
              \n• Viernes: 10:00 a.m. - 6:00 p.m.
              \n• Sábado: 11:00 a.m. - 5:00 p.m.` },
    'ubicacion': { numbers: ['4', 'ubicacion', 'dirección'], response: 'Estamos ubicados en la [Tu Dirección Exacta aquí, por ejemplo: Av. Principal, Centro Comercial El Sol, Local 5], ¡justo al lado de [Referencia, por ejemplo: la panadería La Esquina]! Te esperamos.' },
    'contacto': { numbers: ['5', 'contacto', 'llamar', 'numero'], response: 'Puedes contactarnos directamente al teléfono 0426-117-88-59 o por WhatsApp al mismo número. ¡Estamos a la orden!' },
    'promociones': { numbers: ['6', 'promociones', 'ofertas'], response: '¡Claro! Mantente atento a nuestras redes sociales para las últimas promociones. Actualmente, si agendas tu primer combo, tienes un 10% de descuento.' },
  };

  const faqMenu = `¡Claro! Con gusto te ayudo con tu consulta. \n¿Sobre qué te gustaría saber? \nPor favor, dime el **número** o la **palabra clave** de tu interés:
    1.  **Servicios**
    2.  **Precios**
    3.  **Horarios**
    4.  **Ubicación**
    5.  **Contacto**
    6.  **Promociones**`;

  const notUnderstoodMessage = `Disculpa, no entendí. \nPor favor, **elige un tema del menú** (por ejemplo, '1' o 'Servicios'). Si lo prefieres, puedes **comunicarte al 0426-117-88-59** o escribirnos a **medinabarber1@gmail.com**.`;

  const steps = [
    {  key: 'welcome', question: '¡Hola! 👋\n Bienvenido a Medina Barber 💈 ¿Cómo te va? ¿Deseas agendar una cita o tienes una consulta?' },
    { key: 'name', question: '¡Excelente! Para empezar, \n¿podrías escribir tu nombre, por favor?\n Así sé cómo dirigirme a ti. 😊' },
    { key: 'email', question: '¡Un gusto! Ahora, \n¿cuál es tu correo electrónico? \nAsí podemos enviarte la confirmación de tu cita. 📧' },
    { key: 'phone', question: 'Perfecto. \nY para estar conectados, \n¿cuál es tu número de teléfono? 📞' },
    { key: 'service', question: '¿Qué servicio te gustaría agendar hoy? \n¿Un corte de cabello, arreglo de barba o el combo completo de corte y barba? \n¡Tú eliges! 😉' },
    { key: 'date', question: '¡Entendido! Por favor, selecciona la fecha de tu preferencia en el calendario:' },
    { key: 'time', question: '¿A qué hora te gustaría agendar?' }
  ];

  // Efecto para la apertura automática y para mostrar el mensaje de bienvenida UNA VEZ
  useEffect(() => {
    const chatbotClosed = localStorage.getItem('chatbotClosed');
    
    // Solo mostrar mensaje si está abierto (automáticamente o manualmente) y no se ha mostrado antes
    if (isOpen && !hasWelcomeMessageBeenShown) {
      addMessage('bot', steps[0].question);
      setHasWelcomeMessageBeenShown(true);
    }
    
    // Lógica de apertura automática independiente
    if (autoOpen && !chatbotClosed && !isOpen) {
      setTimeout(() => {
        setIsOpen(true);
      }, autoOpenDelay);
    }
  }, [isOpen, autoOpen, autoOpenDelay, hasWelcomeMessageBeenShown]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const formatFriendlyDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-VE', options);
  };

  const suggestAvailableTimes = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.toLocaleDateString('es-VE', { weekday: 'long' });
    const fullDayName = dayOfWeek.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const dailySlots = weeklySchedule[fullDayName] || [];
    const bookedSlots = bookedAppointments[dateString] || [];

    const availableSlots = dailySlots.filter(slot => !bookedSlots.includes(slot));
    
    return availableSlots.map(slot => {
      const [hour, minute] = slot.split(':');
      let formattedHour = parseInt(hour);
      const ampm = formattedHour >= 12 ? 'p.m.' : 'a.m.';
      formattedHour = formattedHour > 12 ? formattedHour - 12 : formattedHour;
      formattedHour = formattedHour === 0 ? 12 : formattedHour;
      return `${formattedHour}:${minute} ${ampm}`;
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');

    if (formStep === 0 && !isConsulting) {
      if (userMessage.toLowerCase().includes('cita') || userMessage.toLowerCase().includes('agendar')) {
        setTimeout(() => {
          addMessage('bot', steps[1].question);
          setFormStep(1);
          setShowCalendar(false);
          setIsConsulting(false);
        }, 600);
      } else if (userMessage.toLowerCase().includes('consulta') || userMessage.toLowerCase().includes('pregunta')) {
        setTimeout(() => {
          addMessage('bot', faqMenu);
          setIsConsulting(true);
          setFormStep(0);
          setShowCalendar(false);
        }, 600);
      } else {
        setTimeout(() => {
          addMessage('bot', `Disculpa, no entendí tu respuesta. ¿Deseas agendar una cita o tienes alguna consulta?`);
          setShowCalendar(false);
          setIsConsulting(false);
        }, 600);
      }
      return;
    }

    if (isConsulting) {
      const lowerCaseMessage = userMessage.toLowerCase();
      let foundResponse = false;
      
      for (const key in faqOptions) {
        if (faqOptions[key].numbers.includes(lowerCaseMessage) || faqOptions[key].numbers.some(numKey => lowerCaseMessage.includes(numKey))) {
          setTimeout(() => {
            addMessage('bot', faqOptions[key].response + '\n\n¿Hay algo más en lo que pueda ayudarte con esto, o te gustaría agendar una cita?');
            setIsConsulting(false);
            setFormStep(0);
          }, 600);
          foundResponse = true;
          break;
        }
      }

      if (!foundResponse) {
        setTimeout(() => {
          addMessage('bot', notUnderstoodMessage);
        }, 600);
      }
      return;
    }

    const currentKey = steps[formStep].key;
    const updatedData = { ...formData, [currentKey]: userMessage };
    setFormData(updatedData);

    if (formStep < steps.length - 1 && currentKey !== 'date' && currentKey !== 'time') {
      setTimeout(() => {
        addMessage('bot', steps[formStep + 1].question);
        setFormStep(formStep + 1);
        if (steps[formStep + 1].key === 'date') {
          setShowCalendar(true);
        } else {
          setShowCalendar(false);
        }
      }, 600);
    } else if (currentKey === 'time') {
      setTimeout(() => {
        addMessage('bot', `¡Genial, ${updatedData.name}! Tu cita para ${updatedData.service} ha sido agendada para el ${formatFriendlyDate(updatedData.date)} a las ${updatedData.time}. ¡Te esperamos!`);
        
        setTimeout(() => {
          addMessage('bot', `Queremos recordarte que, si necesitas cancelar o modificar tu cita, por favor, avísanos con al menos 24 horas de anticipación. ¡Así podemos organizar la agenda y ofrecerle el espacio a otro cliente! 😉`);
        }, 1000);

        console.log('📤 Enviando al webhook:', updatedData);
        sendEmailNotification(updatedData);

        setTimeout(() => {
          addMessage('bot', '¡Tu solicitud ha sido enviada con éxito! Pronto nos comunicaremos contigo para confirmar los detalles. ¡Gracias por elegir Medina Barber! 💈 ¿Hay algo más en lo que pueda ayudarte hoy?');
          setFormStep(0);
          setFormData({ name: '', email: '', phone: '', service: '', date: '', time: '' });
          setIsConsulting(false);
          setHasWelcomeMessageBeenShown(false);
        }, 2000);
      }, 600);
    }
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (!newState) {
      localStorage.setItem('chatbotClosed', 'true');
    } else {
      localStorage.removeItem('chatbotClosed');
    }
  };

  const handleDateSelect = (date) => {
    const selectedDateISO = date.toISOString().slice(0, 10);
    const friendlyDate = formatFriendlyDate(selectedDateISO);
    const dayOfWeekNumber = date.getDay();

    addMessage('user', friendlyDate);
    setFormData({ ...formData, date: selectedDateISO });
    
    setTimeout(() => {
      if (dayOfWeekNumber === 0) {
        addMessage('bot', `Disculpa, no abrimos los domingos. Por favor, selecciona otro día de la semana para agendar tu cita.`);
        setShowCalendar(true);
        return;
      }

      const availableTimes = suggestAvailableTimes(selectedDateISO);
      let botResponse = '';

      if (availableTimes.length > 0) {
        botResponse = `¡Excelente! Para el ${friendlyDate}, \ntenemos disponibilidad en los siguientes horarios: ${availableTimes.join(', ')}. \n¿Cuál te gustaría reservar?`;
        addMessage('bot', botResponse);
        setFormStep(formStep + 1);
        setShowCalendar(false);
      } else {
        botResponse = `Lo siento, para el ${friendlyDate} ya estamos full. ¿Te gustaría agendar para otra fecha? Por favor, selecciona otra fecha en el calendario.`;
        addMessage('bot', botResponse);
        setShowCalendar(true);
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
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chatbot-input">
              {formStep === 5 && showCalendar ? (
                <div className="calendar-wrapper">
                    <Calendar
                        onChange={handleDateSelect}
                        value={new Date()}
                        minDate={new Date()}
                        locale="es-ES"
                    />
                </div>
              ) : (
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  disabled={formStep === 5 && showCalendar}
                />
              )}
              <button type="submit" disabled={formStep === 5 && showCalendar} className="send-button">
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;