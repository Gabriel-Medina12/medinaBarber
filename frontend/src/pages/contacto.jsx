import React, { useState } from "react";
import { Link } from "react-router-dom";
import img1 from '../assets/img/Logo Medina Barber.png';
import api from "../api";

const Contacto = () => {
    document.title = 'Contacto | Medina Barber';
    
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        asunto: '',
        mensaje: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const response = await api.post('/contacto', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                setMessage({ 
                    text: 'Mensaje enviado correctamente. Te hemos enviado una confirmación por correo.', 
                    type: 'success' 
                });
                
                // Limpiar el formulario
                setFormData({
                    nombre: '',
                    correo: '',
                    asunto: '',
                    mensaje: ''
                });
            } else {
                setMessage({ 
                    text: response.data.message || 'Error al enviar el mensaje. Por favor, intenta nuevamente.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Error al enviar el mensaje. Por favor, intenta nuevamente.';
            
            setMessage({ 
                text: errorMessage, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };
    
    return(
        <>
            <div className="navbarCorto-subpages">
                <div className="logo-MB logo">
                    <Link to="/"><img src={img1} alt="Logo Medina Barber"/></Link>
                </div>
                <div className="navBar-Corto">
                    <Link to="/" className="enlace-Home nav-corto">Inicio</Link> 
                    <p className="enlace-Contacto">|</p> 
                    <Link to="/pages/contacto" className="enlace-Contacto nav-corto">Contacto</Link>
                </div>
            </div>
            <section className="titulos">
                <h2>Contacto</h2>
                <hr />
            </section>
            <div className="contact-container">
                <div className="contact-info">
                    <div className="contact-item">
                        <strong><ion-icon name="logo-instagram" className='contact-icon'></ion-icon>Instagram:</strong>
                        <Link to="https://www.instagram.com/medinabarber9/" className="contact-link" target="_blank">@medinabarber9</Link>
                    </div>
                    <div className="contact-item">
                        <strong><ion-icon name="logo-whatsapp" className='contact-icon'></ion-icon>WhatsApp:</strong>
                        <p className="contact-text">0426-1178859</p>
                    </div>
                    <div className="contact-item">
                        <strong><ion-icon name="call" className='contact-icon'></ion-icon>Teléfono:</strong> 
                        <p className="contact-text">0426-1178859</p>
                    </div>
                    <div className="contact-item">
                        <strong><ion-icon name="mail" className='contact-icon'></ion-icon>Correo:</strong>
                        <p className="contact-text">medinabarber1@gmail.com</p>
                    </div>
                </div>
                
                <form className="contact-form" onSubmit={handleSubmit}>
                    <label className="form-label">
                        Tu nombre *
                        <input 
                            type="text" 
                            name="nombre" 
                            className="form-input" 
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="form-label">
                        Tu correo electrónico *
                        <input 
                            type="email" 
                            name="correo" 
                            className="form-input" 
                            value={formData.correo}
                            onChange={handleChange}
                            required 
                        />
                    </label>
                    <label className="form-label">
                        Asunto *
                        <input 
                            type="text" 
                            name="asunto" 
                            className="form-input" 
                            value={formData.asunto}
                            onChange={handleChange}
                            required 
                        />
                    </label>
                    <label className="form-label">
                        Tu mensaje *
                        <textarea 
                            name="mensaje" 
                            className="form-textarea" 
                            rows="4" 
                            value={formData.mensaje}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </label>
                    <button 
                        type="submit" 
                        className="form-button"
                        disabled={loading}
                    >
                        {loading ? 'ENVIANDO...' : 'ENVIAR'}
                    </button>
                    
                    {/* Mensaje de éxito/error ahora está dentro del formulario, después del botón */}
                    {message.text && (
                        <div className={`form-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default Contacto;