import React, { useState, useEffect, useRef } from 'react';
import '../ChatbotWidget.css';
import barberGif from '../assets/img/barber-spin.gif';
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

  const steps = [
    { key: 'name', question: '¿Cuál es tu nombre?' },
    { key: 'email', question: '¿Cuál es tu correo electrónico?' },
    { key: 'phone', question: '¿Cuál es tu número de teléfono?' },
    { key: 'service', question: '¿Qué servicio deseas? (Corte de cabello / Barba / Corte y barba)' },
    { key: 'date', question: '¿Para qué fecha deseas la cita? (Ej: 2025-06-15)' },
    { key: 'time', question: '¿A qué hora? (Ej: 15:00)' }
  ];

  useEffect(() => {
    console.log("👁️ Ejecutando autoabrir");
    setIsOpen(true);
    addMessage('bot', steps[0].question);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    const userMessage = input.trim();
    addMessage('user', userMessage);
    const currentKey = steps[formStep].key;
    const updatedData = { ...formData, [currentKey]: userMessage };
    setFormData(updatedData);
    setInput('');

    setTimeout(() => {
      if (formStep < steps.length - 1) {
        addMessage('bot', steps[formStep + 1].question);
        setFormStep(formStep + 1);
      } else {
        addMessage('bot', '¡Gracias! Tu cita ha sido registrada.');
        console.log('📤 Enviando al webhook:', updatedData);
        sendEmailNotification(updatedData);
        setFormStep(0);
        setFormData({ name: '', email: '', phone: '', service: '', date: '', time: '' });
      }
    }, 600);
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (!newState) localStorage.setItem('chatbotClosed', 'true');
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
                alt="Abrir chatbot"
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
                  <div key={index} className={`message ${msg.sender}`}> {/* LÍNEA CORREGIDA */}
                    {msg.text}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chatbot-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu respuesta..."
              />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
