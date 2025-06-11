import React, { useState, useEffect, useRef } from 'react';
import '../ChatbotWidget.css';

// Funciones de respaldo para cuando no está disponible el servicio de notificaciones
const sendEmailNotification = (data) => {
  console.log('Simulando envío de email:', data);
  // En producción, aquí se conectaría con un servicio real de emails
};

const sendWhatsAppNotification = (data) => {
  console.log('Simulando envío de WhatsApp:', data);
  // En producción, aquí se conectaría con un servicio real de WhatsApp
};

// Descomenta esta línea si tienes el archivo notificationService.js configurado
// import { sendEmailNotification, sendWhatsAppNotification } from './notificationService';

function ChatbotWidget({ onOpenAppointmentModal, autoOpen = true, autoOpenDelay = 3000 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationStep, setConversationStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const messagesEndRef = useRef(null);
  const [visibleDatesCount, setVisibleDatesCount] = useState(10);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  
  // SOLUCIÓN: Almacenar los horarios disponibles por fecha para mantener consistencia
  const [availableTimesByDate, setAvailableTimesByDate] = useState({});

  // Servicios y precios
  const services = {
    'Corte de cabello': 5,
    'Arreglo de barba': 3,
    'Corte + barba': 7,
    'Tratamiento de barba': 2,
    'Corte + barba + refrigerio': 9,
    'Corte + barba + masaje': 12,
    'Corte + refrigerio': 7
  };

  // Preguntas frecuentes
  const faqs = [
    {
      question: "¿Cuál es el horario de atención?",
      answer: "Nuestro horario es de lunes a sábado de 9:00 AM a 7:00 PM."
    },
    {
      question: "¿Necesito cita previa?",
      answer: "Recomendamos agendar cita para garantizar atención inmediata, pero también aceptamos clientes sin cita previa según disponibilidad."
    },
    {
      question: "¿Cuáles son los métodos de pago?",
      answer: "Aceptamos efectivo, tarjetas de crédito/débito, transferencias y pagos móviles."
    },
    {
      question: "¿Ofrecen servicios a domicilio?",
      answer: "Por el momento, todos nuestros servicios son exclusivamente en nuestra barbería."
    }
  ];

  // Información de ubicación y contacto
  const locationInfo = {
    address: "Caracas / VE",
    phone: "+584122911866",
    email: "medinabarber1@gmail.com"
  };

  // Helper para desplazamiento automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-apertura del chatbot después de un tiempo
  useEffect(() => {
    if (autoOpen && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, autoOpenDelay);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, isOpen, autoOpenDelay]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addMessage('bot', '¡Hola! Soy tu asistente de Medina Barber. ¿Cómo te llamas?');
      }, 500);
    }
  }, [isOpen, messages.length]);

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

  // Función para manejar la confirmación de cita
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
    
    // Crear objeto con datos de la cita
    const appointmentData = {
      date: dateToUse,
      time: selectedTime,
      service: selectedService,
      userName: userName,
      userEmail: userEmail,
      userPhone: userPhone
    };
    
    try {
      // Enviar notificaciones
      sendEmailNotification({
        to: userEmail,
        subject: "Confirmación de cita - Medina Barber",
        body: `Hola ${userName}, tu cita para ${selectedService} ha sido confirmada para el ${formatDateForUser(dateToUse)} a las ${selectedTime}.`
      });
      
      sendEmailNotification({
        to: "admin@medinabarber.com",
        subject: "Nueva cita agendada",
        body: `Nueva cita: ${userName} (${userEmail}, ${userPhone}) ha agendado ${selectedService} para el ${formatDateForUser(dateToUse)} a las ${selectedTime}.`
      });
      
      sendWhatsAppNotification({
        to: "+1234567890", // Número del administrador
        message: `Nueva cita: ${userName} ha agendado ${selectedService} para el ${formatDateForUser(dateToUse)} a las ${selectedTime}.`
      });
    } catch (error) {
      console.error('Error al enviar notificaciones:', error);
      // No interrumpir el flujo si las notificaciones fallan
    }
    
    // Guardar en el sistema y abrir modal si es necesario
    if (onOpenAppointmentModal) {
      onOpenAppointmentModal(appointmentData);
    }
  };

  // Función para parsear fechas
  const parseUserDate = (userInput) => {
    if (!userInput) return null;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const input = userInput.toLowerCase().trim();
    
    // Caso especial: "ver más"
    if (input === 'ver más') {
      return 'ver_mas';
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

  // Generar fechas disponibles
  const generateAvailableDates = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 3);
    const available = {};
    
    // Generar fechas para los próximos 3 meses
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Excluir domingos
      if (d.getDay() !== 0) {
        // Formato DD/MM para consistencia
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const dateKey = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}`;
        available[dateKey] = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
      }
    }
    
    // Limitar según visibleDatesCount
    return Object.fromEntries(
      Object.entries(available).slice(0, visibleDatesCount)
    );
  };

  // SOLUCIÓN: Función mejorada para obtener horarios disponibles de manera consistente
  const getAvailableTimes = (date) => {
    if (!date) return [];
    
    // Crear una clave única para la fecha
    const dateKey = date instanceof Date 
      ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      : String(date);
    
    // Si ya tenemos horarios generados para esta fecha, usarlos
    if (availableTimesByDate[dateKey]) {
      return availableTimesByDate[dateKey];
    }
    
    // Si no, generar nuevos horarios (fijos, no aleatorios)
    const allTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
    
    // En una implementación real, esto vendría de una API o base de datos
    // Para este ejemplo, usamos un patrón fijo basado en el día de la semana para simular disponibilidad
    const dateObj = date instanceof Date ? date : new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = domingo, 1 = lunes, etc.
    
    // Seleccionar horarios basados en el día de la semana (para que sea determinista)
    let availableTimes;
    switch (dayOfWeek) {
      case 1: // Lunes
        availableTimes = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];
        break;
      case 2: // Martes
        availableTimes = ['10:00 AM', '12:00 PM', '3:00 PM', '5:00 PM'];
        break;
      case 3: // Miércoles
        availableTimes = ['9:00 AM', '10:00 AM', '2:00 PM', '4:00 PM'];
        break;
      case 4: // Jueves
        availableTimes = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];
        break;
      case 5: // Viernes
        availableTimes = ['9:00 AM', '11:00 AM', '3:00 PM', '5:00 PM'];
        break;
      case 6: // Sábado
        availableTimes = ['10:00 AM', '12:00 PM', '2:00 PM'];
        break;
      default:
        availableTimes = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
    }
    
    // Almacenar los horarios generados para esta fecha
    setAvailableTimesByDate(prev => ({
      ...prev,
      [dateKey]: availableTimes
    }));
    
    return availableTimes;
  };

  // Formatear fecha para mostrar al usuario
  const formatDateForUser = (date) => {
    if (!date) return "Fecha no seleccionada";
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Fecha inválida";
      }
      
      return dateObj.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error al formatear fecha";
    }
  };

  // Validar formato de email
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validar formato de teléfono
  const isValidPhone = (phone) => {
    const re = /^\+?[0-9]{8,15}$/;
    return re.test(phone);
  };

  // Mostrar preguntas frecuentes
  const showFAQs = () => {
    let faqText = "📋 Preguntas Frecuentes:\n\n";
    faqs.forEach((faq, index) => {
      faqText += `${index + 1}. ${faq.question}\n${faq.answer}\n\n`;
    });
    faqText += "¿En qué más puedo ayudarte?";
    addMessage('bot', faqText);
    setShowFAQ(false);
  };

  // Mostrar servicios
  const showServicesList = () => {
    let servicesText = "💈 Nuestros servicios:\n\n";
    Object.entries(services).forEach(([service, price]) => {
      servicesText += `• ${service}: $${price}\n`;
    });
    servicesText += "\n¿Te gustaría agendar una cita para alguno de estos servicios?";
    addMessage('bot', servicesText);
    setShowServices(false);
  };

  // Mostrar ubicación y contacto
  const showLocationInfo = () => {
    let locationText = "📍 Ubicación y Contacto:\n\n";
    locationText += `Dirección: ${locationInfo.address}\n`;
    locationText += `Teléfono: ${locationInfo.phone}\n`;
    locationText += `Email: ${locationInfo.email}\n`;
    locationText += "¿En qué más puedo ayudarte?";
    addMessage('bot', locationText);
    setShowLocation(false);
  };

  // Procesamiento de respuestas
  const processBotResponse = (userMessage) => {
    let botResponse = '';
    let nextStep = conversationStep;
    
    // Verificar si se solicitan FAQs, servicios o ubicación en cualquier momento
    if (/pregunta|duda|faq/i.test(userMessage)) {
      setShowFAQ(true);
      showFAQs();
      return;
    } else if (/servicio|precio|costo|valor/i.test(userMessage) && conversationStep !== 3) {
      setShowServices(true);
      showServicesList();
      return;
    } else if (/ubicación|ubicacion|dirección|direccion|donde|dónde|contacto|teléfono|telefono/i.test(userMessage)) {
      setShowLocation(true);
      showLocationInfo();
      return;
    }
    
    switch (conversationStep) {
      case 0: // Paso 0: Pedir nombre
        setUserName(userMessage);
        botResponse = `¡Hola, ${userMessage}! Soy el asistente virtual de Medina Barber. ¿En qué puedo ayudarte hoy?\n\n• Agendar cita\n• Ver servicios\n• Preguntas frecuentes\n• Ubicación y contacto`;
        nextStep = 1;
        break;
        
      case 1: // Paso 1: Menú principal
        if (/agendar|cita|reserva|reservar/i.test(userMessage)) {
          // Generar fechas disponibles con formato consistente
          const availableDates = generateAvailableDates();
          botResponse = `📅 Selecciona una fecha disponible hasta ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}:\n\n${
            Object.keys(availableDates).map(date => `• ${date}`).join('\n')
          }\n\nO escribe "ver más" para cargar próximas fechas.`;
          nextStep = 2;
        } 
        else if (/servicio|precio/i.test(userMessage)) {
          showServicesList();
          nextStep = 1;
        }
        else if (/pregunta|duda|faq/i.test(userMessage)) {
          showFAQs();
          nextStep = 1;
        }
        else if (/ubicación|ubicacion|dirección|direccion|donde|dónde|contacto/i.test(userMessage)) {
          showLocationInfo();
          nextStep = 1;
        }
        else if (/horario|hora/i.test(userMessage)) {
          // Mostrar todas las fechas disponibles con sus horarios
          const availableDates = generateAvailableDates();
          botResponse = `⏰ Horarios disponibles:\n${
            Object.entries(availableDates)
              .slice(0, 5) // Limitar a 5 fechas para no saturar
              .map(([date, slots]) => `• ${date}: ${slots.join(', ')}`)
              .join('\n')
          }\n\n¿Quieres agendar una cita?`;
          nextStep = 1;
        }
        else {
          botResponse = 'No entendí. Por favor elige una opción:\n\n• Agendar cita\n• Ver servicios\n• Preguntas frecuentes\n• Ubicación y contacto';
          nextStep = 1;
        }
        break;
        
      case 2: // Selección de fecha
        // Manejar específicamente el caso "ver más"
        if (userMessage.toLowerCase().trim() === 'ver más') {
          setVisibleDatesCount(prev => prev + 10);
          const availableDates = generateAvailableDates();
          botResponse = `📅 Más fechas disponibles:\n\n${
            Object.keys(availableDates).map(date => `• ${date}`).join('\n')
          }\n\n¿Qué día prefieres? (O escribe "ver más" para continuar)`;
          nextStep = 2;
          break;
        }
        
        const parsedDate = parseUserDate(userMessage);
        
        // Si es un valor especial "ver_mas", ya lo manejamos arriba
        if (parsedDate === 'ver_mas') {
          break;
        }
        
        if (parsedDate) {
          setSelectedDate(parsedDate);
          const formattedDate = formatDateForUser(parsedDate);
          
          // SOLUCIÓN: Usar la función mejorada para obtener horarios consistentes
          const availableTimes = getAvailableTimes(parsedDate);
          
          botResponse = `🗓️ Has seleccionado ${formattedDate}. Estos son los horarios disponibles:\n\n${
            availableTimes.map(time => `• ${time}`).join('\n')
          }\n\n¿Qué horario prefieres?`;
          nextStep = 2.5; // Nuevo paso para selección de horario
        } else {
          botResponse = '❌ No entendí la fecha. Por favor, usa:\n• "03/06"\n• "mañana"\n• "3 de junio"\n• O escribe "ver más" para más fechas';
          nextStep = 2;
        }
        break;
        
      case 2.5: // Selección de horario
        // SOLUCIÓN: Usar los horarios almacenados para la fecha seleccionada
        const availableTimes = getAvailableTimes(selectedDate);
        
        // Verificar si el horario proporcionado está en la lista de disponibles
        // Usamos una comparación flexible para permitir variaciones en el formato
        const selectedTimeMatch = availableTimes.find(time => 
          time.toLowerCase().replace(/\s+/g, '') === userMessage.toLowerCase().replace(/\s+/g, '') ||
          time.toLowerCase().includes(userMessage.toLowerCase())
        );
        
        if (selectedTimeMatch) {
          setSelectedTime(selectedTimeMatch);
          botResponse = `⏰ Has seleccionado las ${selectedTimeMatch}. ¿Qué servicio deseas?\n\n${
            Object.keys(services).map(service => `• ${service}`).join('\n')
          }`;
          nextStep = 3;
        } else {
          botResponse = `❌ Horario no válido. Por favor selecciona uno de los siguientes:\n\n${
            availableTimes.map(time => `• ${time}`).join('\n')
          }`;
          nextStep = 2.5;
        }
        break;
        
      case 3: // Selección de servicio
        const serviceKey = Object.keys(services).find(service => 
          userMessage.toLowerCase().includes(service.toLowerCase())
        );
        
        if (serviceKey) {
          setSelectedService(serviceKey);
          botResponse = "📧 Por favor, proporciona tu correo electrónico para enviarte la confirmación:";
          nextStep = 3.5; // Nuevo paso para solicitar email
        } else {
          botResponse = '❌ Servicio no válido. Elige uno:\n\n' + Object.keys(services).map(s => `• ${s}`).join('\n');
          nextStep = 3;
        }
        break;
        
      case 3.5: // Solicitar email
        if (isValidEmail(userMessage)) {
          setUserEmail(userMessage);
          botResponse = "📱 Por favor, proporciona tu número de teléfono para contactarte:";
          nextStep = 3.7; // Nuevo paso para solicitar teléfono
        } else {
          botResponse = "❌ El formato del correo electrónico no es válido. Por favor, intenta nuevamente:";
          nextStep = 3.5;
        }
        break;
        
      case 3.7: // Solicitar teléfono
        if (isValidPhone(userMessage)) {
          setUserPhone(userMessage);
          
          // Asegurarse de que selectedDate sea un objeto Date válido para formatear
          let dateDisplay = "Fecha no seleccionada";
          if (selectedDate) {
            try {
              const dateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
              if (!isNaN(dateObj.getTime())) {
                dateDisplay = formatDateForUser(dateObj);
              }
            } catch (error) {
              console.error("Error al formatear fecha:", error);
            }
          }
          
          botResponse = `📋 Resumen de cita:\n\n• Nombre: ${userName}\n• Email: ${userEmail}\n• Teléfono: ${userPhone}\n• Fecha: ${dateDisplay}\n• Hora: ${selectedTime}\n• Servicio: ${selectedService} ($${services[selectedService]})\n\n¿Confirmar? (Sí/No)`;
          nextStep = 5;
        } else {
          botResponse = "❌ El formato del número de teléfono no es válido. Por favor, intenta nuevamente:";
          nextStep = 3.7;
        }
        break;
        
      case 4: // Paso 4: Upselling
        if (/s[iíí]/i.test(userMessage)) {
          setSelectedService(prev => `${prev} + tratamiento de barba`);
          botResponse = '✨ ¡Tratamiento añadido! Total: $' + (services[selectedService] + 2);
        } else {
          botResponse = '✅ Servicio confirmado: ' + selectedService;
        }
        nextStep = 5;
        break;
        
      case 5: // Confirmación final
        if (/s[iíí]/i.test(userMessage)) {
          botResponse = '✅ ¡Cita agendada con éxito! Te hemos enviado un correo con los detalles de tu cita.\n\nRecibirás un recordatorio 24 horas antes de tu cita.\n\n¿Necesitas algo más? (Sí/No)';
          
          try {
            handleConfirmAppointment(); // Enviar datos y notificaciones
          } catch (error) {
            console.error('Error al confirmar cita:', error);
            // No interrumpir el flujo si hay un error
          }
          
          nextStep = 6;
        } else {
          botResponse = '¿Qué deseas modificar?\n• Fecha y hora\n• Servicio\n• Datos de contacto';
          nextStep = 5.5;
        }
        break;
        
      case 5.5: // Modificación de datos
        if (/fecha|hora|tiempo/i.test(userMessage)) {
          const availableDates = generateAvailableDates();
          botResponse = `📅 Selecciona una nueva fecha:\n\n${
            Object.keys(availableDates).map(date => `• ${date}`).join('\n')
          }\n\nO escribe "ver más" para cargar próximas fechas.`;
          nextStep = 2;
        } 
        else if (/servicio/i.test(userMessage)) {
          botResponse = `💈 Selecciona un nuevo servicio:\n\n${
            Object.keys(services).map(service => `• ${service}`).join('\n')
          }`;
          nextStep = 3;
        }
        else if (/datos|contacto|email|correo|teléfono|telefono/i.test(userMessage)) {
          botResponse = "📧 Por favor, proporciona tu correo electrónico:";
          nextStep = 3.5;
        }
        else {
          botResponse = '❌ No entendí. ¿Qué deseas modificar?\n• Fecha y hora\n• Servicio\n• Datos de contacto';
          nextStep = 5.5;
        }
        break;
        
      case 6: // Cierre
        if (/no/i.test(userMessage)) {
          botResponse = '👋 ¡Gracias por agendar con Medina Barber! El chat se cerrará en 3 segundos.';
          setTimeout(() => setIsOpen(false), 3000);
        } else {
          botResponse = '¿En qué más puedo ayudarte?\n• Agendar nueva cita\n• Ver servicios\n• Preguntas frecuentes\n• Ubicación y contacto';
          nextStep = 1;
        }
        break;
        
      default:
        botResponse = '¿En qué puedo ayudarte?';
        nextStep = 1;
    }
    
    setTimeout(() => {
      addMessage('bot', botResponse);
      setConversationStep(nextStep);
    }, 500);
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
