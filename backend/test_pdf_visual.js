const { generatePaymentReceiptPDF } = require('./utils/pdfGenerator');
const fs = require('fs');

async function test() {
    try {
        const details = {
            studentName: 'Thidas Rathnayake',
            courseName: 'Advanced Web Engineering',
            tutorName: 'Dr. Smith',
            price: 5500,
            password: 'STU_PASS_123',
            date: new Date().toDateString(),
            time: '14:00 - 16:00'
        };

        const pdfBuffer = await generatePaymentReceiptPDF(details);
        fs.writeFileSync('test_invoice.pdf', pdfBuffer);
        console.log('PDF generated successfully at test_invoice.pdf');
    } catch(err) {
        console.error(err);
    }
}

test();
