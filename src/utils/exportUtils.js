import * as XLSX from 'xlsx';

/** Export recommendations to Excel file */
export function exportToExcel(breList) {
  const rows = [];
  rows.push(['BRE', 'Торговая точка', 'SE', 'Регион', 'Город', 'SKU', 'Остаток', 'Минимум', 'Необходимо привезти', 'Статус']);

  for (const bre of breList) {
    for (const store of bre.stores) {
      for (const sku of store.skus) {
        if (sku.needed > 0) {
          rows.push([
            bre.breName,
            store.storeName,
            store.se,
            store.region,
            store.city,
            sku.sku,
            sku.qty,
            sku.minQty,
            sku.needed,
            sku.status === 'critical' ? 'Критично' : 'Низкий запас',
          ]);
        }
      }
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  // Column widths
  ws['!cols'] = [20, 25, 20, 15, 15, 30, 10, 10, 15, 15].map(w => ({ wch: w }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Рекомендации');
  XLSX.writeFile(wb, `IQOS_Рекомендации_${formatDate()}.xlsx`);
}

/** Export recommendations to CSV */
export function exportToCSV(breList) {
  const rows = [['BRE', 'Торговая точка', 'SE', 'Регион', 'Город', 'SKU', 'Остаток', 'Минимум', 'Нужно привезти', 'Статус']];

  for (const bre of breList) {
    for (const store of bre.stores) {
      for (const sku of store.skus) {
        if (sku.needed > 0) {
          rows.push([
            bre.breName, store.storeName, store.se,
            store.region, store.city, sku.sku,
            sku.qty, sku.minQty, sku.needed,
            sku.status === 'critical' ? 'Критично' : 'Низкий запас',
          ]);
        }
      }
    }
  }

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const bom = '﻿'; // BOM for Excel UTF-8
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `IQOS_Рекомендации_${formatDate()}.csv`);
}

/** Export recommendations to PDF using jsPDF */
export async function exportToPDF(breList, stats) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(0, 160, 160);
  doc.rect(0, 0, 297, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('IQOS — Рекомендации по доставке SKU', 14, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 230, 13);

  // Stats summary
  doc.setTextColor(30, 30, 50);
  doc.setFontSize(9);
  doc.text(`Точек с проблемами: ${stats.problemStores} из ${stats.totalStores}  |  SKU к доставке: ${stats.totalSkuToDeliver}  |  BRE: ${stats.totalBre}`, 14, 27);

  // Build table data
  const tableRows = [];
  for (const bre of breList) {
    for (const store of bre.stores) {
      for (const sku of store.skus) {
        if (sku.needed > 0) {
          tableRows.push([
            bre.breName, store.storeName, store.region || '—',
            sku.sku, sku.qty, sku.minQty, sku.needed,
            sku.status === 'critical' ? 'Критично' : 'Низкий запас',
          ]);
        }
      }
    }
  }

  autoTable(doc, {
    startY: 32,
    head: [['BRE', 'Торговая точка', 'Регион', 'SKU', 'Остаток', 'Минимум', 'Нужно', 'Статус']],
    body: tableRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 160, 160], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 249, 252] },
    columnStyles: {
      0: { cellWidth: 35 }, 1: { cellWidth: 45 }, 2: { cellWidth: 25 },
      3: { cellWidth: 60 }, 4: { cellWidth: 18 }, 5: { cellWidth: 18 },
      6: { cellWidth: 18 }, 7: { cellWidth: 25 },
    },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.section === 'body') {
        const val = data.cell.raw;
        if (val === 'Критично') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [194, 65, 12];
        }
      }
    },
  });

  doc.save(`IQOS_Рекомендации_${formatDate()}.pdf`);
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
