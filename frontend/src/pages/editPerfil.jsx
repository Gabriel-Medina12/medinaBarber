import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const EditPerfil = () => {
  document.title = 'Editar Perfil | Medina Barber';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
  });
  
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("/placeholder.svg?height=150&width=150");
  const [avatarChanged, setAvatarChanged] = useState(false);

  useEffect(() => {
    // Obtener el token del localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }

    // Obtener los datos del perfil del usuario
    fetch("http://localhost:3000/api/users/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Si el token es inválido, redirigir al login
            localStorage.removeItem("token");
            navigate("/pages/auth/login");
            throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
          }
          throw new Error("Error al obtener los datos del perfil");
        }
        return res.json();
      })
      .then((data) => {
        setFormData({
          fullName: data.user.fullName || "",
          userName: data.user.userName || "",
        });
        
        if (data.user.avatar) {
          setAvatarPreview(data.user.avatar);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al obtener el perfil");
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }
    
    try {
      // Crear un FormData para enviar el archivo
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('userName', formData.userName);
      
      if (avatarChanged && avatar) {
        formDataToSend.append('avatar', avatar);
      }
      
      const response = await fetch("http://localhost:3000/api/users/edit-profile", {
        method: "POST",
        headers: {
          // No incluir Content-Type, FormData lo establece automáticamente
          "Authorization": `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el perfil");
      }
      
      setSuccessMessage("Perfil actualizado exitosamente");
      
      // Redirigir al perfil después de 2 segundos
      setTimeout(() => {
        navigate("/pages/perfil");
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setError(error.message || "Error al actualizar el perfil");
    }
  };

  // Función para convertir archivo a base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarClick = () => {
    // Simular click en el input file oculto
    document.getElementById("avatar-upload").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarChanged(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando datos del perfil...</p>
    </div>
  );

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <div className="logo-MB">
            <Link to="/"><img src="../src/assets/img/LogoMedinaBarber.PNG" alt="Logo" /></Link>
        </div>
        <div className="navBar-Corto">
            <Link to="/" className="enlace-Home nav-corto">Inicio</Link> 
            <p className="enlace-Contacto">|</p> 
            <Link to="/pages/perfil" className="enlace-Contacto nav-corto">Perfil</Link>
        </div>
      </div>

      <div className="titulos">
        <h2>EDITAR PERFIL</h2>
        <hr />
      </div>

      <p className="edit-profile-info">
        Actualiza tu foto de perfil y nombre de usuario.
      </p>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="avatar-edit-container">
          <div className="avatar-edit" onClick={handleAvatarClick}>
            <img src={avatarPreview} alt="Avatar" className="avatar-preview" />
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
          <label htmlFor="fullName">Nombre completo</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="userName">Nombre de usuario</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="cambiar-button">
          GUARDAR CAMBIOS
        </button>
      </form>
    </div>
  );
};

export default EditPerfil;