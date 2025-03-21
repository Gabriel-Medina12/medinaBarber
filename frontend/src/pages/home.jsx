import NavBar from '../components/NavBar';
import React, { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Home = () => {
  const gridRef = useRef();

  useGSAP(() => {
    const cards = gsap.utils.toArray('.bento-item');
    cards.forEach((card) => {
      gsap.from(card, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse', // Comportamiento al bajar y subir
          // markers: true, // Descomenta para depurar
        },
      });
    });
  }, { scope: gridRef });

  return (
    <>
      <NavBar />
      <div className="imgs-fondo-home">
        <img src="./src/assets/img/medinaBarber2.jpeg" alt="" />
        <img src="./src/assets/img/medinaBarber1.jpeg" alt="" />
        <img src="./src/assets/img/medinaBarber3.jpeg" alt="" />
      </div>
      <section className="services-section" id='servicios'>
        <div className="services-container">
          <h2 className="services-title">SERVICIOS</h2>
          <div className="services-divider"></div>

          <div className="bento-grid" ref={gridRef}>
            <div className="bento-item">
              <div className="bento-image-container">
                <img
                  src="./src/assets/img/medinaBarber2.jpeg"
                  alt="Servicios de barba"
                  className="bento-image"
                />
                <div className="bento-overlay">
                  <h3 className="bento-category">BARBA</h3>
                </div>
              </div>
              <div className="bento-content">
                <div className="bento-divider"></div>
                <ul className="bento-list">
                  <li>RECORTE ALINEADO DE BARBA O BIGOTE</li>
                  <li>AFEITADO DE BARBA</li>
                </ul>
              </div>
            </div>

            <div className="bento-item">
              <div className="bento-image-container">
                <img
                  src="./src/assets/img/medinaBarber1.jpeg"
                  alt="Cortes sencillos"
                  className="bento-image"
                />
                <div className="bento-overlay">
                  <h3 className="bento-category">CORTES SENCILLOS</h3>
                </div>
              </div>
              <div className="bento-content">
                <div className="bento-divider"></div>
                <ul className="bento-list">
                  <li>CORTE DE CABELLO</li>
                </ul>
              </div>
            </div>

            <div className="bento-item">
              <div className="bento-image-container">
                <img
                  src="./src/assets/img/medinaBarber3.jpeg"
                  alt="Paquetes de barbería"
                  className="bento-image"
                />
                <div className="bento-overlay">
                  <h3 className="bento-category">PAQUETES</h3>
                </div>
              </div>
              <div className="bento-content ">
                <div className="bento-divider"></div>
                <ul className="bento-list">
                  <li>CORTE + BARBA + REFRIGERIO</li>
                  <li>CORTE + BARBA + MASAJE</li>
                  <li>CORTE + REFRIGERIO</li>
                  <li>CORTE + BARBA</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <div className="contact-item">
              <span className="contact-label"><ion-icon name="call"></ion-icon>:</span>
              <a href="tel:+584261178859" className="contact-link">
                (+58) 426 1178859
              </a>
            </div>
            <div className="contact-item">
              <span className="contact-label"><ion-icon name="logo-whatsapp"></ion-icon>:</span>
              <a href="tel:+584261178859" className="contact-link">
                (+58) 426 1178859
              </a>
            </div>
            <a href="#" className="appointment-button">
              AGENDAR CITA
            </a>
          </div>
        </div>
      </section>

      <div>
        <section id="siguenos" className='titulos '>
          <h2>Siguenos</h2>
          <hr />
        </section>
        <div className='instagram-seguirnos'>
          <div className='siguenos-insta'>
            <ion-icon ion-icon name="logo-instagram" className="siguenos-icon"></ion-icon>
          </div>
          <div className='enlace-ig'>
            <a href="https://www.instagram.com/medinabarber9/">@medinabarber9</a>
          </div>
        </div>
      </div>
    </>
  );
};



export default Home;