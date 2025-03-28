const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Users } = require('../models');

router.post('/register', async (req, res)=>{
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
    
        // Crear el nuevo usuario
        const newUser = await Users.create({
          email,
          fullName,
          userName,
          password, // La contraseña se hashea automáticamente en el hook del modelo
          role: 'user' // Rol por defecto
        });
    
        // Generar un token JWT
        const token = jwt.sign(
          { id: newUser.id, role: newUser.role },
          process.env.JWT_SECRET, // Clave secreta para firmar el token
          { expiresIn: '1h' } // El token expira en 1 hora
        );
    
        // Responder con el token y los datos del usuario
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

router.post('/edit-profile', async (req, res) => {
    try {
      const { id, fullName, userName } = req.body;
  
      // Buscar al usuario por su ID
      const user = await Users.findByPk(id);  // Se agrega await
      if (!user) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
      }
  
      // Actualizar los datos del usuario
      user.fullName = fullName || user.fullName;
      user.userName = userName || user.userName;
      await user.save();  // Se espera la resolución del guardado
  
      res.status(200).json({
        message: 'Perfil actualizado exitosamente',
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