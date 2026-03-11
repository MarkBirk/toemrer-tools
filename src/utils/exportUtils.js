import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generate PDF from data
export function generatePDF({ title, date, inputs, results, materialList, notes }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title || 'Tømrer Tools', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dato: ${formatDate(date || new Date().toISOString())}`, 14, y);
  y += 10;

  // Inputs
  const inputEntries = normalizeEntries(inputs);
  if (inputEntries.length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Input', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const [key, val] of inputEntries) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${key}: ${val}`, 14, y);
      y += 6;
    }
    y += 4;
  }

  // Results
  const resultEntries = normalizeEntries(results);
  if (resultEntries.length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultater', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const [key, val] of resultEntries) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${key}: ${val}`, 14, y);
      y += 6;
    }
    y += 4;
  }

  // Material list table
  if (materialList && materialList.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Materialeliste', 14, y);
    y += 4;

    doc.autoTable({
      startY: y,
      head: [['Materiale', 'Mængde', 'Enhed', 'Noter']],
      body: materialList.map(m => [
        m.name || m.materiale || '',
        m.amount || m.antal || '',
        m.unit || m.enhed || '',
        m.notes || m.noter || ''
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [140, 104, 64] },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Notes
  if (notes) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Noter', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(notes, pageWidth - 28);
    doc.text(lines, 14, y);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Tømrer Tools', 14, 290);
    doc.text(`Side ${i}/${pageCount}`, pageWidth - 30, 290);
    doc.setTextColor(0);
  }

  return doc;
}

// Professional tilbud/quote PDF — inspired by traditional Danish quote layout
export function generateTilbudPDF({ title, date, tilbudDetaljer, notes }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const d = tilbudDetaljer;
  const firma = d.firma || {};
  const rightCol = pageWidth - 14;
  const dateStr = formatDate(date || new Date().toISOString());

  // ── Company info (top right) ──
  let fy = 20;
  if (firma.navn) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(firma.navn, rightCol, fy, { align: 'right' });
    fy += 6;
  }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  if (firma.cvr) { doc.text(`CVR: ${firma.cvr}`, rightCol, fy, { align: 'right' }); fy += 4.5; }
  if (firma.adresse) { doc.text(firma.adresse, rightCol, fy, { align: 'right' }); fy += 4.5; }
  if (firma.telefon) { doc.text(`Tlf.: ${firma.telefon}`, rightCol, fy, { align: 'right' }); fy += 4.5; }
  if (firma.email) { doc.text(firma.email, rightCol, fy, { align: 'right' }); fy += 4.5; }
  if (firma.website) { doc.text(firma.website, rightCol, fy, { align: 'right' }); fy += 4.5; }
  doc.setTextColor(0);

  // ── Customer info (top left) ──
  let cy = 20;
  if (d.kundeNavn) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(d.kundeNavn, 14, cy);
    cy += 5.5;
  }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  if (d.kundeAdresse) { doc.text(d.kundeAdresse, 14, cy); cy += 4.5; }
  doc.text(`Dato: ${dateStr}`, 14, cy);
  doc.setTextColor(0);

  // ── Horizontal divider ──
  let y = Math.max(fy, cy) + 10;
  doc.setDrawColor(207, 195, 176);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 14;

  // ── TILBUD heading ──
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TILBUD', 14, y);
  y += 10;

  // ── Intro text ──
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tak for jeres forespørgsel. Vi har hermed fornøjelsen at tilbyde følgende:', 14, y);
  y += 10;

  // ── Project title + description ──
  if (d.projektTitel) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 104, 64);
    doc.text(d.projektTitel, 14, y);
    // Underline
    const tw = doc.getTextWidth(d.projektTitel);
    doc.setDrawColor(140, 104, 64);
    doc.setLineWidth(0.3);
    doc.line(14, y + 1, 14 + tw, y + 1);
    doc.setTextColor(0);
    y += 7;
  }

  if (notes && notes.trim()) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    // Format bullet points if lines start with "-" or "•"
    const noteLines = notes.trim().split('\n');
    for (const line of noteLines) {
      if (y > 255) { doc.addPage(); y = 20; }
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        const bullet = trimmed.replace(/^[-•]\s*/, '');
        doc.text('•', 18, y);
        const wrapped = doc.splitTextToSize(bullet, pageWidth - 40);
        doc.text(wrapped, 24, y);
        y += wrapped.length * 5;
      } else {
        const wrapped = doc.splitTextToSize(trimmed, pageWidth - 28);
        doc.text(wrapped, 14, y);
        y += wrapped.length * 5;
      }
    }
    y += 6;
  }

  // ── Divider before price ──
  doc.setDrawColor(207, 195, 176);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // ── Pris section ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Pris', 14, y);
  y += 3;

  const rows = [];
  rows.push(['Materialer', `${formatKr(d.materialer)} kr.`]);
  const timerLabel = d.timer > 0
    ? `Arbejdsløn (${d.timer} t × ${formatKr(d.timepris)} kr.)`
    : 'Arbejdsløn';
  rows.push([timerLabel, `${formatKr(d.arbejdsloen)} kr.`]);

  // Subtotal
  rows.push([{ content: 'Subtotal', styles: { fontStyle: 'bold' } }, { content: `${formatKr(d.subtotal)} kr.`, styles: { fontStyle: 'bold' } }]);

  if (d.inkluderAvance) {
    rows.push([`Avance (${d.avancePct}%)`, `${formatKr(d.avance)} kr.`]);
  }
  if (d.inkluderAvance || d.inkluderMoms) {
    rows.push([{ content: 'Total ex. moms', styles: { fontStyle: 'bold' } }, { content: `${formatKr(d.totalExMoms)} kr.`, styles: { fontStyle: 'bold' } }]);
  }
  if (d.inkluderMoms) {
    rows.push([{ content: `${d.momsPct}% moms`, styles: { textColor: [140, 104, 64] } }, { content: `${formatKr(d.moms)} kr.`, styles: { textColor: [140, 104, 64] } }]);
  }

  const totalLabel = d.inkluderMoms ? 'Total DKK' : 'Total';
  rows.push([
    { content: totalLabel, styles: { fontStyle: 'bold', fontSize: 11, textColor: [140, 104, 64] } },
    { content: `${formatKr(d.totalInklMoms)} kr.`, styles: { fontStyle: 'bold', fontSize: 11, textColor: [140, 104, 64] } }
  ]);

  doc.autoTable({
    startY: y,
    body: rows,
    columns: [
      { dataKey: 0, header: '' },
      { dataKey: 1, header: '' },
    ],
    showHead: false,
    styles: {
      fontSize: 10,
      cellPadding: { top: 3, bottom: 3, left: 0, right: 0 },
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 55, halign: 'right' },
    },
    didParseCell(data) {
      const rowIdx = data.row.index;
      const totalRows = rows.length;
      // Subtotal row — top border
      if (rowIdx === 2) {
        data.cell.styles.lineWidth = { top: 0.3 };
        data.cell.styles.lineColor = [207, 195, 176];
      }
      // Total ex. moms row
      const totalExIdx = d.inkluderAvance ? (d.inkluderMoms ? totalRows - 3 : totalRows - 2) : (d.inkluderMoms ? totalRows - 2 : -1);
      if (totalExIdx >= 0 && rowIdx === totalExIdx) {
        data.cell.styles.lineWidth = { top: 0.3 };
        data.cell.styles.lineColor = [207, 195, 176];
      }
      // Grand total row — top border
      if (rowIdx === totalRows - 1) {
        data.cell.styles.lineWidth = { top: 0.5 };
        data.cell.styles.lineColor = [140, 104, 64];
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 20;

  // ── Payment terms ──
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(`Betalingsbetingelser: Netto ${d.betalingsfrist || 8} dage.`, 14, y);
  y += 12;

  // ── Signature / greeting ──
  const greeting = firma.navn ? `Med venlig hilsen ${firma.navn}` : 'Med venlig hilsen';
  doc.text(greeting, 14, y);
  y += 5;
  const contactParts = [];
  if (firma.telefon) contactParts.push(`Tlf.: ${firma.telefon}`);
  if (firma.email) contactParts.push(`Mail: ${firma.email}`);
  if (firma.website) contactParts.push(`Web: ${firma.website}`);
  if (contactParts.length) {
    doc.text(contactParts.join('  –  '), 14, y);
  }
  doc.setTextColor(0);

  // ── Footer on all pages ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(207, 195, 176);
    doc.setLineWidth(0.3);
    doc.line(14, 284, pageWidth - 14, 284);
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text(firma.navn || 'Tømrer Tools', 14, 289);
    doc.text(`Side ${i}/${pageCount}`, pageWidth - 14, 289, { align: 'right' });
    doc.setTextColor(0);
  }

  return doc;
}

function formatKr(n) {
  return Number(n).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function downloadPDF(data, filename) {
  const doc = generatePDF(data);
  doc.save(filename || `${slugify(data.title || 'beregning')}.pdf`);
  return doc;
}

export function getPDFBase64(data) {
  const doc = generatePDF(data);
  return doc.output('datauristring').split(',')[1];
}

// Generate CSV
export function generateCSV(materialList, extraRows) {
  const headers = ['Materiale', 'Mængde', 'Enhed', 'Noter'];
  const rows = (materialList || []).map(m => [
    m.name || m.materiale || '',
    m.amount || m.antal || '',
    m.unit || m.enhed || '',
    m.notes || m.noter || ''
  ]);
  if (extraRows) rows.push(...extraRows);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  return '\uFEFF' + csv; // BOM for Excel
}

export function downloadCSV(materialList, filename, extraRows) {
  const csv = generateCSV(materialList, extraRows);
  downloadBlob(csv, filename || 'materialeliste.csv', 'text/csv;charset=utf-8');
}

// Generate JSON export
export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  downloadBlob(json, filename || 'beregning.json', 'application/json');
}

// Copy as text
export function generateText({ title, inputs, results, materialList, notes }) {
  let text = `=== ${title || 'Beregning'} ===\n`;
  text += `Dato: ${formatDate(new Date().toISOString())}\n\n`;

  const inputEntries = normalizeEntries(inputs);
  if (inputEntries.length) {
    text += '--- Input ---\n';
    for (const [k, v] of inputEntries) text += `${k}: ${v}\n`;
    text += '\n';
  }
  const resultEntries = normalizeEntries(results);
  if (resultEntries.length) {
    text += '--- Resultater ---\n';
    for (const [k, v] of resultEntries) text += `${k}: ${v}\n`;
    text += '\n';
  }
  if (materialList && materialList.length) {
    text += '--- Materialeliste ---\n';
    for (const m of materialList) {
      text += `${m.name || m.materiale}: ${m.amount || m.antal} ${m.unit || m.enhed}`;
      if (m.notes || m.noter) text += ` (${m.notes || m.noter})`;
      text += '\n';
    }
    text += '\n';
  }
  if (notes) text += `--- Noter ---\n${notes}\n`;
  return text;
}

export async function copyText(data) {
  const text = typeof data === 'string' ? data : generateText(data);
  await navigator.clipboard.writeText(text);
}

// Email HTML
export function generateEmailHTML({ title, inputs, results, materialList, notes }) {
  let html = `<h2>${title || 'Beregning'}</h2>`;
  html += `<p><em>Dato: ${formatDate(new Date().toISOString())}</em></p>`;

  const inputEntries = normalizeEntries(inputs);
  if (inputEntries.length) {
    html += '<h3>Input</h3><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse">';
    for (const [k, v] of inputEntries)
      html += `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
    html += '</table>';
  }
  const resultEntries = normalizeEntries(results);
  if (resultEntries.length) {
    html += '<h3>Resultater</h3><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse">';
    for (const [k, v] of resultEntries)
      html += `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
    html += '</table>';
  }
  if (materialList && materialList.length) {
    html += '<h3>Materialeliste</h3><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse">';
    html += '<tr style="background:#8C6840;color:#fff"><th>Materiale</th><th>Mængde</th><th>Enhed</th><th>Noter</th></tr>';
    for (const m of materialList) {
      html += `<tr><td>${m.name || m.materiale || ''}</td><td>${m.amount || m.antal || ''}</td><td>${m.unit || m.enhed || ''}</td><td>${m.notes || m.noter || ''}</td></tr>`;
    }
    html += '</table>';
  }
  if (notes) html += `<h3>Noter</h3><p>${notes.replace(/\n/g, '<br>')}</p>`;
  html += '<hr><p style="color:#999;font-size:12px">Sendt fra Tømrer Tools</p>';
  return html;
}

// Format a value for display — handles objects, arrays, primitives
function formatValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    // Array of objects like [{laengde: 600, antal: 2}]
    return val.map(item => {
      if (typeof item === 'object' && item !== null) {
        return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
      }
      return String(item);
    }).join(' | ');
  }
  if (typeof val === 'object') {
    return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(', ');
  }
  return String(val);
}

// Normalize results: convert array of {label, value} to flat key-value pairs
function normalizeEntries(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    // Array of {label, value} objects
    return data.map(item => {
      if (item && item.label !== undefined) return [item.label, formatValue(item.value)];
      return [String(item), ''];
    });
  }
  // Regular object — skip materialList (handled separately as table)
  return Object.entries(data)
    .filter(([k, v]) => {
      if (k === 'materialList' || k === 'tilbudstekst') return false;
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') return false;
      return true;
    })
    .map(([k, v]) => [k, formatValue(v)]);
}

// Helpers
function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9æøå]/g, '-').replace(/-+/g, '-').slice(0, 40);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('da-DK', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export { formatDate, slugify };
