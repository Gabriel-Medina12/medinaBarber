


const ForgotPassword = ()=>{

    return(
        <>
            <section className="titulos-forgot">
                <h2>Mi Cuenta</h2>
                <hr />
            </section>
            <div className="forgot-container">
                <p>¿Necesitas restablecer tu contraseña? Simplemente escribe tu nombre de usuario o correo electrónico y te guiaremos a través del proceso para que puedas crear una nueva contraseña y volver a acceder a tu cuenta.</p>
                <div className="forgot-form">
                    <div className="forgot-span">
                        <span>Correo electronico *</span>
                    </div>
                    <input type="email" name="forgot-password" id="" className="input"/>
                </div>
                <div className="forgot-submit">
                    <button type="submit">Enviar</button>
                </div>
            </div>
        </>
    )

}
export default ForgotPassword