const NavBar = ()=>{
    return(
        <nav className="navBar">
            <a href="/">Inicio</a>
            <a href="#">Servicios</a>
            <a href="#">Contacto</a>
            <a href="#">Síguenos</a>
            <a href="/pages/auth/login" className="agendarCita">Agendar Cita</a>
        </nav>
    )
}

export default NavBar