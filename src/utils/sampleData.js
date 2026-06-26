import * as XLSX from 'xlsx';

const BRES = ['Иванов А.С.', 'Петрова М.В.', 'Сидоров К.Л.', 'Козлова Н.П.'];
const SES = ['Алексей Д.', 'Мария К.', 'Сергей В.', 'Ольга П.', 'Дмитрий Л.', 'Анна С.', 'Николай Р.', 'Татьяна Б.'];
const REGIONS = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург'];
const CITIES = { 'Москва': ['Москва', 'Химки', 'Одинцово'], 'Санкт-Петербург': ['СПб', 'Пушкин'], 'Казань': ['Казань'], 'Екатеринбург': ['Екатеринбург', 'Нижний Тагил'] };
const SKUS = [
  'HEETS Amber', 'HEETS Yellow', 'HEETS Turquoise', 'HEETS Purple', 'HEETS Sienna',
  'TEREA Bronze', 'TEREA Silver', 'TEREA Amber', 'TEREA Purple', 'TEREA Turquoise',
  'IQOS ILUMA', 'IQOS ILUMA One', 'IQOS ILUMA Prime',
  'Аксессуары', 'Чехол IQOS',
];
const STORES_TEMPLATES = [
  'ТЦ Мега', 'ТЦ Галерея', 'ТЦ Европейский', 'Фирменный магазин', 'АЗС Shell',
  'Перекрёсток', 'Пятёрочка', 'Магнит', 'Лента', 'Ашан', 'Табакофф', 'Смокшоп',
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function generateSampleExcel() {
  const rows = [];
  rows.push(['BRE', 'SE', 'Торговая точка', 'Регион', 'Город', 'SKU', 'Остаток']);

  for (const bre of BRES) {
    const numStores = rand(3, 6);
    for (let s = 0; s < numStores; s++) {
      const region = pick(REGIONS);
      const cities = CITIES[region];
      const city = pick(cities);
      const store = `${pick(STORES_TEMPLATES)} №${s + 1}`;
      const se = pick(SES);
      const numSkus = rand(4, SKUS.length);
      const shuffled = [...SKUS].sort(() => Math.random() - 0.5).slice(0, numSkus);

      for (const sku of shuffled) {
        // Deliberately create deficits: ~40% have low/zero stock
        let qty;
        const roll = Math.random();
        if (roll < 0.15) qty = 0;        // critical
        else if (roll < 0.35) qty = rand(1, 3); // low
        else qty = rand(5, 25);            // ok
        rows.push([bre, se, store, region, city, sku, qty]);
      }
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [20, 18, 25, 15, 15, 25, 10].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Остатки');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([buf], 'sample_iqos_report.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
