const ForgotPassword = ()=>{

    return(
        <>
            <section className="titulo-cuenta">
                <h2>Mi Cuenta</h2>
                <hr />
            </section>
            <div className="forgot-container">
                <p>¿Necesitas restablecer tu contraseña? Simplemente escribe tu nombre de usuario o correo electrónico y te guiaremos a través del proceso para que puedas crear una nueva contraseña y volver a acceder a tu cuenta.</p>
                <div className="forgot-form">
                    <span>Correo electronico *</span>
                    <input type="email" name="forgot-password" id="" />
                </div>
                <button type="submit">Enviar</button>
            </div>
        </>
    )

}
export default ForgotPassword