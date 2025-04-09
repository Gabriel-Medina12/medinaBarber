const transport = require('../config/mail');
require('dotenv').config()

const sendMail = async (to, subject, text) => {
    const mailOption = {
        from: `"Medina Barber" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: text.replace(/\n/g, '<br>')
    }
    try {
        console.log(`Intentando enviar correo a: ${to}`);
        const info = await transport.sendMail(mailOption);
        console.log(`Correo enviado exitosamente a ${to}. ID: ${info.messageId}`);
        return { success: true, message: 'Correo enviado exitosamente', info };
    } catch (err) {
        console.error('Error detallado al enviar correo:', err);
        // Verificaciones de errores...
        return { success: false, message: 'Error al enviar el correo', error: err.message };
    }
}


module.exports = { sendMail };