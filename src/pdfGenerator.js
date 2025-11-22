import jsPDF from 'jspdf';
import { ELEMENT_ANALYSIS, ANIMAL_ANALYSIS, TEN_YEAR_FORECAST, WEALTH_ANALYSIS } from './analysisContent';

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

// Remove Chinese characters from text for PDF compatibility
const cleanText = (text) => {
  if (!text) return '';
  // Remove Chinese characters and clean up the text
  return text
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '') // Remove Chinese
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\(\s*\)/g, '') // Remove empty parentheses
    .replace(/"\s*"/g, '') // Remove empty quotes
    .replace(/,\s*,/g, ',') // Remove double commas
    .replace(/\s*-\s*-\s*/g, ' - ') // Fix double dashes
    .trim();
};

export const generatePDF = (birthData, analysis) => {
  const { year, month, day, hour } = birthData;
  const { element, animal, yinYang, monthElement, dayElement, hourAnimal, lifePath, luckyNumbers, luckyColors, luckyDirection, compatibility } = analysis;

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
    // Subtle border
    doc.setDrawColor(200, 190, 170);
    doc.setLineWidth(0.3);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  };

  // Helper: Draw section header
  const drawHeader = (text, y, icon = '') => {
    doc.setFillColor(...COLORS.gold);
    doc.rect(margin, y, contentWidth, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(icon + text.toUpperCase(), margin + 5, y + 8);
    return y + 18;
  };

  // Helper: Draw subheader
  const drawSubheader = (text, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.gold);
    doc.text(text, margin, y);
    return y + 7;
  };

  // Helper: Draw paragraph with proper wrapping
  const drawParagraph = (text, y, fontSize = 10, indent = 0) => {
    const cleanedText = cleanText(text);
    if (!cleanedText) return y;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...COLORS.text);

    const lines = doc.splitTextToSize(cleanedText, contentWidth - indent);
    lines.forEach((line, index) => {
      if (addNewPageIfNeeded(5)) {
        // Reset after new page
      }
      doc.text(line, margin + indent, yPos);
      yPos += 5;
    });
    return yPos + 3;
  };

  // Helper: Draw bullet list with proper wrapping
  const drawBulletList = (items, startY) => {
    yPos = startY;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);

    items.forEach((item) => {
      const cleanedItem = cleanText(item);
      if (!cleanedItem) return;

      addNewPageIfNeeded(8);

      // Draw bullet
      doc.setFillColor(...COLORS.gold);
      doc.circle(margin + 2, yPos - 1.5, 1, 'F');

      // Wrap text
      const lines = doc.splitTextToSize(cleanedItem, contentWidth - 10);
      lines.forEach((line, lineIndex) => {
        doc.text(line, margin + 7, yPos);
        yPos += 5;
      });
      yPos += 2;
    });
    return yPos + 3;
  };

  // Helper: Draw info box
  const drawInfoBox = (title, content, y, bgColor = [245, 242, 235]) => {
    const cleanedContent = cleanText(content);
    const lines = doc.splitTextToSize(cleanedContent, contentWidth - 16);
    const boxHeight = 18 + (lines.length * 5);

    addNewPageIfNeeded(boxHeight + 5);

    doc.setFillColor(...bgColor);
    doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gold);
    doc.text(title, margin + 8, yPos + 10);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    lines.forEach((line, i) => {
      doc.text(line, margin + 8, yPos + 18 + (i * 5));
    });

    yPos += boxHeight + 8;
    return yPos;
  };

  // === PAGE 1: COVER ===
  doc.setFillColor(...COLORS.darkBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative borders
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.3);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // Corner decorations
  const cornerSize = 15;
  [[15, 15], [pageWidth - 15, 15], [15, pageHeight - 15], [pageWidth - 15, pageHeight - 15]].forEach(([x, y]) => {
    doc.setLineWidth(0.5);
    doc.line(x - 5, y, x + 5, y);
    doc.line(x, y - 5, x, y + 5);
  });

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

  // === PAGE 2: YOUR ELEMENT ===
  doc.addPage();
  drawPageBackground();
  yPos = margin;

  yPos = drawHeader(`Your Core Element: ${element}`, yPos);

  const elementData = ELEMENT_ANALYSIS[element];

  // Clean overview text (remove Chinese)
  yPos = drawParagraph(elementData.overview, yPos, 10);
  yPos += 5;

  yPos = drawSubheader('Your Natural Strengths', yPos);
  yPos = drawBulletList(elementData.personality.strengths, yPos);

  yPos = drawSubheader('Areas for Growth', yPos);
  yPos = drawBulletList(elementData.personality.challenges, yPos);

  yPos = drawInfoBox('Ancient Wisdom', elementData.personality.advice, yPos);

  // === PAGE 3: ANIMAL SIGN ===
  doc.addPage();
  drawPageBackground();
  yPos = margin;

  yPos = drawHeader(`Year of the ${animal}`, yPos);

  const animalData = ANIMAL_ANALYSIS[animal];
  yPos = drawParagraph(animalData.overview, yPos, 10);
  yPos += 5;

  yPos = drawSubheader('Core Character Traits', yPos);
  yPos = drawBulletList(animalData.traits, yPos);

  // Lucky elements in a nice box
  doc.setFillColor(248, 246, 240);
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.gold);
  doc.text('Your Lucky Elements', margin + 10, yPos + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.text(`Lucky Numbers: ${animalData.lucky.numbers.join(', ')}`, margin + 10, yPos + 24);
  doc.text(`Lucky Colors: ${animalData.lucky.colors.join(', ')}`, margin + 10, yPos + 34);
  doc.text(`Lucky Direction: ${animalData.lucky.direction}`, margin + 10, yPos + 44);

  yPos += 60;

  yPos = drawSubheader('Love & Compatibility', yPos);
  yPos = drawParagraph(animalData.love, yPos, 10);

  // === PAGE 4: CAREER & WEALTH ===
  doc.addPage();
  drawPageBackground();
  yPos = margin;

  yPos = drawHeader('Career & Wealth Destiny', yPos);

  yPos = drawSubheader('Ideal Career Paths', yPos);
  yPos = drawBulletList(elementData.career.ideal, yPos);

  yPos = drawParagraph(elementData.career.strengths, yPos, 10);
  yPos += 3;

  yPos = drawInfoBox('Career Guidance', elementData.career.warning, yPos, [255, 248, 240]);

  yPos = drawSubheader('Wealth & Prosperity Profile', yPos);
  const wealthData = WEALTH_ANALYSIS[element];
  yPos = drawParagraph(`Investment Style: ${wealthData.tendency}`, yPos, 10);
  yPos = drawParagraph(wealthData.advice, yPos, 10);

  yPos = drawSubheader('Lucky Industries for You', yPos);
  yPos = drawBulletList(elementData.wealth.lucky_industries, yPos);

  // === PAGE 5: HEALTH & WELLNESS ===
  doc.addPage();
  drawPageBackground();
  yPos = margin;

  yPos = drawHeader('Health & Wellness', yPos);

  yPos = drawSubheader('Body-Element Connection', yPos);
  yPos = drawParagraph(elementData.health.organs, yPos, 10);

  yPos = drawSubheader('Health Awareness Areas', yPos);
  yPos = drawParagraph(elementData.health.vulnerabilities, yPos, 10);

  yPos = drawSubheader('Wellness Recommendations', yPos);
  yPos = drawBulletList(elementData.health.recommendations, yPos);

  yPos = drawInfoBox('Daily Health Tip',
    `As a ${element} element person, focus on activities that balance your elemental energy. ` +
    `Regular self-care aligned with your element will enhance your overall vitality and life force.`,
    yPos);

  // === PAGE 6: 10-YEAR FORECAST ===
  doc.addPage();
  drawPageBackground();
  yPos = margin;

  yPos = drawHeader('Your 10-Year Life Forecast', yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.text(`Life Path Number: ${lifePath}`, margin, yPos);
  yPos += 10;

  const forecast = TEN_YEAR_FORECAST[lifePath] || TEN_YEAR_FORECAST[1];
  yPos = drawParagraph(forecast, yPos, 10);
  yPos += 5;

  yPos = drawSubheader('Key Years to Watch', yPos);
  const currentYear = new Date().getFullYear();
  const keyYears = [
    `${currentYear + 1} - Year of New Beginnings and Fresh Opportunities`,
    `${currentYear + 3} - Period of Growth and Expansion`,
    `${currentYear + 5} - Potential Career Milestone or Advancement`,
    `${currentYear + 7} - Relationship Transformations and Deeper Connections`,
    `${currentYear + 10} - Major Life Cycle Completion and Renewal`
  ];
  yPos = drawBulletList(keyYears, yPos);

  yPos = drawInfoBox('Timing Wisdom',
    `${elementData.career.timing} This is when your elemental energy is strongest, making it the ideal time for important decisions and new ventures.`,
    yPos);

  // === PAGE 7: FINAL SUMMARY ===
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

export const downloadPDF = (birthData, analysis) => {
  const doc = generatePDF(birthData, analysis);
  const fileName = `Lumina_Destiny_${analysis.element}_${analysis.animal}.pdf`;
  doc.save(fileName);
  return fileName;
};
