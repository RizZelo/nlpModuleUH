// Simple PDF export for structured CV
// Uses jsPDF to generate a printable CV from structured data

import { jsPDF } from 'jspdf';

// Clean text function to handle encoding issues
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
};

const addSectionTitle = (doc, title, y) => {
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text(title, 14, y);
  doc.setDrawColor(200);
  doc.line(14, y + 2, 196, y + 2);
  return y + 8;
};

const addParagraph = (doc, text, y, maxWidth = 182, fontSize = 11) => {
  doc.setFontSize(fontSize);
  doc.setTextColor(60, 60, 60);
  const cleanedText = cleanText(text);
  if (!cleanedText) return y;
  
  const lines = doc.splitTextToSize(cleanedText, maxWidth);
  lines.forEach((line, idx) => {
    const currentY = y + (idx * (fontSize * 0.4 + 1.5));
    if (currentY > 280) {
      doc.addPage();
      y = 14 - (idx * (fontSize * 0.4 + 1.5));
    }
    doc.text(line.trim(), 14, y + (idx * (fontSize * 0.4 + 1.5)), { maxWidth: maxWidth, align: 'left' });
  });
  return y + lines.length * (fontSize * 0.4 + 1.5) + 1;
};

const addBulletList = (doc, items = [], y, maxWidth = 175, fontSize = 11) => {
  doc.setFontSize(fontSize);
  items.forEach((it) => {
    const cleanedItem = cleanText(it);
    if (!cleanedItem) return;
    
    const bulletText = `• ${cleanedItem}`;
    const lines = doc.splitTextToSize(bulletText, maxWidth);
    lines.forEach((line, idx) => {
      const currentY = y + (idx * (fontSize * 0.4 + 1.5));
      if (currentY > 280) {
        doc.addPage();
        y = 14 - (idx * (fontSize * 0.4 + 1.5));
      }
      doc.text(line.trim(), 18, y + (idx * (fontSize * 0.4 + 1.5)), { maxWidth: maxWidth, align: 'left' });
    });
    y += lines.length * (fontSize * 0.4 + 1.5) + 1;
  });
  return y;
};

