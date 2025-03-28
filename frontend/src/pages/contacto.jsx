import React from "react";
import { Link } from "react-router-dom";

const Contacto = () => {
    return(
        <>
            <div className="navbarCorto-subpages">
                <div className="logo-MB logo">
                    <Link to="/"><img src="../src/assets/img/LogoMedinaBarber.PNG" alt="Logo Medina Barber"/></Link>
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
                        <Link to="https://www.instagram.com/medinabarber9/" className="contact-link">@medinabarber9</Link>
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
                        <p className="contact-text">medinabarber@gmail.com</p>
                    </div>
                </div>
                <form className="contact-form">
                    <label className="form-label">
                        Tu nombre *
                        <input type="text" name="nombre" className="form-input" required/>
                    </label>
                    <label className="form-label">
                        Tu correo electrónico *
                        <input type="email" name="correo" className="form-input" required />
                    </label>
                    <label className="form-label">
                        Asunto *
                        <input type="text" name="asunto" className="form-input" required />
                    </label>
                    <label className="form-label">
                        Tu mensaje *
                        <textarea name="mensaje" className="form-textarea" rows="4" required></textarea>
                    </label>
                    <button type="submit" className="form-button">ENVIAR</button>
                </form>
            </div>
        </>
    );
};

export default Contacto;