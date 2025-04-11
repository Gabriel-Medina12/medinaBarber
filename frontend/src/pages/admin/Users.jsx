import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import AdminSidebar from "../../components/AdminSidebar";
import { Search, Edit, Trash2, UserPlus, Check, X } from "lucide-react";

const AdminUsers = () => {
  document.title = 'Gestión de Usuarios | Medina Barber';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [newRole, setNewRole] = useState("");
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/pages/auth/login");
      return;
    }
    
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users', {
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
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };
  
  const openRoleModal = (user) => {
    setUserToEdit(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };
  
  const closeRoleModal = () => {
    setUserToEdit(null);
    setNewRole("");
    setShowRoleModal(false);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await api.delete(`/admin/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Actualizar la lista de usuarios
        setUsers(users.filter(user => user.id !== userToDelete.id));
        closeDeleteModal();
        alert("Usuario eliminado correctamente");
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert("Error al eliminar usuario");
    }
  };
  
  const handleChangeRole = async () => {
    if (!userToEdit || !newRole) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await api.put(`/admin/users/${userToEdit.id}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Actualizar la lista de usuarios
        setUsers(users.map(user => 
          user.id === userToEdit.id ? { ...user, role: newRole } : user
        ));
        closeRoleModal();
        alert("Rol actualizado correctamente");
      }
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      alert("Error al cambiar rol");
    }
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
          <h1>Gestión de Usuarios</h1>
          <div className="admin-actions">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar usuarios..." 
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        <div className="users-container">
          {filteredUsers.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-avatar">
                        <img 
                          src={user.avatar ? `https://medinabarber.onrender.com${user.avatar}` : "/placeholder.svg?height=40&width=40"} 
                          alt={user.fullName} 
                        />
                      </div>
                    </td>
                    <td>{user.fullName}</td>
                    <td>@{user.userName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button edit"
                          onClick={() => openRoleModal(user)}
                          title="Cambiar rol"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => openDeleteModal(user)}
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <p>No se encontraron usuarios que coincidan con la búsqueda</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para eliminar usuario */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Eliminar Usuario</h3>
              <button className="close-button" onClick={closeDeleteModal}>×</button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.fullName}</strong>?</p>
              <p className="warning-text">Esta acción no se puede deshacer y eliminará todos los datos asociados al usuario.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button className="delete-button" onClick={handleDeleteUser}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para cambiar rol */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Cambiar Rol de Usuario</h3>
              <button className="close-button" onClick={closeRoleModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Usuario: <strong>{userToEdit?.fullName}</strong></p>
              <p>Rol actual: <strong>{userToEdit?.role === 'admin' ? 'Administrador' : 'Usuario'}</strong></p>
              
              <div className="form-group">
                <label>Nuevo rol:</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                  className="role-select"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeRoleModal}>
                Cancelar
              </button>
              <button className="save-button" onClick={handleChangeRole}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
