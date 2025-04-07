const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Users } = require('../models');
const { sendMail } = require('./sendMail');
const upload = require('../config/multer');
const { Op } = require('sequelize');
const crypto = require('crypto');
require('dotenv').config();

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verificationCodes = {};


router.post('/register', async (req, res) => {
  try {
      const { email, fullName, userName, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
          return res.status(400).json({ message: 'Las contraseñas no coinciden' });
      }
      
      // Verificar si el usuario ya existe
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
          return res.status(400).json({ message: 'El usuario ya existe' });
      }
      
      // Generar código de verificación
      const verificationCode = generateVerificationCode();
      
      // Almacenar temporalmente los datos del usuario y el código
      verificationCodes[email] = {
          verificationCode,
          userData: {
              email,
              fullName,
              userName,
              password,
              role: 'user'
          },
          expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos de expiración
      };
      
      // Enviar correo con código de verificación
      const mailResult = await sendMail(
          email,
          'Código de verificación - Medina Barber',
          `Hola ${fullName},\n\nTu código de verificación para Medina Barber es: ${verificationCode}\n\nEste código expirará en 15 minutos.\n\nSaludos,\nEquipo de Medina Barber`
      );
      
      if (!mailResult.success) {
          return res.status(500).json({ message: 'Error al enviar el correo de verificación' });
      }
      
      res.status(200).json({
          message: 'Se ha enviado un código de verificación a tu correo electrónico',
          requiresVerification: true,
          email: email
      });
      
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
      const { email, verificationCode } = req.body;
      
      // Verificar si existe un código para este email
      if (!verificationCodes[email]) {
          return res.status(400).json({ message: 'Código de verificación inválido o expirado' });
      }
      
      // Verificar si el código coincide
      if (verificationCodes[email].verificationCode !== verificationCode) {
          return res.status(400).json({ message: 'Código de verificación incorrecto' });
      }
      
      // Verificar si el código ha expirado
      if (verificationCodes[email].expiresAt < Date.now()) {
          delete verificationCodes[email];
          return res.status(400).json({ message: 'El código de verificación ha expirado' });
      }
      
      // Crear el usuario en la base de datos
      const userData = verificationCodes[email].userData;
      const newUser = await Users.create(userData);
      
      // Generar un token JWT
      const token = jwt.sign(
          { id: newUser.id, role: newUser.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );
      
      // Enviar correo de bienvenida
      await sendMail(
          email,
          'Bienvenido a Medina Barber',
          `Hola ${userData.fullName},\n\n¡Bienvenido a Medina Barber! Tu cuenta ha sido verificada exitosamente.\n\nAhora puedes disfrutar de todos nuestros servicios y reservar tus citas.\n\nSaludos,\nEquipo de Medina Barber`
      );
      
      // Eliminar el código de verificación
      delete verificationCodes[email];
      
      res.status(201).json({
          message: 'Usuario registrado exitosamente',
          token,
          user: {
              id: newUser.id,
              email: newUser.email,
              fullName: newUser.fullName,
              userName: newUser.userName,
              role: newUser.role
          }
      });
      
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/login', async (req, res)=>{

    try {
        const { email, password } = req.body;
    
        // Buscar al usuario por su email
        const user = await Users.findOne({ where: { email } });
        if (!user) {
          return res.status(400).json({ message: 'Credenciales inválidas' });
        }
    
        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Credenciales inválidas' });
        }
    
        // Generar un token JWT
        const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET, 
          { expiresIn: '1h' } // El token expira en 1 hora
        );
    
        // Responder con el token y los datos del usuario
        res.status(200).json({
          message: 'Inicio de sesión exitoso',
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            userName: user.userName,
            role: user.role
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
      }

});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};


