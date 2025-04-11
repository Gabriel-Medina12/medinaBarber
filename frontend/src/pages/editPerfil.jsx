import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

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
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const { user } = response.data;
        
        setFormData({
          fullName: user.fullName || "",
          userName: user.userName || "",
        });
        
        if (user.avatar) {
          setAvatarPreview(`https://medinabarber.onrender.com${user.avatar}`);
        }
        
      } catch (error) {
        handleProfileError(error);
      } finally {
        setLoading(false);
      }
    };

    const handleProfileError = (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/pages/auth/login", {
          state: { message: "Sesión expirada. Por favor, inicia sesión nuevamente." }
        });
      }
      setError(error.response?.data?.message || "Error al cargar el perfil");
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('userName', formData.userName);
      
      if (avatarChanged && avatar) {
        formDataToSend.append('avatar', avatar);
      }
      
      const response = await api.post('/users/edit-profile', formDataToSend,{
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      setSuccessMessage(response.data.message || "Perfil actualizado exitosamente");
      
      setTimeout(() => {
        navigate("/pages/perfil");
      }, 2000);
      
    } catch (error) {
      handleSubmitError(error);
    }
  };

  const handleSubmitError = (error) => {
    const errorMessage = error.response?.data?.message || "Error al actualizar el perfil";
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/pages/auth/login");
    }
    
    if (error.response?.status === 400 && error.response.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).join(", ");
      setError(`Errores de validación: ${validationErrors}`);
      return;
    }
    
    setError(errorMessage);
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
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditPerfil;