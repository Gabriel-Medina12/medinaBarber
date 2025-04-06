import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { Search, Scissors, Upload, User, Calendar, X, Image, Trash2 } from "lucide-react";

const AdminHaircuts = () => {
  document.title = 'Gestión de Cortes | Medina Barber';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadImages, setUploadImages] = useState([]);
  const [uploadDescription, setUploadDescription] = useState("");
  const [userCortes, setUserCortes] = useState([]);
  const [loadingCortes, setLoadingCortes] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }
    
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setUsers(response.data.users);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        
        if (error.response && error.response.status === 403) {
          alert("No tienes permisos de administrador para acceder a esta página");
          navigate("/pages/perfil");
        } else if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/pages/auth/login");
        }
        
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [navigate]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setLoadingCortes(true);
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get(`/api/admin/users/${user.id}/cortes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUserCortes(response.data.cortes);
      }
    } catch (error) {
      console.error('Error al cargar cortes del usuario:', error);
      alert("Error al cargar cortes del usuario");
    } finally {
      setLoadingCortes(false);
    }
  };
  
  const openUploadModal = () => {
    if (!selectedUser) {
      alert("Primero debes seleccionar un cliente");
      return;
    }
    
    setShowUploadModal(true);
    setUploadImages([]);
    setUploadDescription("");
  };
  
  const closeUploadModal = () => {
    setShowUploadModal(false);
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar que sean imágenes y no excedan el límite
    if (files.length > 5) {
      alert("Puedes subir un máximo de 5 imágenes a la vez");
      return;
    }
    
    const validFiles = files.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== files.length) {
      alert("Solo se permiten archivos de imagen");
    }
    
    setUploadImages(validFiles);
  };
  
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      alert("Debes seleccionar un cliente");
      return;
    }
    
    if (uploadImages.length === 0) {
      alert("Debes seleccionar al menos una imagen");
      return;
    }
    
    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    uploadImages.forEach(image => {
      formData.append('imagenes', image);
    });
    
    formData.append('descripcion', uploadDescription);
    
    try {
      const response = await axios.post(
        `/api/admin/users/${selectedUser.id}/cortes`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        alert("Imágenes subidas correctamente");
        closeUploadModal();
        
        // Actualizar la lista de cortes
        handleSelectUser(selectedUser);
      }
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      alert("Error al subir imágenes");
    }
  };
  
  const handleDeleteCorte = async (corteId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este corte?")) {
      return;
    }
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.delete(
        `/api/admin/cortes/${corteId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        alert("Corte eliminado correctamente");
        
        // Actualizar la lista de cortes
        setUserCortes(userCortes.filter(corte => corte.id !== corteId));
      }
    } catch (error) {
      console.error('Error al eliminar corte:', error);
      alert("Error al eliminar corte");
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Gestión de Cortes</h1>
          <div className="admin-actions">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar clientes..." 
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <button 
              className="upload-button"
              onClick={openUploadModal}
              disabled={!selectedUser}
            >
              <Upload size={18} />
              <span>Subir Cortes</span>
            </button>
          </div>
        </div>
        
        <div className="haircuts-container">
          <div className="users-list">
            <h2>Clientes</h2>
            
            {filteredUsers.length > 0 ? (
              <div className="users-grid">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id} 
                    className={`user-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="user-avatar">
                      <img 
                        src={user.avatar ? `http://localhost:3000${user.avatar}` : "/placeholder.svg?height=60&width=60"} 
                        alt={user.fullName} 
                      />
                    </div>
                    <div className="user-info">
                      <h3>{user.fullName}</h3>
                      <p>@{user.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <User size={48} />
                <p>No se encontraron clientes</p>
              </div>
            )}
          </div>
          
          <div className="cortes-display">
            <h2>
              {selectedUser 
                ? `Cortes de ${selectedUser.fullName}` 
                : "Selecciona un cliente para ver sus cortes"}
            </h2>
            
            {selectedUser && (
              <div className="cortes-actions">
                <button 
                  className="upload-button"
                  onClick={openUploadModal}
                >
                  <Upload size={18} />
                  <span>Subir Nuevos Cortes</span>
                </button>
              </div>
            )}
            
            {loadingCortes ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando cortes...</p>
              </div>
            ) : selectedUser ? (
              userCortes.length > 0 ? (
                <div className="cortes-grid">
                  {userCortes.map(corte => (
                    <div key={corte.id} className="corte-card">
                      <div className="corte-image">
                        <img 
                          src={`http://localhost:3000${corte.imagenUrl}`} 
                          alt={`Corte de ${selectedUser.fullName}`} 
                        />
                        <button 
                          className="delete-corte-button"
                          onClick={() => handleDeleteCorte(corte.id)}
                          title="Eliminar corte"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="corte-info">
                        <p className="corte-date">
                          <Calendar size={14} />
                          <span>{formatDate(corte.fecha)}</span>
                        </p>
                        {corte.descripcion && (
                          <p className="corte-description">{corte.descripcion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <Scissors size={48} />
                  <p>Este cliente no tiene cortes registrados</p>
                  <button 
                    className="upload-button"
                    onClick={openUploadModal}
                  >
                    <Upload size={18} />
                    <span>Subir Primer Corte</span>
                  </button>
                </div>
              )
            ) : (
              <div className="no-selection">
                <User size={48} />
                <p>Selecciona un cliente para ver sus cortes</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal para subir imágenes */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-container upload-modal">
            <div className="modal-header">
              <h3>Subir Cortes para {selectedUser.fullName}</h3>
              <button className="close-button" onClick={closeUploadModal}>×</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <div className="form-group">
                <label>Selecciona imágenes (máximo 5):</label>
                <div className="file-upload-container">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange}
                    id="image-upload"
                    className="file-input"
                  />
                  <label htmlFor="image-upload" className="file-upload-button">
                    <Image size={20} />
                    <span>Seleccionar Imágenes</span>
                  </label>
                </div>
                
                {uploadImages.length > 0 && (
                  <div className="selected-files">
                    <p>{uploadImages.length} {uploadImages.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}</p>
                    <ul>
                      {uploadImages.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Descripción (opcional):</label>
                <textarea 
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe el corte o estilo..."
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={closeUploadModal}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  Subir Imágenes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHaircuts;
