import { useState } from 'react';
import { Link } from 'react-router-dom';
import img1 from '../assets/img/Logo Medina Barber.png';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navBar">
      <div className="logo-MB">
        <Link to="/">
          <img src={img1} alt="Logo Medina Barber" />
        </Link>
      </div>
      
      {/* Botón Hamburguesa - Solo visible en móvil */}
      <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      {/* Menú de Navegación - Versión Desktop */}
      <div className="desktop-menu">
        <a href="/" className="nav">Inicio</a>
        <a href="/#servicios" className="nav">Servicios</a>
        {/* <a href="/#siguenos" className="nav siguenos-home">Síguenos</a> */}
        <Link to="/pages/contacto" className="nav">Contacto</Link>
        <Link to="/pages/agendar" className="agendarCita">Agendar Cita</Link>
      </div>
      
      {/* Menú de Navegación - Versión Móvil */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-container">
          <a href="/" className="nav mobile-nav-item" onClick={() => setIsOpen(false)}>
            Inicio
            <hr className="menu-divider" />
          </a>
          <a href="/#servicios" className="nav mobile-nav-item" onClick={() => setIsOpen(false)}>
            Servicios
            <hr className="menu-divider" />
          </a>
          <a href="/#siguenos" className="nav mobile-nav-item" onClick={() => setIsOpen(false)}>
            Síguenos
            <hr className="menu-divider" />
          </a>
          <Link to="/pages/contacto" className="nav mobile-nav-item" onClick={() => setIsOpen(false)}>
            Contacto
            <hr className="menu-divider" />
          </Link>
          <Link to="/pages/agendar" className="agendarCita mobile-agendar" onClick={() => setIsOpen(false)}>
            Agendar Cita
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;