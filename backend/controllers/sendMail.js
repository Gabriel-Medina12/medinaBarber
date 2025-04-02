const transport = require('../config/mail');
require('dotenv').config()

const sendMail = async (to, subject, text) =>{
    const mailOption = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    }
    try{
        await transport.sendMail(mailOption);
        return { success: true, message: 'Correo enviado exitosamente' };
    }catch(err){
        console.log(err);
        return { success: false,message: 'Error al enviar el correo' };
    }
}

module.exports = { sendMail };