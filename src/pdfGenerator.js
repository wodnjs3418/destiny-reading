import jsPDF from 'jspdf';

const COLORS = {
  gold: [178, 144, 72],
  darkBg: [20, 20, 28],
  text: [50, 50, 50],
  lightText: [120, 120, 120],
  white: [255, 255, 255],
  cream: [252, 250, 245]
};

const ELEMENT_COLORS = {
  Wood: [76, 125, 79],
  Fire: [198, 86, 57],
  Earth: [166, 136, 88],
  Metal: [158, 158, 168],
  Water: [70, 110, 150]
};

// Remove Chinese characters and markdown from text for PDF compatibility
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '') // Remove Chinese
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/##\s*/g, '') // Remove markdown headers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\(\s*\)/g, '') // Remove empty parentheses
    .replace(/"\s*"/g, '') // Remove empty quotes
    .trim();
};

export const generatePDF = (birthData, analysis, aiAnalysis = '') => {
  const { year, month, day, hour } = birthData;
  const { element, animal, yinYang, monthElement, dayElement, hourAnimal, lifePath, luckyNumbers, luckyColors, luckyDirection } = analysis;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper: Add new page if needed
  const addNewPageIfNeeded = (heightNeeded) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      drawPageBackground();
      yPos = margin + 10;
      return true;
    }
    return false;
  };

  // Helper: Draw page background
  const drawPageBackground = () => {
    doc.setFillColor(...COLORS.cream);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(200, 190, 170);
    doc.setLineWidth(0.3);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  };

  // Helper: Draw section header
  const drawHeader = (text, y) => {
    doc.setFillColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(cleanText(text).toUpperCase(), margin + 5, y + 8);
    return y + 18;
  };

  // Helper: Draw paragraph with proper wrapping
  const drawParagraph = (text, fontSize = 10) => {
    const cleanedText = cleanText(text);
    if (!cleanedText) return;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...COLORS.text);

    const lines = doc.splitTextToSize(cleanedText, contentWidth);
    lines.forEach((line) => {
      addNewPageIfNeeded(6);
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 3;
  };

  // === PAGE 1: COVER ===
  doc.setFillColor(...COLORS.darkBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Watermark - Chinese characters in background (龍 = Dragon)
  doc.setFontSize(180);
  doc.setTextColor(25, 25, 35); // Very dark, barely visible
  doc.setFont('helvetica', 'bold');
  doc.text('龍', pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });

  // Triple decorative borders (Certificate-style)
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
  doc.setLineWidth(0.3);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Corner ornaments (decorative L-shapes in corners)
  const cornerSize = 12;
  // Top-left
  doc.setLineWidth(1.5);
  doc.line(15, 15, 15 + cornerSize, 15);
  doc.line(15, 15, 15, 15 + cornerSize);
  // Top-right
  doc.line(pageWidth - 15, 15, pageWidth - 15 - cornerSize, 15);
  doc.line(pageWidth - 15, 15, pageWidth - 15, 15 + cornerSize);
  // Bottom-left
  doc.line(15, pageHeight - 15, 15 + cornerSize, pageHeight - 15);
  doc.line(15, pageHeight - 15, 15, pageHeight - 15 - cornerSize);
  // Bottom-right
  doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 15 - cornerSize, pageHeight - 15);
  doc.line(pageWidth - 15, pageHeight - 15, pageWidth - 15, pageHeight - 15 - cornerSize);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(48);
  doc.setTextColor(...COLORS.gold);
  doc.text('LUMINA', pageWidth / 2, 55, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(180, 180, 180);
  doc.text('FOUR PILLARS OF DESTINY', pageWidth / 2, 68, { align: 'center' });

  // Decorative line
  doc.setFillColor(...COLORS.gold);
  doc.rect(pageWidth / 2 - 40, 75, 80, 0.5, 'F');

  // Element symbol area
  doc.setFillColor(30, 30, 40);
  doc.roundedRect(pageWidth / 2 - 35, 85, 70, 70, 5, 5, 'F');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth / 2 - 35, 85, 70, 70, 5, 5, 'S');

  // Element name in the box
  doc.setFontSize(32);
  doc.setTextColor(...ELEMENT_COLORS[element]);
  doc.text(element.toUpperCase(), pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.gold);
  doc.text('ELEMENT', pageWidth / 2, 130, { align: 'center' });

  // Main destiny text
  doc.setFontSize(26);
  doc.setTextColor(...COLORS.gold);
  doc.text(`${yinYang} ${element}`, pageWidth / 2, 175, { align: 'center' });
  doc.text(animal, pageWidth / 2, 190, { align: 'center' });

  // Birth info
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  doc.setFontSize(11);
  doc.setTextColor(160, 160, 160);
  doc.text(`Born: ${months[parseInt(month) - 1]} ${day}, ${year}`, pageWidth / 2, 210, { align: 'center' });

  // Four Pillars box
  doc.setFillColor(25, 25, 35);
  doc.roundedRect(margin + 10, 225, contentWidth - 20, 45, 3, 3, 'F');
  doc.setDrawColor(...COLORS.gold);
  doc.roundedRect(margin + 10, 225, contentWidth - 20, 45, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gold);
  doc.text('THE FOUR PILLARS', pageWidth / 2, 235, { align: 'center' });

  const pillars = [
    { label: 'YEAR', value: element },
    { label: 'MONTH', value: monthElement },
    { label: 'DAY', value: dayElement },
    { label: 'HOUR', value: hourAnimal || 'N/A' }
  ];
  const pillarWidth = (contentWidth - 40) / 4;

  pillars.forEach((pillar, i) => {
    const x = margin + 20 + (i * pillarWidth) + pillarWidth / 2;
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(pillar.label, x, 248, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(pillar.value, x, 260, { align: 'center' });
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Personal Destiny Report', pageWidth / 2, 282, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 289, { align: 'center' });

  // === AI ANALYSIS PAGES ===
  if (aiAnalysis) {
    // Parse AI analysis into sections
    const sections = aiAnalysis.split(/(?=##\s)/);

    sections.forEach((section, sectionIndex) => {
      if (!section.trim()) return;

      // Start new page for each major section (or first section)
      if (sectionIndex === 0 || section.startsWith('##')) {
        doc.addPage();
        drawPageBackground();
        yPos = margin;
      }

      // Split section into lines
      const lines = section.split('\n');

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          yPos += 3;
          return;
        }

        // Check if it's a header (## or starts with number and emoji)
        if (trimmedLine.startsWith('##') || trimmedLine.match(/^\d+\.\s*[🌟👤💼💰💕👨‍👩‍👧‍👦🏥📅🔮💎⚠️📜]/)) {
          addNewPageIfNeeded(25);
          const headerText = cleanText(trimmedLine.replace(/^##\s*/, '').replace(/^\d+\.\s*/, ''));
          yPos = drawHeader(headerText, yPos);
        }
        // Check if it's a subheader (starts with **)
        else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          addNewPageIfNeeded(15);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(...COLORS.gold);
          doc.text(cleanText(trimmedLine), margin, yPos);
          yPos += 8;
        }
        // Check if it's a bullet point
        else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
          addNewPageIfNeeded(8);
          doc.setFillColor(...COLORS.gold);
          doc.circle(margin + 2, yPos - 1.5, 1, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...COLORS.text);
          const bulletText = cleanText(trimmedLine.replace(/^[-•]\s*/, ''));
          const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 10);
          bulletLines.forEach((bulletLine) => {
            doc.text(bulletLine, margin + 7, yPos);
            yPos += 5;
          });
          yPos += 2;
        }
        // Regular paragraph
        else {
          drawParagraph(trimmedLine, 10);
        }
      });
    });
  }

  // === FINAL PAGE: SUMMARY ===
  doc.addPage();
  doc.setFillColor(...COLORS.darkBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.gold);
  doc.text('Your Cosmic Summary', pageWidth / 2, 45, { align: 'center' });

  // Decorative line
  doc.setFillColor(...COLORS.gold);
  doc.rect(pageWidth / 2 - 30, 52, 60, 0.5, 'F');

  // Summary box
  doc.setFillColor(30, 30, 40);
  doc.roundedRect(margin + 10, 65, contentWidth - 20, 100, 5, 5, 'F');

  const summaryItems = [
    { label: 'Core Element', value: element },
    { label: 'Animal Sign', value: animal },
    { label: 'Yin/Yang', value: yinYang },
    { label: 'Life Path Number', value: lifePath.toString() },
    { label: 'Lucky Numbers', value: luckyNumbers.join(', ') },
    { label: 'Lucky Colors', value: luckyColors.join(', ') },
    { label: 'Lucky Direction', value: luckyDirection }
  ];

  summaryItems.forEach((item, i) => {
    const y = 82 + (i * 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(160, 160, 160);
    doc.text(item.label + ':', margin + 25, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(item.value, margin + 85, y);
  });

  // Final wisdom message
  doc.setFillColor(...COLORS.gold);
  doc.rect(margin + 20, 180, contentWidth - 40, 0.3, 'F');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(180, 180, 180);
  const finalMessage = "The ancient wisdom of BaZi has illuminated your path. Use these insights to navigate life with greater clarity and purpose. Remember: the stars reveal tendencies, not certainties. Your choices ultimately shape your destiny.";
  const finalLines = doc.splitTextToSize(finalMessage, contentWidth - 30);
  finalLines.forEach((line, i) => {
    doc.text(line, pageWidth / 2, 195 + (i * 7), { align: 'center' });
  });

  doc.setFillColor(...COLORS.gold);
  doc.rect(margin + 20, 235, contentWidth - 40, 0.3, 'F');

  // Thank you message
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(140, 140, 140);
  doc.text('Thank you for choosing Lumina', pageWidth / 2, 250, { align: 'center' });
  doc.text('for your cosmic journey.', pageWidth / 2, 258, { align: 'center' });

  // Footer logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.gold);
  doc.text('LUMINA', pageWidth / 2, 278, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('www.lumina-destiny.com', pageWidth / 2, 286, { align: 'center' });

  return doc;
};

export const downloadPDF = (birthData, analysis, aiAnalysis = '') => {
  const doc = generatePDF(birthData, analysis, aiAnalysis);
  const fileName = `Lumina_Destiny_${analysis.element}_${analysis.animal}.pdf`;
  doc.save(fileName);
  return fileName;
};

// PDF를 Base64로 변환 (이메일 전송용)
export const generatePDFBase64 = (birthData, analysis, aiAnalysis = '') => {
  const doc = generatePDF(birthData, analysis, aiAnalysis);
  const pdfOutput = doc.output('datauristring');
  // data:application/pdf;filename=generated.pdf;base64,JVBERi0xLjM... 형식에서 base64 부분만 추출
  const base64 = pdfOutput.split(',')[1];
  return base64;
};
