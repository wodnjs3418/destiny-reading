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

// Remove emojis, Chinese characters and markdown from text for PDF compatibility
const cleanText = (text) => {
  if (!text) return '';
  return text
    // Remove emojis and symbols (comprehensive range)
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '')
    // Remove other common symbols
    .replace(/[⚛️⚡🌟👤💼💰💕👨‍👩‍👧‍👦🏥📅🔮💎⚠️📜✨🎯🌙☀️⭐]/g, '')
    // Remove pinyin/romanization in parentheses (before removing Chinese)
    .replace(/\([A-Za-z\s+]+\)/g, '') // Remove (Pinyin romanization)
    .replace(/\([^)]*[\u4e00-\u9fff][^)]*\)/g, '') // Remove parentheses with Chinese
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '') // Remove Chinese characters
    // Clean up leftover punctuation from pinyin
    .replace(/[àáâãäåāăąǎǻȁȃḁạảấầẩẫậắằẳẵặ]/gi, 'a')
    .replace(/[èéêëēĕėęěȅȇḕḗḙḛḝẹẻẽếềểễệ]/gi, 'e')
    .replace(/[ìíîïĩīĭįǐȉȋḭḯỉị]/gi, 'i')
    .replace(/[òóôõöōŏőǒǫȍȏȱṍṏṑṓọỏốồổỗộớờởỡợ]/gi, 'o')
    .replace(/[ùúûüũūŭůűųǔǖǘǚǜȕȗṳṵṷṹṻụủứừửữự]/gi, 'u')
    .replace(/[ỳýŷÿȳỵỷỹ]/gi, 'y')
    .replace(/ñ/gi, 'n')
    .replace(/ç/gi, 'c')
    .replace(/\*\*\*/g, '') // Remove triple asterisks
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/\*/g, '') // Remove single asterisks
    .replace(/##\s*/g, '') // Remove markdown headers
    .replace(/___/g, '') // Remove underscores
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\(\s*\)/g, '') // Remove empty parentheses
    .replace(/\[\s*\]/g, '') // Remove empty brackets
    .replace(/"\s*"/g, '') // Remove empty quotes
    .replace(/&&&/g, '&') // Fix multiple ampersands
    .replace(/\.\.\./g, '') // Remove ellipsis placeholders
    .replace(/\s*-\s*""/g, '') // Remove dangling dashes
    .trim();
};

