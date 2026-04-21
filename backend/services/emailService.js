const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends a session confirmation email to the student.
 * @param {string} to - Student's email address
 * @param {object} details - Session details (courseName, tutorName, password, price)
 * @param {Buffer} [pdfBuffer] - Optional PDF receipt buffer to attach
 */
async function sendSessionConfirmation(to, details, pdfBuffer) {
    const { courseName, tutorName, password, price } = details;

    const mailOptions = {
        from: `"StuEdu Support" <${process.env.SMTP_USER}>`,
        to: to,
        subject: `Confirmation: You're enrolled in ${courseName}!`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6366f1;">Enrollment Confirmed!</h2>
                <p>Hi there,</p>
                <p>Thank you for your payment. You are now enrolled in <strong>${courseName}</strong>.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Class Details:</h3>
                    <p><strong>Course:</strong> ${courseName}</p>
                    <p><strong>Tutor:</strong> ${tutorName}</p>
                    <p><strong>Password to Join:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
                </div>

                <div style="margin: 20px 0;">
                    <h3>Receipt:</h3>
                    <p><strong>Amount Paid:</strong> Rs. ${price}</p>
                    <p style="font-size: 14px; margin-top: 10px; color: #16a34a;"><strong>Note:</strong> A detailed PDF receipt is attached to this email for your records.</p>
                </div>

                <p>Please keep this email for your records. You can use the password above to join the class at the scheduled time.</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #94a3b8;">If you have any questions, please contact our support team.</p>
            </div>
        `,
    };

    if (pdfBuffer) {
        mailOptions.attachments = [
            {
                filename: `StuEdu_Receipt_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ];
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

/**
 * Sends a generic notification email (e.g. for Cron Job reminders)
 * @param {string} to - User's email address
 * @param {string} title - Email subject
 * @param {string} message - Email content
 */
async function sendNotificationEmail(to, title, message) {
    const mailOptions = {
        from: `"StuEdu Notifications" <${process.env.SMTP_USER}>`,
        to: to,
        subject: title,
        text: message, // Can be converted to HTML later if needed
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Notification email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }
}

module.exports = { sendSessionConfirmation, sendNotificationEmail };
