const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../models');

// Asegúrate de que este middleware esté manejando correctamente los errores
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Asegurar que el rol está presente
    if (!decoded.role) {
      return res.status(401).json({ message: 'Token inválido: rol no especificado' });
    }
    
    req.userId = decoded.id;
    req.userRole = decoded.role; // <-- Esto es crítico para el middleware isAdmin
    
    next();
  } catch (error) {
    console.error('Error de verificación de token:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar rol de administrador
// Middleware para verificar rol de administrador
const isAdmin = async (req, res, next) => {
  try {
    // Asegúrate de que req.userId esté definido
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'No se ha proporcionado ID de usuario' });
    }
    
    console.log('Verificando permisos de administrador para el usuario ID:', req.userId);
    
    // Buscar al usuario en la base de datos
    const user = await db.Users.findByPk(req.userId);
    
    if (!user) {
      console.log('Usuario no encontrado en la base de datos');
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    console.log('Usuario encontrado, rol:', user.role);
    
    if (user.role !== 'admin') {
      console.log('El usuario no tiene rol de administrador');
      return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de administrador' });
    }
    
    console.log('Usuario verificado como administrador');
    
    // Si todo está bien, continuar
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Error detallado en middleware isAdmin:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al verificar permisos de administrador',
      error: error.message
    });
  }
};


module.exports = { verifyToken, isAdmin };
