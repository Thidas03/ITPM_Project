const PDFDocument = require('pdfkit');

/**
 * Generates a PDF receipt as a Buffer.
 * @param {Object} details - Must include courseName, tutorName, price, date
 * @returns {Promise<Buffer>} - Resolves with the PDF Buffer
 */
function generatePaymentReceiptPDF(details) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Branding Header
            doc.fillColor('#6366f1')
               .fontSize(28)
               .text('StuEdu', { align: 'center' });
            
            doc.fillColor('#475569')
               .fontSize(10)
               .text('Payment Receipt & Session Confirmation', { align: 'center' })
               .moveDown(2);

            // Separator Line
            doc.moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke('#e2e8f0');
            doc.moveDown(1.5);

            // Receipt Details
            doc.fillColor('#000000')
               .fontSize(16)
               .text('Receipt Details')
               .moveDown(0.5);

            doc.fontSize(12)
               .text(`Date of Issue: ${new Date().toLocaleDateString()}`)
               .moveDown(0.5)
               .text(`Course Name: ${details.courseName}`)
               .moveDown(0.5)
               .text(`Tutor Name: ${details.tutorName}`)
               .moveDown(0.5)
               .text(`Class Password: ${details.password || 'N/A'}`);

            doc.moveDown(2);

            // Payment Amount
            const amountY = doc.y;
            doc.rect(50, amountY, 500, 40).fill('#f8fafc');
            doc.fillColor('#0f172a')
               .fontSize(14)
               .text(`Total Paid: Rs. ${details.price}`, 70, amountY + 12);

            doc.moveDown(4);

            // Footer
            doc.fontSize(10)
               .fillColor('#94a3b8')
               .text('Thank you for choosing StuEdu for your learning journey.', { align: 'center' })
               .text('If you have any questions, contact our support team.', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generatePaymentReceiptPDF };
