const transport = require('../config/mail');
require('dotenv').config()

const sendMail = async (to, subject, text) => {
    const mailOption = {
        from: `"Medina Barber" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            </head>
            <body style="font-family: 'Arial', sans-serif; background-color: #f8f8f8; margin: 0; padding: 20px 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                <td align="center" style="padding: 20px;">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding: 30px 40px; text-align: center;">
                        <h1 style="color: #A0522D; font-size: 26px; margin: 0 0 20px 0; font-weight: bold; letter-spacing: 1px;">
                            ${subject}
                        </h1>
                        
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; border-radius: 6px; padding: 20px; text-align: left;">
                            <tr>
                            <td>
                                <div style="line-height: 1.6; color: #34495e;">
                                ${text.replace(/\n/g, '<br>')}
                                </div>
                            </td>
                            </tr>
                        </table>

                        <div style="margin-top: 25px; color: #555555; font-size: 16px; line-height: 1.6;">
                            <p style="color: #A0522D; font-size: 18px; margin: 30px 0 0 0; font-weight: bold;">
                            ¡Gestión de Citas Medina Barber!
                            </p>
                            <p style="margin: 10px 0 0 0;">📞 Contacto: +58 412-2911866</p>
                        </div>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>

            </body>
            </html>
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