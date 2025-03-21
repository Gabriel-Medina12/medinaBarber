"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

const Perfil = () => {
  const [user, setUser] = useState({
    name: "Gabriel Medina",
    username: "@medinabarber9",
    avatar: "/placeholder.svg?height=100&width=100",
  })

  // Placeholder images for the grid
  const placeholderImages = Array(9).fill("/placeholder.svg?height=150&width=150")

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="user-info">
          <div className="avatar-container">
            <img src={user.avatar || "/placeholder.svg"} alt="Avatar" className="avatar" />
          </div>
          <h3>{user.name}</h3>
          <p className="edit-profile-text">
            <a href="/pages/edit-perfil">Editar perfil</a>
          </p>
        </div>
        <div className="navBar-Corto">
            <a href="/" className="enlace-Home nav-corto">Inicio</a> <p className="enlace-Contacto">|</p> <a href="/pages/perfil" className="enlace-Contacto nav-corto">Perfil</a>
        </div>
      </div>


      <div className="titulos">
        <h2 className="">PERFIL</h2>
        <hr />
      </div>

      <div className="image-grid">
        {placeholderImages.map((img, index) => (
          <div key={index} className="grid-item">
            <img src={img || "/placeholder.svg"}  />
          </div>
        ))}
      </div>

      <div className="instagram-button">
        <a href="https://instagram.com/medinabarber9" target="_blank" rel="noopener noreferrer">
        <ion-icon name="logo-instagram" className='siguenos-ig'></ion-icon> Síguenos en Instagram
        </a>
      </div>
    </div>
  )
}

export default Perfil

