const transport = require('../config/mail');
require('dotenv').config()

const sendMail = async (to, subject, text) => {
    const mailOption = {
        from: `"Medina Barber" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                    ${subject}
                </h2>
                <div style="line-height: 1.6; color: #34495e;">
                    ${text.replace(/\n/g, '<br>')}
                </div>
                <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ecf0f1; color: #7f8c8d;">
                    <p>Equipo de Medina Barber</p>
                    <p>📞 Contacto: +58 412-2911866</p>
                </div>
            </div>
        `
    }
    
    try {
        console.log(`Intentando enviar correo a: ${to}`);
        const info = await transport.sendMail(mailOption);
        console.log(`Correo enviado exitosamente a ${to}. ID: ${info.messageId}`);
        return { success: true, message: 'Correo enviado exitosamente', info };
    } catch (err) {
        console.error('Error detallado al enviar correo:', err);
        return { 
            success: false, 
            message: 'Error al enviar el correo',
            error: err.message,
            details: {
                to: to,
                subject: subject,
                errorCode: err.responseCode
            }
        };
    }
}

module.exports = { sendMail };