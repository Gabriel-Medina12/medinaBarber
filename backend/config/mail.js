const nodemailer = require('nodemailer');
require('dotenv').config();

// Eliminar espacios en la contraseña si existen
const emailPass = process.env.EMAIL_PASS.replace(/\s+/g, '');

// console.log('Configurando transporte de correo con:');
// console.log('- Servicio:', process.env.EMAIL_SERVICE);
// console.log('- Usuario:', process.env.EMAIL_USER);
// console.log('- Contraseña (longitud):', emailPass.length);

const transport = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: emailPass
    },
    debug: true, // Habilitar logs de depuración
    logger: true // Registrar información sobre el transporte
});

// Verificar la configuración
transport.verify(function(error, success) {
    if (error) {
        console.error('Error en la configuración del transporte de correo:', error);
    } else {
        console.log('Servidor listo para enviar correos');
    }
});

module.exports = transport;