// Check if text has meaningful content after cleaning
const hasContent = (text) => {
  const cleaned = cleanText(text);
  return cleaned && cleaned.length > 2 && cleaned !== '-' && cleaned !== '...';
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
  let currentPageNum = 1;

  // Helper: Add new page if needed
  const addNewPageIfNeeded = (heightNeeded) => {
    if (yPos + heightNeeded > pageHeight - margin - 10) { // Extra margin for footer
      doc.addPage();
      currentPageNum++;
      drawPageBackground(currentPageNum);
      yPos = margin + 10;
      return true;
    }
    return false;
  };

  // Helper: Draw page background - clean, minimal design
  const drawPageBackground = (pageNum = null) => {
    // Clean cream background - NO watermark patterns
    doc.setFillColor(...COLORS.cream);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Single elegant gold border only
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.4);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Page number at bottom if provided
    if (pageNum !== null && pageNum > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.lightText);
      doc.text(`${pageNum}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    }

    // Footer decorative line
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.2);
    doc.line(pageWidth / 2 - 15, pageHeight - 15, pageWidth / 2 + 15, pageHeight - 15);
  };

  // Helper: Draw section header with decorative elements
  const drawHeader = (text, y) => {
    const cleanedText = cleanText(text).toUpperCase();
    if (!hasContent(cleanedText)) return y;

    // Add some spacing before header
    const startY = y + 3;

    // Decorative line above header (subtle gold accent)
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, startY, pageWidth - margin, startY);

    const headerY = startY + 5;

    // Gold background with gradient effect (simulated with opacity)
    doc.setFillColor(...COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);

    // Split text if too long
    const headerLines = doc.splitTextToSize(cleanedText, contentWidth - 20);
    const headerHeight = 12 + (headerLines.length > 1 ? (headerLines.length - 1) * 5 : 0);

    // Main header box
    doc.rect(margin, headerY, contentWidth, headerHeight, 'F');

    // Subtle shadow effect (darker overlay on edges)
    doc.setFillColor(160, 130, 60);
    doc.rect(margin, headerY + headerHeight - 1, contentWidth, 1, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    headerLines.forEach((line, i) => {
      doc.text(line, margin + 10, headerY + 8 + (i * 5));
    });

    // No decorative circles - clean design
    return headerY + headerHeight + 8;
  };

  // Helper: Draw paragraph with proper wrapping - increased font and spacing for readability
  const drawParagraph = (text, fontSize = 11) => {
    const cleanedText = cleanText(text);

    // Only draw if there's meaningful content
    if (!hasContent(cleanedText)) return;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...COLORS.text);

    const lines = doc.splitTextToSize(cleanedText, contentWidth);
    lines.forEach((line) => {
      addNewPageIfNeeded(7);
      doc.text(line, margin, yPos);
      yPos += 6; // Increased line spacing
    });
    yPos += 4; // Increased paragraph spacing
  };

  // === PAGE 1: COVER ===
  doc.setFillColor(...COLORS.darkBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Helper: Draw element emblem (geometric shapes instead of Chinese characters)
  const drawElementEmblem = (cx, cy, size, elementType) => {
    doc.setDrawColor(45, 45, 55);
    doc.setLineWidth(1.5);
    doc.setFillColor(35, 35, 45);

    switch(elementType) {
      case 'Wood':
        // Tree/growth shape - upward triangle with line
        doc.triangle(cx, cy - size, cx - size * 0.7, cy + size * 0.5, cx + size * 0.7, cy + size * 0.5, 'S');
        doc.line(cx, cy + size * 0.5, cx, cy + size);
        break;
      case 'Fire':
        // Flame shape - pointed upward
        doc.triangle(cx, cy - size, cx - size * 0.6, cy + size * 0.7, cx + size * 0.6, cy + size * 0.7, 'S');
        doc.triangle(cx, cy - size * 0.3, cx - size * 0.3, cy + size * 0.4, cx + size * 0.3, cy + size * 0.4, 'S');
        break;
      case 'Earth':
        // Square/stable shape
        doc.rect(cx - size * 0.7, cy - size * 0.5, size * 1.4, size, 'S');
        doc.line(cx - size * 0.5, cy, cx + size * 0.5, cy);
        break;
      case 'Metal':
        // Circle/coin shape
        doc.circle(cx, cy, size * 0.8, 'S');
        doc.circle(cx, cy, size * 0.4, 'S');
        break;
      case 'Water':
        // Wave shape - three curved lines
        for (let i = -1; i <= 1; i++) {
          const waveY = cy + i * size * 0.5;
          doc.line(cx - size, waveY, cx - size * 0.5, waveY - size * 0.2);
          doc.line(cx - size * 0.5, waveY - size * 0.2, cx, waveY);
          doc.line(cx, waveY, cx + size * 0.5, waveY - size * 0.2);
          doc.line(cx + size * 0.5, waveY - size * 0.2, cx + size, waveY);
        }
        break;
      default:
        doc.circle(cx, cy, size * 0.7, 'S');
    }
  };

  // Single clean border only - no corner accents
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Title - LUMINA brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(...COLORS.gold);
  doc.text('LUMINA', pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('FOUR PILLARS OF DESTINY', pageWidth / 2, 56, { align: 'center' });

  // Simple decorative line
  doc.setFillColor(...COLORS.gold);
  doc.rect(pageWidth / 2 - 25, 64, 50, 0.3, 'F');

  // Small element emblem (minimal, not dominant)
  const emblemY = 95;
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.circle(pageWidth / 2, emblemY, 18, 'S');
  doc.setFillColor(25, 25, 35);
  doc.circle(pageWidth / 2, emblemY, 15, 'F');
  drawElementEmblem(pageWidth / 2, emblemY, 8, element);

  // Element label under emblem
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text(`${element.toUpperCase()} ELEMENT`, pageWidth / 2, emblemY + 28, { align: 'center' });

  // MAIN ATTRACTION - Destiny Type (much bigger and prominent)
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.gold);
  doc.text(`${yinYang} ${element}`, pageWidth / 2, 155, { align: 'center' });

  doc.setFontSize(38);
  doc.text(animal.toUpperCase(), pageWidth / 2, 175, { align: 'center' });

  // Birth info - positioned after main title
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  doc.setFontSize(11);
  doc.setTextColor(140, 140, 140);
  doc.text(`Born: ${months[parseInt(month) - 1]} ${day}, ${year}`, pageWidth / 2, 195, { align: 'center' });

  // Four Pillars box - clean and prominent
  const pillarsY = 215;
  doc.setFillColor(25, 25, 35);
  doc.roundedRect(margin + 10, pillarsY, contentWidth - 20, 50, 4, 4, 'F');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 10, pillarsY, contentWidth - 20, 50, 4, 4, 'S');

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gold);
  doc.text('YOUR FOUR PILLARS', pageWidth / 2, pillarsY + 10, { align: 'center' });

  // Hour element mapping (from animal)
  const animalElements = {
    Rat: 'Water', Ox: 'Earth', Tiger: 'Wood', Rabbit: 'Wood',
    Dragon: 'Earth', Snake: 'Fire', Horse: 'Fire', Goat: 'Earth',
    Monkey: 'Metal', Rooster: 'Metal', Dog: 'Earth', Pig: 'Water'
  };
  const hourElement = hourAnimal ? animalElements[hourAnimal] : null;

  const pillars = [
    { label: 'YEAR', value: element },
    { label: 'MONTH', value: monthElement },
    { label: 'DAY', value: dayElement },
    { label: 'HOUR', value: hourElement || '—' }
  ];
  const pillarWidth = (contentWidth - 40) / 4;

  pillars.forEach((pillar, i) => {
    const x = margin + 20 + (i * pillarWidth) + pillarWidth / 2;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(pillar.label, x, pillarsY + 25, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(220, 220, 220);
    doc.text(pillar.value, x, pillarsY + 40, { align: 'center' });
  });

  // Footer - moved up and larger
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gold);
  doc.text('Personal Destiny Report', pageWidth / 2, pageHeight - 28, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

  // === AI ANALYSIS PAGES ===
  if (aiAnalysis) {
    // Start first analysis page
    doc.addPage();
    currentPageNum++;
    drawPageBackground(currentPageNum);
    yPos = margin;

    // Parse AI analysis into sections
    const sections = aiAnalysis.split(/(?=##\s)/);

    sections.forEach((section, sectionIndex) => {
      if (!section.trim()) return;

      // No automatic new page - let content flow naturally
      // addNewPageIfNeeded will handle page breaks

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
          const subheaderText = cleanText(trimmedLine);

          // Only render if there's meaningful content
          if (hasContent(subheaderText)) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...COLORS.gold);

            // Split text properly to prevent overflow
            const subheaderLines = doc.splitTextToSize(subheaderText, contentWidth);
            const neededHeight = subheaderLines.length * 6 + 5;
            addNewPageIfNeeded(neededHeight);

            subheaderLines.forEach((line, idx) => {
              doc.text(line, margin, yPos + (idx * 6));
            });
            yPos += subheaderLines.length * 6 + 3;
          }
        }
        // Check if it's a numbered list item (1., 2., etc.)
        else if (trimmedLine.match(/^\d+\.\s+/)) {
          const numberMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
          if (numberMatch) {
            const itemNumber = numberMatch[1];
            const itemText = cleanText(numberMatch[2]);

            // Only render if there's meaningful content
            if (hasContent(itemText)) {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(10);
              doc.setTextColor(...COLORS.gold);

              // Calculate space needed
              const testLines = doc.splitTextToSize(itemText, contentWidth - 20);
              const neededHeight = Math.max(testLines.length * 5 + 5, 10);
              addNewPageIfNeeded(neededHeight);

              // Draw number
              doc.text(`${itemNumber}.`, margin, yPos);

              // Draw text with proper wrapping
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(...COLORS.text);
              const itemLines = doc.splitTextToSize(itemText, contentWidth - 20);
              itemLines.forEach((line, idx) => {
                doc.text(line, margin + 12, yPos + (idx * 5));
              });
              yPos += itemLines.length * 5 + 4;
            }
          }
        }
        // Check if it's a bullet point
        else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
          const bulletText = cleanText(trimmedLine.replace(/^[-•]\s*/, ''));

          // Only render if there's meaningful content
          if (hasContent(bulletText)) {
            addNewPageIfNeeded(10);

            // Fancy bullet point (gold square with border)
            const bulletX = margin + 2.5;
            const bulletY = yPos - 2;
            const bulletSize = 2;

            // Draw square bullet with border (more elegant than plain circle)
            doc.setFillColor(...COLORS.gold);
            doc.rect(bulletX, bulletY, bulletSize, bulletSize, 'F');

            // Add subtle border for depth
            doc.setDrawColor(140, 110, 50);
            doc.setLineWidth(0.2);
            doc.rect(bulletX, bulletY, bulletSize, bulletSize, 'S');

            // Bullet text with better formatting
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...COLORS.text);
            const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 15);
            bulletLines.forEach((bulletLine, idx) => {
              doc.text(bulletLine, margin + 10, yPos + (idx * 5));
            });
            yPos += bulletLines.length * 5 + 3;
          }
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

  // Summary shows only core info - Lucky values are detailed in the AI analysis section
  const summaryItems = [
    { label: 'Dominant Element', value: element },
    { label: 'Chinese Zodiac', value: animal },
    { label: 'Energy Type', value: yinYang },
    { label: 'Life Path Number', value: lifePath.toString() },
    { label: 'Month Element', value: monthElement },
    { label: 'Day Element', value: dayElement }
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
