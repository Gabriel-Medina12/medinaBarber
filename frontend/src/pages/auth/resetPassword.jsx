import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  document.title = 'Restablecer Contraseña | Medina Barber';
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }
    
    // Validar longitud mínima
    if (formData.password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
        console.log("Enviando solicitud con token:", token);
        const response = await axios.post(
          `http://localhost:3000/api/users/reset-password/${token}`, 
          { password: formData.password }
        );
        
        console.log("Respuesta recibida:", response.data);
        
        if (response.data.success) {
          setIsSuccess(true);
          setMessage(response.data.message);
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate("/pages/auth/login");
          }, 3000);
        }
    } catch (error) {
        console.error("Error completo:", error);
        setIsSuccess(false);
        if (error.response?.status === 400) {
          setIsTokenValid(false);
        }
        setMessage(error.response?.data?.message || "Ocurrió un error al restablecer tu contraseña");
      }
  };

  return (
    <div className="reset-password-page">
      <section className="titulos">
        <h2>Restablecer Contraseña</h2>
        <hr />
      </section>
      
      <div className="reset-container">
        {!isTokenValid ? (
          <div className="invalid-token">
            <h3>Enlace inválido o expirado</h3>
            <p>El enlace que has utilizado no es válido o ha expirado.</p>
            <p>Por favor, solicita un nuevo enlace para restablecer tu contraseña.</p>
            <Link to="/pages/auth/forgotPassword" className="request-new-link">Solicitar nuevo enlace</Link>
          </div>
        ) : !isSuccess ? (
          <>
            <p className="reset-description">
              Ingresa tu nueva contraseña a continuación.
            </p>
            
            <form className="reset-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password" className="reset-label">Nueva contraseña *</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="reset-input"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="reset-label">Confirmar contraseña *</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="reset-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              {message && (
                <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
              
              <div className="reset-submit">
                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={isLoading}
                >
                  {isLoading ? "Procesando..." : "Cambiar contraseña"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="success-message">
            <h3>¡Contraseña actualizada!</h3>
            <p>{message}</p>
            <p>Serás redirigido a la página de inicio de sesión en unos segundos...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;