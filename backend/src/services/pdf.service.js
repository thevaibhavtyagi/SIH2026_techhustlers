const PDFDocument = require('pdfkit');

const generateInvestigationReport = (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // 1. Header Section
      doc.fontSize(20).font('Helvetica-Bold').text('MPLADS Investigation Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // 2. Metadata Table
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Project Details');
      doc.moveDown(0.5);
      
      const drawField = (label, value) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569').text(`${label}: `, { continued: true })
           .font('Helvetica').fillColor('#0f172a').text(value || 'N/A');
        doc.moveDown(0.5);
      };

      drawField('Work ID', reportData.workId);
      drawField('State', reportData.state);
      drawField('Constituency', reportData.constituency);
      doc.moveDown(1);

      // 3. Risk Information
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Risk Assessment');
      doc.moveDown(0.5);
      drawField('Risk Score', `${reportData.riskScore ?? '—'} / 100`);
      drawField('Risk Level', reportData.riskLevel);
      drawField('Priority', reportData.priority);
      drawField('Detection Confidence', reportData.confidence);
      drawField('Primary Signal', reportData.primarySignal);
      doc.moveDown(1.5);

      // 4. Grounded AI Narrative
      doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Investigation Findings');
      doc.moveDown(0.5);
      
      doc.fontSize(11).font('Helvetica').fillColor('#1e293b').text(
        reportData.report || 'No narrative report has been generated for this work yet.',
        {
          align: 'justify',
          lineGap: 4
        }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvestigationReport
};
