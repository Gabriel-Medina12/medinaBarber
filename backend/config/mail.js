const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // Solo para desarrollo, quitar en producción
    }
});

// Verificar conexión al iniciar
transport.verify((error, success) => {
    if (error) {
        console.error('Error configurando el transporte de correo:', error);
    } else {
        console.log('Servidor de correo configurado correctamente');
    }
});

module.exports = transport;