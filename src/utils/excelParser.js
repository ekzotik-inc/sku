import * as XLSX from 'xlsx';

/**
 * Parse Excel file and return normalized data array.
 * Expects columns (case-insensitive, flexible naming):
 * BRE, SE, Store/Point, Region, City, SKU, Quantity
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rows.length) {
          reject(new Error('Файл пустой или неподдерживаемый формат'));
          return;
        }

        const normalized = normalizeRows(rows);
        resolve(normalized);
      } catch (err) {
        reject(new Error('Ошибка чтения файла: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsArrayBuffer(file);
  });
}

/** Column name aliases for flexible header detection */
const COLUMN_ALIASES = {
  bre: ['bre', 'бре', 'менеджер', 'manager', 'business relationship executive', 'брэ'],
  se: ['se', 'сэ', 'продавец', 'seller', 'консультант', 'sales executive', 'se name', 'имя se'],
  store: ['точка', 'store', 'магазин', 'торговая точка', 'point', 'outlet', 'торговая_точка', 'название точки', 'outlet name', 'store name', 'point name'],
  region: ['регион', 'region', 'area', 'зона'],
  city: ['город', 'city', 'town', 'населённый пункт', 'населенный пункт'],
  sku: ['sku', 'товар', 'product', 'наименование', 'item', 'артикул', 'название товара', 'product name', 'sku name'],
  quantity: ['остаток', 'quantity', 'qty', 'кол-во', 'количество', 'stock', 'остатки', 'count', 'balance'],
};

function detectColumn(headers, aliases) {
  for (const alias of aliases) {
    const found = headers.find(h => h.toString().toLowerCase().trim() === alias);
    if (found) return found;
  }
  // Partial match fallback
  for (const alias of aliases) {
    const found = headers.find(h => h.toString().toLowerCase().trim().includes(alias));
    if (found) return found;
  }
  return null;
}

function normalizeRows(rows) {
  const headers = Object.keys(rows[0]);

  const colMap = {
    bre: detectColumn(headers, COLUMN_ALIASES.bre),
    se: detectColumn(headers, COLUMN_ALIASES.se),
    store: detectColumn(headers, COLUMN_ALIASES.store),
    region: detectColumn(headers, COLUMN_ALIASES.region),
    city: detectColumn(headers, COLUMN_ALIASES.city),
    sku: detectColumn(headers, COLUMN_ALIASES.sku),
    quantity: detectColumn(headers, COLUMN_ALIASES.quantity),
  };

  return {
    rows: rows.map((row, idx) => ({
      id: idx,
      bre: colMap.bre ? String(row[colMap.bre] || '').trim() : '',
      se: colMap.se ? String(row[colMap.se] || '').trim() : '',
      store: colMap.store ? String(row[colMap.store] || '').trim() : '',
      region: colMap.region ? String(row[colMap.region] || '').trim() : '',
      city: colMap.city ? String(row[colMap.city] || '').trim() : '',
      sku: colMap.sku ? String(row[colMap.sku] || '').trim() : '',
      quantity: colMap.quantity ? parseFloat(row[colMap.quantity]) || 0 : 0,
    })).filter(r => r.sku || r.store),
    columnMap: colMap,
    originalHeaders: headers,
  };
}
