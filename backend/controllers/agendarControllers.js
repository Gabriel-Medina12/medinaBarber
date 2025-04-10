const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../models');
const { sendMail } = require('./sendMail');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const upload = require('../config/multerPayment');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

services: [
  { id: "haircut", name: "Corte de cabello", price: 5, duration: 30 },
  { id: "beard", name: "Afeitado de barba", price: 5, duration: 20 },
  { id: "beard", name: "Alineado de barba", price: 5, duration: 15 },  // Same id "beard"
  { id: "paquetes", name: "Corte + Refrigerio", price: 8, duration: 75 },
  { id: "paquetes", name: "Corte + Barba", price: 8, duration: 90 },      // Same id "paquetes"
]
const formatDateString = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
};

router.post('/', upload.single('paymentProof'), async (req, res) => {
  try {
    console.log('Datos recibidos en el cuerpo:', req.body);
    const paymentProofPath = req.file ? req.file.path : null;
    
    // Extraer los datos del cuerpo de la solicitud
    const { 
      clientName, 
      service, 
      date, 
      time, 
      notes, 
      email, 
      paymentMethod,
      referenceNumber
    } = req.body;
    
    // Verificar que los datos necesarios estén presentes
    if (!clientName || !service || !date || !time || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son obligatorios' 
      });
    }
    
    // Verificar si hay un usuario autenticado
    let userId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (tokenError) {
        console.log('Token inválido o expirado, continuando sin asociar usuario');
      }
    }

    if (paymentMethod === 'tarjeta') {
      if (!paymentProofPath || !referenceNumber) {
        return res.status(400).json({
          success: false,
          message: 'Para pagos con tarjeta se requiere comprobante y número de referencia'
        });
      }
    }
    
    // Crear la cita en la base de datos
    const newCita = await db.Citas.create({
      userId,
      clientName,
      service,
      date,
      time,
      notes,
      email,
      paymentMethod: paymentMethod || 'efectivo',
      referenceNumber: referenceNumber || null,
      paymentProofPath: req.file ? req.file.path : null,
      confirmed: false,
      paid: paymentMethod === 'tarjeta' ? Boolean(paymentProofPath) : false
    });
    
    console.log('Cita creada con éxito:', newCita.toJSON());
    // Enviar email de confirmación al cliente
    try {
      const clientMessage = `
        Hola ${clientName},
        
        Gracias por agendar una cita con Medina Barber. A continuación, los detalles de tu cita:
        
        Servicio: ${service}
        Fecha: ${formatDateString(date)}
        Hora: ${time}
        
        Tu cita está pendiente de confirmación. Recibirás un correo cuando sea confirmada por nuestro equipo.
        
        Si necesitas cancelar o modificar tu cita, por favor contáctanos con al menos 24 horas de anticipación.
        
        Saludos,
        Equipo de Medina Barber
      `;
      
      const emailResult = await sendMail(email, 'Confirmación de cita - Medina Barber', clientMessage);
      console.log('Resultado de envío de correo al cliente:', emailResult);
    } catch (emailError) {
      console.error('Excepción al enviar correo al cliente:', emailError);
    }
    
    // Enviar notificación al administrador
    try {
      const adminMessage = `
        Nueva cita agendada:
        
        Cliente: ${clientName}
        Email: ${email}
        Servicio: ${service}
        Fecha: ${formatDateString(date)}
        Hora: ${time}
        Notas: ${notes || 'Sin notas'}
        Método de pago: ${paymentMethod || 'efectivo'}
        ${referenceNumber ? `Número de referencia: ${referenceNumber}` : ''}
        ${req.file ? `Comprobante de pago: ${req.file.path}` : ''}
      `;
      
      const adminEmailResult = await sendMail('medinabarber1@gmail.com', 'Nueva cita agendada', adminMessage);
      console.log('Resultado de envío de correo al administrador:', adminEmailResult);
    } catch (emailError) {
      console.error('Excepción al enviar correo al administrador:', emailError);
    }
    
    // Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Cita agendada correctamente',
      appointment: newCita
    });
    
  } catch (error) {
    console.error('Error detallado al agendar cita:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al agendar la cita',
      error: error.message
    });
  }
});


// Confirmar una cita (solo para administradores)
router.put('/confirm/:id', verifyToken, async (req, res) => {
  try {
    console.log('Intentando confirmar cita ID:', req.params.id);
    console.log('Datos recibidos:', req.body);
    
    // Verificar si el usuario es administrador
    const user = await db.Users.findByPk(req.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    
    const citaId = req.params.id;
    const cita = await db.Citas.findByPk(citaId);
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }
    
    // Actualizar estado de la cita
    // Asegúrate de que el campo en la base de datos se llama 'confirmed'
    cita.confirmed = req.body.confirmed !== undefined ? req.body.confirmed : true;
    await cita.save();
    
    // Enviar correo al cliente
    try {
      const confirmationMessage = `
        Hola ${cita.clientName},
        
        ¡Tu cita en Medina Barber ha sido confirmada!
        
        Detalles de la cita confirmada:
        📅 Fecha: ${formatDateString(cita.date)}
        ⏰ Hora: ${cita.time}
        ✂ Servicio: ${cita.service}
        
        Te esperamos en nuestro local 10 minutos antes de tu hora agendada.
        
        Si necesitas cancelar o modificar tu cita, por favor contáctanos con al menos 24 horas de anticipación.
        
        Saludos,
        Equipo de Medina Barber
      `;
      
      await sendMail(cita.email, 'Cita Confirmada - Medina Barber', confirmationMessage);
      console.log('Correo de confirmación enviado a:', cita.email);
    } catch (emailError) {
      console.error('Error al enviar correo de confirmación:', emailError);
      // No detenemos el proceso aunque falle el correo
    }
    
    res.status(200).json({
      success: true,
      message: 'Cita confirmada correctamente',
      appointment: cita
    });
  } catch (error) {
    console.error('Error detallado al confirmar cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la cita',
      error: error.message
    });
  }
});
// Cancelar una cita

