require('dotenv').config();
const { sendSessionConfirmation } = require('./services/emailService');
const { generatePaymentReceiptPDF } = require('./utils/pdfGenerator');

async function testPdfEmail() {
    try {
        console.log("Generating dummy PDF receipt...");
        const details = {
            courseName: 'Test Automation 101',
            tutorName: 'Antigravity AI',
            password: 'SUPER_SECURE_PASS',
            price: '99.99'
        };
        const pdfBuffer = await generatePaymentReceiptPDF(details);
        
        console.log("PDF generated, attaching and sending email...");
        await sendSessionConfirmation('tmageepan@gmail.com', details, pdfBuffer);
        console.log("✅ Success! Check your personal Gmail inbox for the email and the attached PDF.");
    } catch(e) {
        console.error("❌ Failed:", e);
    }
}

testPdfEmail();
