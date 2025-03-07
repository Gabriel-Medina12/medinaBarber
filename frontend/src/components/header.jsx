const Header = ()=>{

    return(
        <div className="header">
            <div className="textHeader">
                <p>Síguenos en: <ion-icon name="logo-instagram" className='iconInstagram'></ion-icon> 
                    <a href="https://www.instagram.com/medinabarber9/"> @medinabarber9</a>
                </p>
            </div>
            <div className="linkInicio">
                <a href="/pages/auth/login"><ion-icon name="person" className='person'></ion-icon></a>
            </div>
        </div>
    )
}

export default Header