"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const EditPerfil = () => {
  document.title = 'Editar Perfil | Medina Barber'
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    newUsername: "",
    confirmUsername: "",
  })
  const [avatar, setAvatar] = useState("/placeholder.svg?height=150&width=150")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.newUsername !== formData.confirmUsername) {
      alert("Los nombres de usuario no coinciden")
      return
    }

    // Aquí iría la lógica para guardar los cambios
    console.log("Datos actualizados:", formData)

    // Redirigir al perfil
    navigate("/profile")
  }

  const handleAvatarClick = () => {
    // Simular click en el input file oculto
    document.getElementById("avatar-upload").click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <div className="logo-MB">
            <a href="/"><img src="../src/assets/img/LogoMedinaBarber.PNG" alt="" /></a>
        </div>
        <div className="navBar-Corto">
            <a href="/" className="enlace-Home nav-corto">Inicio</a> <p className="enlace-Contacto">|</p> <a href="/pages/perfil" className="enlace-Contacto nav-corto">Perfil</a>
        </div>
      </div>

      <div className="titulos">
        <h2>EDITAR PERFIL</h2>
        <hr />

      </div>

      <p className="edit-profile-info">
        Elige tu nuevo foto y nombre de usuario con cuidado, ya que no podrás realizar ajustes hasta que pasen los 90
        días.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="avatar-edit-container">
          <div className="avatar-edit" onClick={handleAvatarClick}>
            <img src={avatar || "/placeholder.svg"} alt="Avatar" className="avatar-preview" />
            <div className="edit-icon">✏️</div>
          </div>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="newUsername">Nuevo nombre de usuario</label>
          <input
            type="text"
            id="newUsername"
            name="newUsername"
            value={formData.newUsername}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmUsername">Confirmar nombre de usuario</label>
          <input
            type="text"
            id="confirmUsername"
            name="confirmUsername"
            value={formData.confirmUsername}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="cambiar-button">
          CAMBIAR
        </button>
      </form>
    </div>
  )
}

export default EditPerfil

