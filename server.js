// server.js
const express = require('express');
const bodyParser = require('body-parser'); // kept as you used it
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();  // Load environment variables

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail (or G Suite) address
    pass: process.env.EMAIL_PASS  // app password or account password (app password recommended)
  }
});

// Verify SMTP connection at startup
transporter.verify((err, success) => {
  if (err) {
    console.error('Error verifying SMTP transporter:', err);
  } else {
    console.log('SMTP transporter verified and ready to send messages');
  }
});

// POST route to handle form submission
app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    // Mail to user (confirmation)
    const mailOptions1 = {
      from: process.env.EMAIL_USER,
      to: email,
      replyTo: process.env.EMAIL_USER,
      subject: 'Thank You for Reaching Out!',
      text: `Dear ${name},\n\nThank you for taking the time to submit the form. We have successfully received your information. \n\n---Your Response--- \nName : ${name} \nEmail : ${email} \nNumber : ${phone || 'N/A'} \nMessage : ${message || 'N/A'} \n\nI will review the details you’ve shared and will get back to you as soon as possible. If you have any questions or need further assistance in the meantime, please feel free to contact us at Email : ${process.env.EMAIL_USER}.\n\nWe appreciate your interest and look forward to connecting with you soon.\n\nBest Regards,\nGaurav Mishra \nSoftware Engineer \n7217873350`
    };

    // Mail to owner (notification) - do NOT set from:user-supplied-email; use your authenticated sender
    const mailOptions2 = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email, // so you can reply directly to the submitter
      subject: `New Inquiry Received from ${name}`,
      text: `Hi Gaurav,\n\nI wanted to inform you that we have received an inquiry from ${name}. Here are the details from submission. \n\nName : ${name} \nEmail : ${email} \nNumber : ${phone || 'N/A'} \nMessage : ${message || 'N/A'}.\n\nPlease review the information.\n\nBest Regards,\nWebsite Contact Form`
    };

    // Send both emails concurrently and wait
    const [result1, result2] = await Promise.all([
      transporter.sendMail(mailOptions1),
      transporter.sendMail(mailOptions2)
    ]);

    console.log('Confirmation email sent:', result1 && result1.response ? result1.response : 'sent');
    console.log('Notification email sent:', result2 && result2.response ? result2.response : 'sent');

    // Single success response
    return res.status(200).json({ message: 'Your response has been submitted successfully!' });
  } catch (error) {
    console.error('Error sending emails:', error);

    // If nodemailer provides response details, log them
    if (error && error.response) {
      console.error('Nodemailer response:', error.response);
    }

    return res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
