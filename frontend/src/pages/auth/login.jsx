const Login = () =>{

    return(

        <>
            <section className="titulo-cuenta">
                <h1>Mi Cuenta</h1>
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
                                <input type="text" name="" className="input"/>
                            </div>
                        </div>
                        <div className="login-password">
                            <div>
                                <span>
                                    Contraseña *
                                </span>
                            </div>
                            <div>
                                <input type="password" name="" className="input" />
                            </div>
                        </div>
                        <div>
                            <a href="/pages/auth/forgotPassword">Olvido su contraseña?</a>
                        </div>
                        <div>
                            <span>Recuérdame <input type="checkbox" name="" id="" /></span>
                        </div>
                        <div className="iniciarSesion">
                            <button type="submit" >Iniciar Sesión</button>
                        </div>
                        <div>
                            <p>Tu privacidad es importante para nosotros. Usaremos tus datos para que tu experiencia en el sitio sea aún mejor, para que puedes acceder a tu cuenta sin problemas y para otros fines que te explicamos en nuestra Política de privacidad</p>
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
                                <input type="email" name="" id="" className="input"/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Nombre completo *</span>
                            </div>
                            <div>
                                <input type="text" name="" id="" className="input"/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Nombre de usuario *</span>
                            </div>
                            <div>
                                <input type="text" name="" id="" className="input"/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Contraseña *</span>
                            </div>
                            <div>
                                <input type="password" name="" id="" className="input"/>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Confirmar contraseña *</span>
                            </div>
                            <div>
                                <input type="password" name="" id="" className="input"/>
                            </div>
                        </div>
                        <button type="submit">Enviar</button>
                    </div>
                </div>
            </div>
        </>

    );
};
export default Login