// Ruta para obtener el perfil del usuario
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await Users.findByPk(req.userId, {
      attributes: ['id', 'email', 'fullName', 'userName', 'role', 'avatar', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userName: user.userName,
        role: user.role,
        avatar: user.avatar || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Actualizar la ruta edit-profile para incluir el avatar
router.post('/edit-profile', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    console.log("Recibida solicitud de edición de perfil");
    console.log("Datos recibidos:", req.body);
    console.log("Archivo recibido:", req.file);
    const { fullName, userName } = req.body;
    
    // Verificar si el usuario existe
    const user = await Users.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si se intenta cambiar el nombre de usuario, verificar que no exista otro usuario con ese nombre
    if (userName && userName !== user.userName) {
      const existingUser = await Users.findOne({ where: { userName } });
      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      }
    }
    
    // Actualizar los datos del usuario
    if (fullName) user.fullName = fullName;
    if (userName) user.userName = userName;
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    
    await user.save();
    
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userName: user.userName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
});


// Solicitar reset de contraseña
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'El correo electrónico es requerido' });
    }
    
    console.log(`Buscando usuario con email: ${email}`);
    
    // Buscar usuario por email
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No existe una cuenta con este correo electrónico' });
    }
    
    console.log(`Usuario encontrado: ${user.id}`);
    
    // Generar token único
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token válido por 1 hora
    
    console.log(`Token generado: ${resetToken}`);
    
    // Guardar token en la base de datos
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });
    
    // Crear enlace de reset
    const resetLink = `${process.env.ORIGIN}/pages/auth/reset-password/${resetToken}`;
    
    console.log(`Enlace de reset: ${resetLink}`);
    
    // Enviar correo con el enlace
    const mailSubject = 'Recuperación de contraseña - Medina Barber';
    const mailText = `Hola ${user.fullName},\n\nHas solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para completar el proceso:\n\n${resetLink}\n\nEste enlace es válido por 1 hora.\n\nSi no solicitaste este cambio, puedes ignorar este correo y tu contraseña seguirá siendo la misma.\n\nSaludos,\nEquipo de Medina Barber`;
    
    console.log('Enviando correo...');
    
    const mailResult = await sendMail(email, mailSubject, mailText);
    
    if (mailResult.success) {
      console.log('Correo enviado exitosamente');
      return res.status(200).json({ success: true, message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña' });
    } else {
      console.error('Error al enviar correo:', mailResult.message);
      return res.status(500).json({ success: false, message: 'Error al enviar el correo de recuperación: ' + mailResult.message });
    }
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
  }
});

// Verificar token y cambiar contraseña
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    console.log(`Recibida solicitud de reset con token: ${token}`);
    console.log(`Nueva contraseña recibida (longitud): ${password?.length || 0}`);
    
    // Buscar usuario con el token válido
    const user = await Users.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() } // Token no expirado
      }
    });
    
    if (!user) {
      console.log('Token inválido o expirado');
      return res.status(400).json({ success: false, message: 'El enlace de recuperación es inválido o ha expirado' });
    }
    
    console.log(`Usuario encontrado: ${user.id}`);
    
    // Actualizar contraseña y limpiar tokens
    user.password = password; // El hook beforeUpdate se encargará de hashear la contraseña
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    console.log('Contraseña actualizada correctamente');
    
    // Enviar correo de confirmación
    const mailSubject = 'Contraseña actualizada - Medina Barber';
    const mailText = `Hola ${user.fullName},\n\nTu contraseña ha sido actualizada exitosamente.\n\nSi no realizaste este cambio, por favor contacta inmediatamente con nuestro equipo de soporte.\n\nSaludos,\nEquipo de Medina Barber`;
    
    await sendMail(user.email, mailSubject, mailText);
    
    return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
  }
});
// Obtener cortes del usuario actual
router.get('/my-cortes', verifyToken, async (req, res) => {
  try {
    console.log("Obteniendo cortes para el usuario:", req.userId);
    
    const { Cortes } = require('../models');
    const cortes = await Cortes.findAll({
      where: { userId: req.userId },
      order: [['fecha', 'DESC']]
    });
    
    console.log("Cortes encontrados:", cortes.length);
    
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