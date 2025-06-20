import React, { useState, useEffect, useRef } from 'react';
import '../ChatbotWidget.css';
const sendEmailNotification = (data) => {
fetch('https://hook.us2.make.com/vitopvucvw6efs96tkz8fh8e7ix5qrky', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(data)
})
.then(res => console.log("✅ Webhook enviado a Make"))
.catch(err => console.error("❌ Error al enviar a Make:", err));
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
if (autoOpen && !isOpen) {
const timer = setTimeout(() => {
setIsOpen(true);
addMessage('bot', steps[0].question);
}, autoOpenDelay);
return () => clearTimeout(timer);
}

}, [autoOpen, isOpen, autoOpenDelay]);
useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
sendEmailNotification(updatedData);
setFormStep(0);
setFormData({
name: '',
email: '',
phone: '',
service: '',
date: '',
time: ''
});
}
}, 600);
};
return (
<div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
<button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
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
{msg.text}
</div>
))}
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
)}
</div>
);
}
export default ChatbotWidget;