export function exportStructuredCVToPdf(structuredCV = {}) {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    let y = 14;

    const contact = structuredCV.contact || {};
    const name = contact.name || 'Candidate';

    // Helper function to check page overflow
    const checkPageOverflow = (currentY, neededSpace = 15) => {
      if (currentY + neededSpace > 280) {
        doc.addPage();
        return 14;
      }
      return currentY;
    };

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text(cleanText(name), 14, y, { maxWidth: 182 });
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const contactLine = [contact.email, contact.phone, contact.location]
      .filter(Boolean)
      .map(cleanText)
      .join('  |  ');
    if (contactLine) {
      doc.setTextColor(90, 90, 90);
      doc.text(contactLine, 14, y, { maxWidth: 182 });
      y += 8;
    }

    // Summary
    if (structuredCV.summary && structuredCV.summary !== 'Not provided') {
      y = addSectionTitle(doc, 'Summary', y);
      y = addParagraph(doc, structuredCV.summary, y);
      y += 4;
    }

    // Experience
    const exp = Array.isArray(structuredCV.experience) ? structuredCV.experience : [];
    if (exp.length) {
      y = checkPageOverflow(y, 20);
      y = addSectionTitle(doc, 'Experience', y);
      exp.forEach((e) => {
        y = checkPageOverflow(y, 25);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const titleText = cleanText(`${e.title || ''} ${e.company ? ' - ' + e.company : ''}`);
        doc.text(titleText, 14, y, { maxWidth: 182 });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const meta = [e.location, [e.startDate, e.endDate].filter(Boolean).join(' – ')]
          .filter(Boolean)
          .map(cleanText)
          .join('  |  ');
        if (meta) {
          doc.text(meta, 14, y, { maxWidth: 182 });
          y += 5;
        }
        if (e.description && e.description !== 'Not provided') {
          y = addParagraph(doc, e.description, y);
        }
        if (Array.isArray(e.bullets) && e.bullets.length) {
          y = addBulletList(doc, e.bullets, y);
        }
        y += 3;
      });
      y += 2;
    }

    // Education
    const edu = Array.isArray(structuredCV.education) ? structuredCV.education : [];
    if (edu.length) {
      y = checkPageOverflow(y, 20);
      y = addSectionTitle(doc, 'Education', y);
      edu.forEach((ed) => {
        y = checkPageOverflow(y, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const eduText = cleanText(`${ed.degree || ''} ${ed.institution ? ' - ' + ed.institution : ''}`);
        doc.text(eduText, 14, y, { maxWidth: 182 });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const meta = [ed.location, [ed.startDate, ed.endDate].filter(Boolean).join(' – ')]
          .filter(Boolean)
          .map(cleanText)
          .join('  |  ');
        if (meta) {
          doc.text(meta, 14, y, { maxWidth: 182 });
          y += 5;
        }
        if (ed.description && ed.description !== 'Not provided') {
          y = addParagraph(doc, ed.description, y);
        }
        y += 3;
      });
      y += 2;
    }

    // Projects
    const projects = Array.isArray(structuredCV.projects) ? structuredCV.projects : [];
    if (projects.length) {
      y = checkPageOverflow(y, 20);
      y = addSectionTitle(doc, 'Projects', y);
      projects.forEach((p) => {
        y = checkPageOverflow(y, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(cleanText(p.name || ''), 14, y, { maxWidth: 182 });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (p.description && p.description !== 'Not provided') {
          y = addParagraph(doc, p.description, y);
        }
        const techs = Array.isArray(p.technologies) ? p.technologies.map(cleanText).join(', ') : '';
        if (techs) {
          y = addParagraph(doc, `Tech: ${techs}`, y);
        }
        y += 3;
      });
      y += 2;
    }

    // Skills
    const skills = structuredCV.skills || {};
    const categories = Object.keys(skills).filter((k) => Array.isArray(skills[k]) && skills[k].length);
    if (categories.length) {
      y = checkPageOverflow(y, 20);
      y = addSectionTitle(doc, 'Skills', y);
      categories.forEach((cat) => {
        y = checkPageOverflow(y, 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), 14, y, { maxWidth: 182 });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        y = addParagraph(doc, skills[cat].join(', '), y);
        y += 2;
      });
      y += 2;
    }

    // Certifications
    const certs = Array.isArray(structuredCV.certifications) ? structuredCV.certifications : [];
    if (certs.length) {
      y = checkPageOverflow(y, 20);
      y = addSectionTitle(doc, 'Certifications', y);
      certs.forEach((c) => {
        y = checkPageOverflow(y, 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${c.name || ''}${c.issuer ? ' - ' + c.issuer : ''}`, 14, y, { maxWidth: 182 });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const meta = [c.date, c.credential].filter(Boolean).join('  |  ');
        if (meta) { doc.text(meta, 14, y, { maxWidth: 182 }); y += 5; }
      });
      y += 2;
    }

    // Activities
    const acts = Array.isArray(structuredCV.activities) ? structuredCV.activities : [];
    if (acts.length) {
      y = checkPageOverflow(y, 20);
      y = addSectionTitle(doc, 'Activities', y);
      acts.forEach((a) => {
        y = checkPageOverflow(y, 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${a.organization || ''}${a.title ? ' - ' + a.title : ''}`, 14, y, { maxWidth: 182 });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const meta = [[a.startDate, a.endDate].filter(Boolean).join(' – ')].filter(Boolean).join('');
        if (meta) { doc.text(meta, 14, y, { maxWidth: 182 }); y += 5; }
        if (a.description && a.description !== 'Not provided') {
          y = addParagraph(doc, a.description, y);
        }
        y += 2;
      });
    }


    // Other Sections (dynamic)
    const otherSections = structuredCV.other_sections || {};
    Object.entries(otherSections).forEach(([sectionName, sectionData]) => {
      if (!Array.isArray(sectionData) || !sectionData.length) return;
      const displayName = sectionName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      y = addSectionTitle(doc, displayName, y);
      sectionData.forEach((item) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (typeof item === 'object') {
          const text = Object.entries(item)
            .filter(([k, v]) => k !== 'id' && v && v !== 'Not provided')
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
            .join(' | ');
          if (text) {
            y = addParagraph(doc, text, y);
          }
        } else {
          y = addParagraph(doc, String(item), y);
        }
        y += 2;
        if (y > 270) { doc.addPage(); y = 14; }
      });
    });

  doc.save(`${name.replace(/\s+/g, '_')}_CV.pdf`);
  } catch (e) {
    console.error('Failed to export PDF:', e);
    alert('Failed to export PDF.');
  }
}