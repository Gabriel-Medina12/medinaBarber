


import { Link } from "react-router-dom";

const ForgotPassword = () => {
  document.title = 'Recuperar Contraseña | Medina Barber'

  return (
    <div className="forgot-password-page">
      <section className="titulos-forgot">
        <h2>Mi Cuenta</h2>
        <hr />
      </section>
      
      <div className="forgot-container">
        <p className="forgot-description">
          ¿Necesitas restablecer tu contraseña? Simplemente escribe tu nombre de usuario o correo electrónico y te guiaremos a través del proceso para que puedas crear una nueva contraseña y volver a acceder a tu cuenta.
        </p>
        
        <form className="forgot-form">
          <div className="form-group">
            <label htmlFor="email" className="forgot-label">Correo electrónico *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="forgot-input"
              required 
            />
          </div>
          
          <div className="forgot-submit">
            <button type="submit" className="submit-button">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword