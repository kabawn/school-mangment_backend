const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use any email service provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates
    }
});

// Function to send an email
async function sendEmail(to, subject, text) {
    try {
        let info = await transporter.sendMail({
            from: '"School Management System" <osamaahlasa@gmail.com>', // Sender address
            to: to, // Recipient address
            subject: subject, // Subject line
            text: text, // Plain text body
        });

        console.log('Email sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Log the preview URL if using a testing service
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

module.exports = sendEmail;
