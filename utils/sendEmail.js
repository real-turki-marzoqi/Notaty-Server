const nodemailer = require('nodemailer');


const sendEmail= async(options)=>{

    const transporter = nodemailer.createTransport({

        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, // if secure = false port = 587, if secure = true port = 465
        secure: true,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: 'Notaty <turki.marzoqi.personal@gmail.com>',
        to: options.email,
        subject: options.subject,
        html: options.message
    };
     // 3) send Email
     await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;