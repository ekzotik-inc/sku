import * as XLSX from 'xlsx';

/** Download blank data entry template */
export function downloadDataTemplate() {
  const rows = [
    ['BRE', 'Город', 'Торговая точка', 'SKU', 'Остаток'],
    ['Иванов А.С.', 'Москва', 'ТЦ Мега №1', 'HEETS Amber', 3],
    ['Иванов А.С.', 'Москва', 'ТЦ Мега №1', 'TEREA Bronze', 0],
    ['Иванов А.С.', 'Москва', 'ТЦ Мега №1', 'IQOS ILUMA', 2],
    ['Иванов А.С.', 'Химки', 'ТЦ Галерея', 'HEETS Amber', 7],
    ['Иванов А.С.', 'Химки', 'ТЦ Галерея', 'TEREA Silver', 1],
    ['Петрова М.В.', 'СПб', 'Фирменный магазин', 'HEETS Yellow', 0],
    ['Петрова М.В.', 'СПб', 'Фирменный магазин', 'IQOS ILUMA Prime', 1],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Header style hint via column widths
  ws['!cols'] = [22, 18, 28, 28, 12].map(w => ({ wch: w }));

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Остатки');
  XLSX.writeFile(wb, 'IQOS_Шаблон_Остатки.xlsx');
}

/** Download SKU minimums template */
export function downloadSkuTemplate(currentMinimums) {
  const rows = [['SKU', 'Минимальный остаток']];

  if (currentMinimums && Object.keys(currentMinimums).length > 0) {
    for (const [sku, min] of Object.entries(currentMinimums).sort((a, b) => a[0].localeCompare(b[0]))) {
      rows.push([sku, min]);
    }
  } else {
    // Default examples
    rows.push(
      ['HEETS Amber', 5],
      ['HEETS Yellow', 5],
      ['TEREA Bronze', 10],
      ['IQOS ILUMA', 1],
      ['Аксессуары', 2],
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [35, 20].map(w => ({ wch: w }));
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SKU');
  XLSX.writeFile(wb, 'IQOS_Шаблон_SKU.xlsx');
}

/** Parse uploaded SKU Excel/CSV and return { sku, min }[] */
export async function parseSkuFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rows.length) { reject(new Error('Файл пустой')); return; }

        const headers = Object.keys(rows[0]);
        // Find SKU column
        const skuCol = headers.find(h => /sku|товар|наименование|название|product/i.test(h));
        // Find minimum column
        const minCol = headers.find(h => /мин|min|остаток|minimum|норма/i.test(h));

        if (!skuCol) { reject(new Error('Не найдена колонка SKU / Товар')); return; }

        const result = [];
        for (const row of rows) {
          const sku = String(row[skuCol] || '').trim();
          const min = minCol ? (parseFloat(row[minCol]) || 0) : 0;
          if (sku) result.push({ sku, min });
        }

        resolve(result);
      } catch (err) {
        reject(new Error('Ошибка чтения файла: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsArrayBuffer(file);
  });
}
