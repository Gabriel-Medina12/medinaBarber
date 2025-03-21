import CalendarioCitas from "../components/CalendarioCitas"


function Agendar() {
  return (
    <div className="app">
        <div className="navbarCorto-subpages">
                <div className="logo-MB logo">
                    <a href="/"><img src="../src/assets/img/LogoMedinaBarber.PNG" alt=""/></a>
                </div>
                <div className="navBar-Corto">
                    <a href="/" className="enlace-Home nav-corto">Inicio</a> <p className="enlace-Contacto">|</p> <a href="/pages/agendar" className="enlace-Contacto nav-corto">Agendar</a>
                </div>
            </div>
        <div>
            <div className="titulos">
                <h2>Agendar</h2>
                <hr />
            </div>
            <CalendarioCitas />
        </div>
    </div>
  )
}

export default Agendar