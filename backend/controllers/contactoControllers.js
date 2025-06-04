const express = require('express');
const router = express.Router();
const db = require('../models');
const { sendMail } = require('./sendMail');

router.post('/',  async (req, res) => {
    try {
        const { nombre, correo, asunto, mensaje } = req.body;

        // Validar datos
        if (!nombre || !correo || !asunto || !mensaje) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        // Guardar en la base de datos
        const nuevoContacto = await db.Contactos.create({
            nombre,
            correo,
            asunto,
            mensaje
        });

        // Enviar correo al administrador
        const mensajeAdmin = `
            Nuevo mensaje de contacto:
            
            Nombre: ${nombre}
            Correo: ${correo}
            Asunto: ${asunto}
            Mensaje: ${mensaje}
        `;

        await sendMail('medinabarber1@gmail.com', `Nuevo contacto: ${asunto}`, mensajeAdmin);

        // Enviar confirmación al usuario
        const mensajeConfirmacion = `
            Hola ${nombre},
            
            Gracias por contactar a Medina Barber. Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.
            
            Detalles de tu mensaje:
            Asunto: ${asunto}
            
            Saludos,
            Equipo de Medina Barber
        `;

        await sendMail(correo, 'Confirmación de mensaje - Medina Barber', mensajeConfirmacion);

        return res.status(201).json({ 
            success: true, 
            message: 'Mensaje enviado correctamente' 
        });

    } catch (error) {
        console.error('Error al procesar el contacto:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error al procesar el mensaje de contacto' 
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const contactos = await db.Contacto.findAll({
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ success: true, data: contactos });
    } catch (error) {
        console.error('Error al obtener contactos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener los mensajes de contacto' });
    }
});

module.exports = router;
