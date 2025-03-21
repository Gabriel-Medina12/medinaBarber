const NavBar = ()=>{
    return(
        <nav className="navBar">
            <div className="logo-MB">
                <a href="/"><img src="./src/assets/img/LogoMedinaBarber.PNG" alt="" /></a>
            </div>
            <div>
            <a href="/" className="nav">Inicio</a>
            <a href="/#servicios" className="nav">Servicios</a>
            <a href="/#siguenos" className="nav">Síguenos</a>
            <a href="/pages/contacto" className="nav">Contacto</a>
            <a href="/pages/agendar" className="agendarCita">Agendar Cita</a>
            </div>
        </nav>
    )
}

export default NavBar