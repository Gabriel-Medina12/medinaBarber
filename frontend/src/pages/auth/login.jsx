import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Auth = ({ setIsAuthenticated, setIsAdmin }) => {
  document.title = 'Login | Medina Barber'
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener información de redirección si existe
  const redirectTo = location.state?.redirectTo || '/pages/perfil';
  
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
  
  // Estado para la verificación de correo
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mostrar mensaje si viene de redirección
  useEffect(() => {
    if (location.state?.message) {
      setLoginMessage(location.state.message);
    }
  }, [location]);

  // Manejador de cambios para el Login
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        localStorage.setItem('token', data.token);
        
        // Verificar si el usuario es administrador
        const isAdmin = data.user && data.user.role === 'admin';
        
        // Guardar el rol en localStorage para mantenerlo entre sesiones
        localStorage.setItem('userRole', data.user.role);
        
        // Actualizar el estado de autenticación
        setIsAuthenticated(true);
        
        // Actualizar el estado de administrador si la función existe
        if (typeof setIsAdmin === 'function') {
          setIsAdmin(isAdmin);
        }
        
        // Redirigir según el rol o a la página que intentaba acceder
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate(redirectTo);
        }
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
        if (data.requiresVerification) {
          setVerificationStep(true);
          setVerificationEmail(data.email);
          setRegisterMessage('Se ha enviado un código de verificación a tu correo electrónico');
        } else {
          setRegisterMessage('Registro exitoso. Ahora inicia sesión para acceder a tu perfil.');
        }
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setRegisterMessage('Error en el registro');
    }
  };

  // Manejador para el cambio del código de verificación
  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  // Envío del código de verificación
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/users/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: verificationEmail,
          verificationCode: verificationCode
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setRegisterMessage(data.message || 'Error al verificar el código');
      } else {
        setVerificationStep(false);
        setRegisterMessage('Verificación exitosa. Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
        
        // Limpiar el formulario de registro
        setRegisterForm({
          email: '',
          fullName: '',
          userName: '',
          password: '',
          confirmPassword: ''
        });
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Error en la verificación:', error);
      setRegisterMessage('Error en la verificación');
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
        <h2 className=''>Mi Cuenta</h2>
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
              <div className="password-input-container">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  className="input"
                  required
                  value={loginForm.password}
                  onChange={handleLoginChange}
                />
                <button 
                  type="button" 
                  className="toggle-password-button"
                  onClick={toggleLoginPasswordVisibility}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
          {!verificationStep ? (
            <>
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
                  <div className="password-input-container">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      className="input"
                      required
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                    />
                    <button 
                      type="button" 
                      className="toggle-password-button"
                      onClick={toggleRegisterPasswordVisibility}
                    >
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirmar contraseña *</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="input"
                      required
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                    />
                    <button 
                      type="button" 
                      className="toggle-password-button"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit">Enviar</button>
                </div>
                {registerMessage && <p className="message">{registerMessage}</p>}
              </form>
            </>
          ) : (
            <>
              <section className="register-titulo">
                <h2>Verificación de Correo</h2>
              </section>
              <form className="register-form" onSubmit={handleVerificationSubmit}>
                <div className="form-group">
                  <label className='code-verification'>Código de verificación *</label>
                  <p className="verification-info">
                    Hemos enviado un código de verificación a {verificationEmail}. 
                    Por favor, revisa tu bandeja de entrada o correos no deseados e ingresa el código a continuación.
                  </p>
                  <input
                    type="text"
                    name="verificationCode"
                    className="input"
                    required
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                    placeholder="Ingresa el código de 6 dígitos"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">Verificar</button>
                </div>
                {registerMessage && <p className="message">{registerMessage}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};      
export default Auth;
                    
