const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Users } = require('../models');
const { sendMail } = require('./sendMail');
const upload = require('../config/multer');

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
          process.env.JWT_SECRET, // Clave secreta para firmar el token
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


router.post('/forgot-password', async(req, res)=>{

    try {
        const { email } = req.body;
    
        // Buscar al usuario por su email
        const user = await Users.findOne({ where: { email } });
        if (!user) {
          return res.status(400).json({ message: 'Usuario no encontrado' });
        }
    
        // Generar un token para restablecer la contraseña
        const resetToken = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET, // Clave secreta para firmar el token
          { expiresIn: '15m' } // El token expira en 15 minutos
        );
    
        // Enviar el token por correo electrónico (esto es un ejemplo básico)
        console.log(`Token para restablecer contraseña: ${resetToken}`);
        // Aquí deberías integrar un servicio de correo electrónico para enviar el token al usuario.
    
        res.status(200).json({
          message: 'Se ha enviado un enlace para restablecer la contraseña',
          resetToken
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
      }

});

router.post('/logout', async(req, res)=>{

    try {
        // En un sistema más avanzado, podrías agregar el token a una lista negra.
        res.status(200).json({ message: 'Sesión cerrada exitosamente' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
      }

});

module.exports = router;