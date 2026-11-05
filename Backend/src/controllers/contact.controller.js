const transporter = require("../config/mailer");

// Send Contact Form Details to Gmail
const sendContactEmail = async (req, res) => {
  try {
    // 1. Get data from frontend
    const { name, email, phone, message } = req.body;

    // 2. Validate required fields
    if (!name || !email || !message || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    // 2. Phone validation —
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    // 3. Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_RECEIVER,
      replyTo: email,
      subject: `Furniture Showroom - Contact Message from ${name}`,
      text: `Customer Name: ${name}
Customer Email: ${email}
Customer Phone: ${phone}

Message:
${message}`,
    };

    // 5. Send email using Nodemailer
    await transporter.sendMail(mailOptions);

    // 6. Send success response to frontend
    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    // 7. Handle errors
    console.error("Contact Email Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send your message. Please try again later.",
    });
  }
};
// Export controller function
module.exports = { sendContactEmail };
