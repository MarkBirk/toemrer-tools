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
  if (inputs && Object.keys(inputs).length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Input', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const [key, val] of Object.entries(inputs)) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${key}: ${val}`, 14, y);
      y += 6;
    }
    y += 4;
  }

  // Results
  if (results && Object.keys(results).length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultater', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const [key, val] of Object.entries(results)) {
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

  if (inputs && Object.keys(inputs).length) {
    text += '--- Input ---\n';
    for (const [k, v] of Object.entries(inputs)) text += `${k}: ${v}\n`;
    text += '\n';
  }
  if (results && Object.keys(results).length) {
    text += '--- Resultater ---\n';
    for (const [k, v] of Object.entries(results)) text += `${k}: ${v}\n`;
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

  if (inputs && Object.keys(inputs).length) {
    html += '<h3>Input</h3><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse">';
    for (const [k, v] of Object.entries(inputs))
      html += `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
    html += '</table>';
  }
  if (results && Object.keys(results).length) {
    html += '<h3>Resultater</h3><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse">';
    for (const [k, v] of Object.entries(results))
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
