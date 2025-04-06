const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const db = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para subir imágenes de cortes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `uploads/cortes/${req.params.userId}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `corte-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
  }
});

// Obtener estadísticas para el dashboard
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    // Contar usuarios
    const userCount = await db.Users.count();
    
    // Contar citas para la semana actual
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Asumiendo que tienes un modelo Citas
    const appointmentCount = await db.Citas.count({
      where: {
        fecha: {
          [db.Sequelize.Op.between]: [startOfWeek, endOfWeek]
        }
      }
    });
    
    // Contar mensajes de contacto
    const contactCount = await db.Contacto.count();
    
    res.status(200).json({
      success: true,
      stats: {
        userCount,
        appointmentCount,
        contactCount
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
});

// Obtener todos los usuarios
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await db.Users.findAll({
      attributes: ['id', 'email', 'fullName', 'userName', 'role', 'avatar', 'createdAt']
    });
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

// Cambiar rol de usuario
router.put('/users/:userId/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol inválido' });
    }
    
    const user = await db.Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Rol actualizado correctamente',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userName: user.userName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar rol' });
  }
});

// Eliminar usuario
router.delete('/users/:userId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await db.Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
});

// Obtener citas para la semana
router.get('/appointments', verifyToken, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const appointments = await db.Citas.findAll({
      where: {
        fecha: {
          [db.Sequelize.Op.between]: [startOfWeek, endOfWeek]
        }
      },
      include: [
        {
          model: db.Users,
          attributes: ['id', 'fullName', 'email', 'avatar']
        }
      ],
      order: [['fecha', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener citas' });
  }
});

// Confirmar cita y pago
router.put('/appointments/:appointmentId/confirm', verifyToken, isAdmin, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { confirmado, pagado } = req.body;
    
    const appointment = await db.Citas.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }
    
    if (confirmado !== undefined) appointment.confirmado = confirmado;
    if (pagado !== undefined) appointment.pagado = pagado;
    
    await appointment.save();
    
    res.status(200).json({
      success: true,
      message: 'Cita actualizada correctamente',
      appointment
    });
  } catch (error) {
    console.error('Error al confirmar cita:', error);
    res.status(500).json({ success: false, message: 'Error al confirmar cita' });
  }
});

// Subir imágenes de corte para un cliente
router.post('/users/:userId/cortes', verifyToken, isAdmin, upload.array('imagenes', 5), async (req, res) => {
  try {
    const { userId } = req.params;
    const { descripcion } = req.body;
    
    const user = await db.Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No se han subido imágenes' });
    }
    
    // Crear registros para cada imagen
    const cortes = [];
    for (const file of req.files) {
      const corte = await db.Cortes.create({
        userId: userId,
        imagenUrl: `/uploads/cortes/${userId}/${file.filename}`,
        descripcion: descripcion || '',
        fecha: new Date()
      });
      cortes.push(corte);
    }
    
    res.status(201).json({
      success: true,
      message: 'Imágenes subidas correctamente',
      cortes
    });
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({ success: false, message: 'Error al subir imágenes' });
  }
});

// Obtener cortes de un usuario
router.get('/users/:userId/cortes', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cortes = await db.Cortes.findAll({
      where: { userId },
      order: [['fecha', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      cortes
    });
  } catch (error) {
    console.error('Error al obtener cortes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cortes' });
  }
});

module.exports = router;
