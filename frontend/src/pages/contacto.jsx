


const Contacto = ()=>{
    return(
        <>
            <div className="navBar-Corto">
                <a href="/" className="enlace-Home nav-corto">Inicio</a> <p className="enlace-Contacto">|</p> <a href="/pages/contacto" className="enlace-Contacto nav-corto">Contacto</a>
            </div>
            <section className="titulos">
                <h2>Contacto</h2>
                <hr />
            </section>
            <div className="contact-container">
                <div className="contact-info">
                    <div>
                        <strong><ion-icon name="logo-instagram" id='Icons'></ion-icon>Instagram:</strong> <br />
                        <a href="https://www.instagram.com/medinabarber9/">@medinabarber9</a>
                    </div>
                    <div>
                        <strong><ion-icon name="logo-whatsapp" id='Icons' ></ion-icon>WhatsApp:</strong>
                        <p> 0426-1178859</p>
                    </div>
                    <div>
                        <strong><ion-icon name="call" id='Icons'></ion-icon>Teléfono:</strong> 
                        <p>0426-1178859</p>
                    </div>
                    <div>
                        <strong><ion-icon name="mail" id='Icons'></ion-icon>Correo:</strong>
                        <p> medinabarber@gmail.com</p>
                    </div>
                </div>
                <form className="contact-form">
                    <label>
                    Tu nombre *
                    <input type="text" name="nombre" required/>
                    </label>
                    <label>
                    Tu correo electrónico *
                    <input type="email" name="correo" required />
                    </label>
                    <label>
                    Asunto *
                    <input type="text" name="asunto" required />
                    </label>
                    <label>
                    Tu mensaje *
                    <textarea name="mensaje" rows="4" required></textarea>
                    </label>
                    <button type="submit">ENVIAR</button>
                </form>
            </div>
        </>
    )
}

export default Contacto