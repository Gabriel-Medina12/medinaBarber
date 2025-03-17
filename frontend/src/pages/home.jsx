import NavBar from '../components/NavBar';
import Loader from '../components/loader';
import React from 'react';

const Home = () => {

  return (
    <>
      <Loader/>
      <NavBar/>
      <div className="imgs-fondo-home">
        <img src="./src/assets/img/medinaBarber2.jpeg" alt="" />
        <img src="./src/assets/img/medinaBarber1.jpeg" alt="" />
        <img src="./src/assets/img/medinaBarber3.jpeg" alt="" />
      </div>
      <div className="servicios-bg">
        <section className="titulo-servicios" id='servicios'>
          <h2>Servicios</h2>
          <hr />
        </section>
        <div className="servicios-packs">
          <div>
            <section className="servicios-packs-titulos">
              <h3>Barba</h3>
              <hr />
            </section>
            <p>Alineado de barba o bigote</p>
            <p>Afeitado de barba</p>
          </div>
          <div>
            <section className="servicios-packs-titulos">
              <h3>Paquetes</h3>
              <hr />  
            </section>
            <p>Corte + Barba+ Refrigerio</p>
            <p>Corte + Barba + Masaje</p>
            <p>Corte + Refrigerio</p>
            <p>Corte + Barba</p>
          </div>
          <div>
            <section className="servicios-packs-titulos">
              <h3>Cortes Sencillos</h3>
              <hr />
            </section>
            <p>Corte de cabello</p>
          </div>
          <div>
            <div>
              <ion-icon name="call"></ion-icon> : (+58) 426-1178859
            </div>
            <div>
              <ion-icon name="logo-whatsapp"></ion-icon> : (+58) 426-1178859
            </div>
            <div>
              <a href="/pages/auth/login">Agendar Cita</a>
            </div>
          </div>
        </div>
      </div>
      <div>
        <section id="siguenos">
          <h2>Siguenos</h2>
          <hr />
        </section>
        <div>
          <a href="https://www.instagram.com/medinabarber9/">@medinabarber9</a>
        </div>
      </div>
    </>
  )
}

export default Home