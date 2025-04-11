

const Footer = () =>{

    return(
        <>
            <footer className="forgot-footer">
                <div className="footer-content">
                  <p>© {new Date().getFullYear()} Medina Barber. Todos los derechos reservados. </p>
                  {/* <div className="footer-links">
                    <Link to="/pages/terminos">Términos y condiciones</Link>
                    <Link to="/pages/privacidad">Política de privacidad</Link>
                  </div> */}
                </div>
            </footer>
        </>
    )

} 

export default Footer