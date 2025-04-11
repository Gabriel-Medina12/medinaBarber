"use client"

import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP, ScrollTrigger)

import Img1 from "../assets/img/medinaBarber2.jpeg";
import Img2 from "../assets/img/medinaBarber1.jpeg";
import Img3 from "../assets/img/medinaBarber3.jpeg";
import Img4 from "../assets/img/imagen4.webp";
// ./src/assets/img/imagen4.webp
import Img5 from "../assets/img/imagen5.webp";

const Home = () => {
  const gridRef = useRef();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleAgendarClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      // Si está autenticado, navegar a la página de agendar
      navigate('/pages/agendar');
    } else {
      // Si no está autenticado, navegar al login con un mensaje
      navigate('/pages/auth/login', { 
        state: { 
          message: 'Debes iniciar sesión para agendar una cita',
          redirectTo: '/pages/agendar'
        } 
      });
    }
  };

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".bento-item");
      cards.forEach((card) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: gridRef }
  );

  return (
    <>
      <NavBar />
      <div className="imgs-fondo-home">
        <img src={Img1} alt="Barber shop interior" />
        <img src={Img2} alt="Barber shop service" />
        <img src={Img3} alt="Barber shop styling" />
      </div>
      <section className="services-section" id="servicios">
        <div className="services-container">
          <h2 className="services-title">SERVICIOS</h2>
          <div className="services-divider"></div>

          <div className="bento-grid" ref={gridRef}>
            <div className="bento-item">
              <div className="bento-image-container">
                <img src={Img1} alt="Servicios de barba" className="bento-image" />
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
                <img src={Img4} alt="Paquetes de barbería" className="bento-image" />
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
                <img src={Img5} alt="Paquetes de barbería" className="bento-image" />
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
            <div className="contact-item-home">
              <span className="contact-label-home">
                <ion-icon name="call"></ion-icon>:
              </span>
              <a href="tel:+584261178859" className="contact-link-home">
                (+58) 426 1178859
              </a>
            </div>
            <div className="contact-item-home">
              <span className="contact-label-home">
                <ion-icon name="logo-whatsapp"></ion-icon>:
              </span>
              <a href="tel:+584261178859" className="contact-link-home">
                (+58) 426 1178859
              </a>
            </div>
            <a href="#" onClick={handleAgendarClick} className="appointment-button">
              AGENDAR CITA
            </a>
          </div>
        </div>
      </section>

      <div className="siguenos-home">
        <section id="siguenos" className="titulos">
          <h2>Síguenos</h2>
          <hr />
        </section>
        <div className="instagram-seguirnos">
          <div className="siguenos-insta">
            <ion-icon name="logo-instagram" className="siguenos-icon"></ion-icon>
          </div>
          <div className="enlace-ig">
            <a href="https://www.instagram.com/medinabarber9/" target="_blank">@medinabarber9</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home