// Obtener citas de un usuario
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Buscando citas para el usuario:', userId);
    
    // Verificar que userId sea válido
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario no válido',
        appointments: []
      });
    }
    
    const citas = await db.Citas.findAll({
      where: { userId },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    
    console.log('Citas encontradas:', citas.length);
    
    res.status(200).json({
      success: true,
      appointments: citas
    });
  } catch (error) {
    console.error('Error detallado al obtener citas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las citas',
      error: error.message,
      appointments: []  // Devolver array vacío para evitar errores en el frontend
    });
  }
});

// Obtener horarios disponibles para una fecha específica
router.get('/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar una fecha'
      });
    }
    
    // Obtener todos los horarios configurados
    const settings = await db.Settings.findOne();
    const allTimeSlots = settings ? settings.timeSlots : [
      "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
    ];
    
    // Obtener citas para la fecha seleccionada
    const bookedAppointments = await db.Citas.findAll({
      where: { date: date },
      attributes: ['time']
    });
    
    // Extraer los horarios ya reservados
    const bookedTimes = bookedAppointments.map(appointment => appointment.time);
    
    // Filtrar los horarios disponibles
    const availableTimeSlots = allTimeSlots.filter(time => !bookedTimes.includes(time));
    
    res.status(200).json({
      success: true,
      availableTimeSlots
    });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios disponibles'
    });
  }
});

// Cancelar una cita (para administradores)
router.delete('/admin/cancel/:id', verifyToken, async (req, res) => {
  try {
    const citaId = req.params.id;
    
    // Verificar si el usuario es administrador
    const user = await db.Users.findByPk(req.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    
    // Buscar la cita
    const cita = await db.Citas.findByPk(citaId);
    
    if (!cita) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cita no encontrada' 
      });
    }
    
    // Preparar mensaje de cancelación según el método de pago
    let cancelMessage = `
      Hola ${cita.clientName},
      
      Tu cita para el ${formatDateString(cita.date)} a las ${cita.time} ha sido cancelada por el administrador.
      
      Detalles de la cita cancelada:
      - Servicio: ${cita.service}
      - Fecha: ${formatDateString(cita.date)}
      - Hora: ${cita.time}
    `;
    
    // Añadir mensaje específico para pagos con tarjeta o pago móvil
    if (cita.paymentMethod === 'tarjeta' || cita.paymentMethod === 'pago_movil') {
      cancelMessage += `
      
      Nuestro equipo se pondrá en contacto contigo a la brevedad para coordinar la devolución del pago realizado.
      `;
    }
    
    cancelMessage += `
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      Saludos,
      Equipo de Medina Barber
    `;
    
    // Enviar email de cancelación
    await sendMail(cita.email, 'Cita cancelada - Medina Barber', cancelMessage);
    
    // Notificar al administrador
    const adminMessage = `
      Cita cancelada por administrador:
      
      Cliente: ${cita.clientName}
      Email: ${cita.email}
      Servicio: ${cita.service}
      Fecha: ${formatDateString(cita.date)}
      Hora: ${cita.time}
      Método de pago: ${cita.paymentMethod || 'efectivo'}
      ${cita.referenceNumber ? `Número de referencia: ${cita.referenceNumber}` : ''}
    `;
    
    await sendMail('medinabarber1@gmail.com', 'Cita cancelada por administrador', adminMessage);
    
    // Eliminar la cita
    await cita.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Cita cancelada correctamente'
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cancelar la cita',
      error: error.message
    });
  }
});

// Obtener configuración de servicios y horarios
router.get('/settings', async (req, res) => {
  try {
    // Como parece que no tienes una tabla Settings, simplemente devuelve valores predeterminados
    return res.status(200).json({
      success: true,
      settings: {
        services: [
          { id: "haircut", name: "Corte de cabello", price: 5, duration: 30 },
          { id: "beard", name: "Afeitado de barba", price: 5, duration: 20 },
          { id: "beard", name: "Alineado de barba", price: 5, duration: 15 },
          { id: "paquetes", name: "Corte + Refrigerio", price: 8, duration: 75 },
          { id: "paquetes", name: "Corte + Barba", price: 8, duration: 90 },  
        ],
        timeSlots: [
          "10:00", "10:30", "11:00", "11:30",
          "12:00", "12:30", "13:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
        ]
      }
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message
    });
  }
});

router.get('/all', verifyToken, async (req, res) => {
  try {
    // Calcular inicio y fin de semana
    const startOfWeek = moment().startOf('isoWeek').toDate(); // Lunes
    const endOfWeek = moment().endOf('isoWeek').toDate();     // Domingo

    const citas = await db.Citas.findAll({
      where: {
        date: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    
    res.status(200).json({ 
      success: true, 
      appointments: citas 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener citas' 
    });
  }
});

module.exports = router;
