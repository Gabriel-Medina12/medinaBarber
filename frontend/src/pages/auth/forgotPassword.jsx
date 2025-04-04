import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  document.title = 'Recuperar Contraseña | Medina Barber';
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    try {
      const response = await axios.post('http://localhost:3000/api/users/forgot-password', { email });
      
      if (response.data.success) {
        setIsSuccess(true);
        setMessage(response.data.message);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "Ocurrió un error al procesar tu solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <section className="titulos-forgot">
        <h2>Mi Cuenta</h2>
        <hr />
      </section>
      
      <div className="forgot-container">
        {!isSuccess ? (
          <>
            <p className="forgot-description">
              ¿Necesitas restablecer tu contraseña? Simplemente escribe tu correo electrónico y te guiaremos a través del proceso para que puedas crear una nueva contraseña y volver a acceder a tu cuenta.
            </p>
            
            <form className="forgot-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="forgot-label">Correo electrónico *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="forgot-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              
              {message && (
                <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
              
              <div className="forgot-submit">
                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="success-message">
            <h3>Correo enviado</h3>
            <p>{message}</p>
            <p>Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
            <Link to="/pages/auth/login" className="back-to-login">Volver al inicio de sesión</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;