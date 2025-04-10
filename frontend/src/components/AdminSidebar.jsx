import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Scissors, 
  Settings, 
  LogOut, 
  Home 
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/pages/auth/login";
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Panel Admin</h2>
      </div>
      
      <nav className="sidebar-nav">
        <Link 
          to="/admin/dashboard" 
          className={`sidebar-link ${currentPath === "/admin/dashboard" ? "active" : ""}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        
        <Link 
          to="/admin/users" 
          className={`sidebar-link ${currentPath === "/admin/users" ? "active" : ""}`}
        >
          <Users size={20} />
          <span>Usuarios</span>
        </Link>
        
        <Link 
          to="/admin/appointments" 
          className={`sidebar-link ${currentPath === "/admin/appointments" ? "active" : ""}`}
        >
          <Calendar size={20} />
          <span>Citas</span>
        </Link>
        
        <Link 
          to="/admin/haircuts" 
          className={`sidebar-link ${currentPath === "/admin/haircuts" ? "active" : ""}`}
        >
          <Scissors size={20} />
          <span>Cortes</span>
        </Link>
        
        {/* <Link 
          to="/admin/settings" 
          className={`sidebar-link ${currentPath === "/admin/settings" ? "active" : ""}`}
        >
          <Settings size={20} />
          <span>Configuración</span>
        </Link> */}
      </nav>
      
      <div className="sidebar-footer">
        <Link to="/" className="sidebar-link">
          <Home size={20} />
          <span>Ir al sitio</span>
        </Link>
        
        <button onClick={handleLogout} className="sidebar-link logout-button">
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
