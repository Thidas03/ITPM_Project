const PDFDocument = require('pdfkit');

/**
 * Generates a PDF receipt as a Buffer.
 * @param {Object} details - Must include courseName, tutorName, price, password, studentName, date, time
 * @returns {Promise<Buffer>} - Resolves with the PDF Buffer
 */
function generatePaymentReceiptPDF(details) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Colors & Fonts Selection ---
            const COLOR_PRIMARY = '#4f46e5'; // Indigo-600
            const COLOR_DARK = '#0f172a';    // Slate-900
            const COLOR_TEXT = '#334155';    // Slate-700
            const COLOR_LIGHT = '#94a3b8';   // Slate-400
            const COLOR_BG = '#f8fafc';      // Slate-50
            const COLOR_BORDER = '#e2e8f0';  // Slate-200

            // --- HEADER ---
            // Branding Logo Area
            doc.rect(0, 0, 595, 120).fill(COLOR_PRIMARY);
            
            doc.fillColor('#ffffff')
               .fontSize(36)
               .font('Helvetica-Bold')
               .text('StuEdu', 50, 45);

            doc.fillColor('#e0e7ff')
               .fontSize(12)
               .font('Helvetica')
               .text('Empowering Your Learning Journey', 50, 85);

            // Invoice Title
            doc.fillColor('#ffffff')
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('RECEIPT', 0, 45, { align: 'right', width: 545 });

            doc.fillColor('#e0e7ff')
               .fontSize(10)
               .font('Helvetica')
               .text(`Date: ${new Date().toLocaleDateString()}`, 0, 75, { align: 'right', width: 545 });

            // --- RECIPEINT INFO ---
            doc.moveDown(5);
            doc.fillColor(COLOR_LIGHT)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('BILLED TO:', 50, 150);

            doc.fillColor(COLOR_DARK)
               .fontSize(14)
               .text(details.studentName || 'Student', 50, 165);

            // --- SESSION DETAILS TABLE ---
            const startY = 220;
            
            // Table Header
            doc.rect(50, startY, 495, 30).fill(COLOR_BG);
            doc.fillColor(COLOR_TEXT)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('DESCRIPTION', 60, startY + 10)
               .text('DETAILS', 350, startY + 10);
               
            doc.moveTo(50, startY + 30).lineTo(545, startY + 30).stroke(COLOR_BORDER);

            // Table Rows
            let currentY = startY + 45;
            const drawRow = (label, value) => {
                doc.fillColor(COLOR_DARK)
                   .fontSize(11)
                   .font('Helvetica-Bold')
                   .text(label, 60, currentY);
                   
                doc.fillColor(COLOR_TEXT)
                   .fontSize(11)
                   .font('Helvetica')
                   .text(value, 350, currentY, { width: 190 });
                   
                currentY += 25;
            };

            drawRow('Course / Session Name', details.courseName || 'N/A');
            drawRow('Tutor Name', details.tutorName || 'N/A');
            drawRow('Session Date', details.date || 'N/A');
            drawRow('Session Time', details.time || 'N/A');
            drawRow('Session Access Password', details.password || 'N/A');

            // Line Separator
            doc.moveTo(50, currentY + 10).lineTo(545, currentY + 10).stroke(COLOR_BORDER);
            
            // --- TOTAL AMOUNT ---
            currentY += 40;
            doc.rect(345, currentY - 10, 200, 40).fill(COLOR_BG);
            doc.fillColor(COLOR_DARK)
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('TOTAL PAID:', 355, currentY)
               .text(`Rs. ${details.price}`, 0, currentY, { align: 'right', width: 535 });

            // --- FOOTER ---
            currentY += 80; // Add padding after Total block
            
            doc.rect(0, currentY, 595, 80).fill('#f1f5f9');
            
            doc.fillColor(COLOR_TEXT)
               .fontSize(10)
               .font('Helvetica')
               .text('Thank you for choosing StuEdu!', 0, currentY + 30, { align: 'center', width: 595 });
               
            doc.fillColor(COLOR_LIGHT)
               .fontSize(9)
               .text('For support, please contact support@stuedu.com', 0, currentY + 45, { align: 'center', width: 595 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generatePaymentReceiptPDF };
