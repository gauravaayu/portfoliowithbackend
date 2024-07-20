const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();  // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST route to handle form submission
app.post('/submit-form', (req, res) => {
    const { name, email, phone, message } = req.body;

    const mailOptions1 = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank You for Reaching Out!',
        text: `Dear ${name},\n\nThank you for taking the time to submit the form. We have successfully received your information. \n\n---Your Response--- \nName : ${name} \nEmail : ${email} \nNumber : ${phone} \nMessage : ${message} \n\nI will review the details you’ve shared and will get back to you as soon as possible. If you have any questions or need further assistance in the meantime, please feel free to contact us at Email : gaurav.mishra0627@gmail.com.\n\nWe appreciate your interest and look forward to connecting with you soon.\n\nBest Regards,\nGaurav Mishra \nSoftware Enginner \n7217873350`
    };
    const mailOptions2 = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `New Inquiry Received from ${name}`,
        text: `Hi Gaurav,\n\nI wanted to you inform you that we have recieved an inquiry from ${name}. Here are the details from submission. \n\nName : ${name} \nEmail : ${email} \nNumber : ${phone} \nMessage : ${message}.\n\nPlease review the information. \n\n\nBest Regards,\nGaurav Mishra \nSoftware Enginner \n7217873350`
    };

    transporter.sendMail(mailOptions1, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'An error occurred. Please try again.' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Your response has been submitted successfully!' });
        }
    });
    transporter.sendMail(mailOptions2, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'An error occurred. Please try again.' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Your response has been submitted successfully!' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});