const NavBar = ()=>{
    return(
        <nav className="navBar">
            <a href="/" className="nav">Inicio</a>
            <a href="/#servicios" className="nav">Servicios</a>
            <a href="/#siguenos" className="nav">Síguenos</a>
            <a href="/pages/contacto" className="nav">Contacto</a>
            <a href="#" className="agendarCita">Agendar Cita</a>
        </nav>
    )
}

export default NavBar