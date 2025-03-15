



const Login = () =>{

    return(

        <>
            <div className="navBar-Corto">
                <a href="/" className="enlace-Home nav-corto">Inicio</a> <p className="enlace-MiCuenta">|</p> <a href="/pages/auth/login" className="enlace-MiCuenta nav-corto">Mi Cuenta</a>
            </div>
            <section className="titulos">
                <h2>Mi Cuenta</h2>
                <hr />
            </section>
            <div className="container-login-register">
                <div className="login-container">
                    <section className="login-titulo">
                        <h2>Iniciar Sesión</h2>
                    </section>
                    <div className="login-form">
                        <div className="login-email">
                            <div>
                                <span>
                                    Nombre de usuario o correo electronico *
                                </span>
                            </div>
                            <div>
                                <input type="text" name="login-email-name" className="input" required/>
                            </div>
                        </div>
                        <div className="login-password">
                            <div>
                                <span>
                                    Contraseña *
                                </span>
                            </div>
                            <div>
                                <input type="password" name="login-password" className="input" required/>
                            </div>
                        </div>
                        <div className="forgot-password">
                            <a href="/pages/auth/forgotPassword">Olvido su contraseña?</a>
                        </div>
                        <div className="recuerdame">
                            <p>Recuérdame</p>
                                <label className="custom-checkbox">
                                    <input name="dummy" type="checkbox" />
                                    <span className="checkmark" />
                                </label>
                            
                        </div>
                        <div className="iniciarSesion">
                            <button type="submit" >Iniciar Sesión</button>
                        </div>
                        <div className="textPriva">
                            <p>Tu privacidad es importante para nosotros. Usaremos tus datos para que tu experiencia en el sitio sea aún mejor, para que puedes acceder a tu cuenta sin problemas y para otros fines que te explicamos en nuestra política de privacidad.</p>
                        </div>
                    </div>
                </div>
                <div className="register-container">
                    <section className="register-titulo">
                        <h2>Registrarse</h2>
                    </section>
                    <div className="register-form">
                        <div>
                            <div>
                                <span>Dirección de correo electronico *</span>
                            </div>
                            <div>
                                <input type="email" name="register-email" id="" className="input" required/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Nombre completo *</span>
                            </div>
                            <div>
                                <input type="text" name="register-nameFull" id="" className="input" required/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Nombre de usuario *</span>
                            </div>
                            <div>
                                <input type="text" name="register-name-usuario" id="" className="input" required/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Contraseña *</span>
                            </div>
                            <div>
                                <input type="password" name="register-password" id="" className="input" required/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Confirmar contraseña *</span>
                            </div>
                            <div>
                                <input type="password" name="register-confimacion-password" id="" className="input" required/>
                            </div>
                        </div>
                        <div className="register-button">
                            <button type="submit">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};
export default Login