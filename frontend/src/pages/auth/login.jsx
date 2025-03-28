import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Auth = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  // Estado para el formulario de Login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginMessage, setLoginMessage] = useState('');

  // Estado para el formulario de Registro
  const [registerForm, setRegisterForm] = useState({
    email: '',
    fullName: '',
    userName: '',
    password: '',
    confirmPassword: ''
  });
  const [registerMessage, setRegisterMessage] = useState('');

  // Manejador de cambios para el Login
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Envío del formulario de Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      
      if (!response.ok) {
        setLoginMessage(data.message || 'Error al iniciar sesión');
      } else {
        setLoginMessage('Inicio de sesión exitoso');
        console.log('Token recibido:', data.token);
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        navigate('/pages/perfil');
      }
    } catch (error) {
      console.error('Error en el login:', error);
      setLoginMessage('Error en el inicio de sesión');
    }
  };

  // Manejador de cambios para el Registro
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Envío del formulario de Registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerForm.password.trim() !== registerForm.confirmPassword.trim()) {
      setRegisterMessage('Las contraseñas no coinciden');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerForm)
      });
      const data = await response.json();
      if (!response.ok) {
        setRegisterMessage(data.message || 'Error al registrarse');
      } else {
        setRegisterMessage('Registro exitoso. Ahora inicia sesión para acceder a tu perfil.');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setRegisterMessage('Error en el registro');
    }
  };

  return (
    <>
      <div className="navBar-Corto"> 
        <Link to="/" className="enlace-Home nav-corto">Inicio</Link> 
        <p className="enlace-Contacto">|</p> 
        <Link to="/pages/auth/login" className="enlace-Contacto nav-corto">Mi Cuenta</Link> 
      </div>
      <section className="titulos">
        <h2>Mi Cuenta</h2>
        <hr />
      </section>
      <div className="container-login-register">
        {/* Sección de Login */}
        <div className="login-container">
          <section className="login-titulo">
            <h2>Iniciar Sesión</h2>
          </section>
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Correo electrónico *</label>
              <input
                type="email"
                name="email"
                className="input"
                required
                value={loginForm.email}
                onChange={handleLoginChange}
              />
            </div>
            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="password"
                className="input"
                required
                value={loginForm.password}
                onChange={handleLoginChange}
              />
            </div>
            <div className="forgot-password">
              <Link to="/pages/auth/forgotPassword">¿Olvidó su contraseña?</Link>
            </div>
            <div className="form-actions">
              <button type="submit">Iniciar Sesión</button>
            </div>
            {loginMessage && <p className="message">{loginMessage}</p>}
            <div className='parraf-login'>
              <p className='parraf-log'>Tu privacidad es importante para nosotros. Usaremos tus datos para que tu experiencia en el sitio sea aún mejor, para que puedas acceder a tu cuenta sin problemas y para otros fines que te explicamos en nuestra política de privacidad.</p>

            </div>
          </form>
        </div>
        
        {/* Sección de Registro */}
        <div className="register-container">
          <section className="register-titulo">
            <h2>Registrarse</h2>
          </section>
          <form className="register-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Dirección de correo electrónico *</label>
              <input
                type="email"
                name="email"
                className="input"
                required
                value={registerForm.email}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="form-group">
              <label>Nombre completo *</label>
              <input
                type="text"
                name="fullName"
                className="input"
                required
                value={registerForm.fullName}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="form-group">
              <label>Nombre de usuario *</label>
              <input
                type="text"
                name="userName"
                className="input"
                required
                value={registerForm.userName}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="password"
                className="input"
                required
                value={registerForm.password}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                className="input"
                required
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit">Enviar</button>
            </div>
            {registerMessage && <p className="message">{registerMessage}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default Auth;