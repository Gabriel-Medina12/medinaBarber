const Contacto = ()=>{
    return(
        <>
            <section className="titulos">
                <h1>Contacto</h1>
                <hr />
            </section>
            <div className="contact-container">
                <div className="contact-info">
                    <p><strong>Instagram:</strong> @medinabarber9</p>
                    <p><strong>WhatsApp:</strong> 0426-1178859</p>
                    <p><strong>Teléfono:</strong> 0426-1178859</p>
                    <p><strong>Correo:</strong> medinabarber@gmail.com</p>
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