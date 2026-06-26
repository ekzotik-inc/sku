import { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { parseSkuFile, downloadSkuTemplate } from '../utils/templateUtils';
import { Settings, Plus, Trash2, RotateCcw, Save, Info, Upload, Download, FileSpreadsheet, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { minimums, updateMinimum, removeMinimum, addMinimum, resetMinimums, addToast } = useAppStore();
  const [newSku, setNewSku] = useState('');
  const [newMin, setNewMin] = useState(1);
  const [editValues, setEditValues] = useState({});
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null); // { items, mode }
  const importRef = useRef(null);

  const handleAdd = () => {
    if (!newSku.trim()) { addToast('Введите название SKU', 'warning'); return; }
    if (minimums[newSku.trim()]) { addToast('Такой SKU уже существует', 'warning'); return; }
    addMinimum(newSku.trim(), newMin);
    addToast(`SKU "${newSku.trim()}" добавлен`, 'success');
    setNewSku('');
    setNewMin(1);
  };

  const handleSave = (sku) => {
    const val = editValues[sku];
    if (val === undefined || val === '') return;
    updateMinimum(sku, val);
    addToast(`Минимум для "${sku}" обновлён`, 'success');
    setEditValues(p => { const n = { ...p }; delete n[sku]; return n; });
  };

  const handleReset = () => {
    resetMinimums();
    setEditValues({});
    addToast('Настройки сброшены до значений по умолчанию', 'info');
  };

  const handleDownloadSkuTemplate = () => {
    downloadSkuTemplate(minimums);
    addToast('Шаблон SKU скачан', 'info');
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const items = await parseSkuFile(file);
      if (!items.length) { addToast('Файл не содержит SKU', 'warning'); return; }
      setImportPreview({ items, fileName: file.name });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleImportConfirm = (mode) => {
    if (!importPreview) return;
    const { items } = importPreview;
    let added = 0, updated = 0;

    if (mode === 'replace') {
      // Clear existing and set all from file
      const newMins = {};
      for (const { sku, min } of items) { newMins[sku] = min; }
      // Use store directly
      for (const sku of Object.keys(minimums)) removeMinimum(sku);
      for (const [sku, min] of Object.entries(newMins)) addMinimum(sku, min);
      added = items.length;
    } else {
      // Merge: add new, update existing
      for (const { sku, min } of items) {
        if (minimums[sku] !== undefined) { updateMinimum(sku, min); updated++; }
        else { addMinimum(sku, min); added++; }
      }
    }

    setImportPreview(null);
    addToast(`Импорт завершён: ${added} добавлено, ${updated} обновлено`, 'success');
  };

  const sortedSkus = Object.entries(minimums).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl iqos-gradient flex items-center justify-center shadow-md">
              <Settings size={16} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Настройки</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">Минимальные остатки SKU для определения дефицита</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} />
          Сбросить к умолчаниям
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* SKU list */}
        <div className="lg:col-span-2 animate-fade-in-up">
          {/* Import/Export toolbar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button
              onClick={handleDownloadSkuTemplate}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Download size={14} className="text-teal-500" />
              Скачать шаблон SKU
            </button>
            <button
              onClick={() => importRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-700 border border-teal-200 bg-teal-50 rounded-xl hover:bg-teal-100 transition-all disabled:opacity-50"
            >
              {importing
                ? <span className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin-custom" />
                : <Upload size={14} />
              }
              Загрузить список SKU
            </button>
            <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} className="hidden" />
            <span className="text-xs text-slate-400 ml-auto">{sortedSkus.length} позиций</span>
          </div>

          {/* Import preview modal */}
          {importPreview && (
            <ImportPreview
              preview={importPreview}
              currentCount={sortedSkus.length}
              onConfirm={handleImportConfirm}
              onCancel={() => setImportPreview(null)}
            />
          )}

          {/* SKU table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="grid grid-cols-[1fr_120px_80px] gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>SKU / Товар</span>
                <span className="text-center">Минимум</span>
                <span></span>
              </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
              {sortedSkus.map(([sku, min]) => {
                const editing = editValues[sku] !== undefined;
                const currentVal = editing ? editValues[sku] : min;
                return (
                  <div key={sku} className="grid grid-cols-[1fr_120px_80px] gap-2 items-center px-6 py-3 hover:bg-slate-50 transition-colors group">
                    <span className="text-sm font-medium text-slate-800 truncate pr-2">{sku}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="9999"
                        value={currentVal}
                        onChange={e => setEditValues(p => ({ ...p, [sku]: e.target.value }))}
                        onBlur={() => editing && handleSave(sku)}
                        onKeyDown={e => e.key === 'Enter' && handleSave(sku)}
                        className="w-full text-center text-sm font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:border-teal-400 transition-colors"
                      />
                      {editing && (
                        <button onClick={() => handleSave(sku)} className="shrink-0 p-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors">
                          <Save size={12} />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => { removeMinimum(sku); addToast(`"${sku}" удалён`, 'info'); }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {sortedSkus.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-sm">
                  Нет настроенных SKU. Добавьте вручную или загрузите файл.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 animate-fade-in-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          {/* Add new SKU */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-teal-500" />
              Добавить SKU вручную
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Название товара</label>
                <input
                  type="text"
                  value={newSku}
                  onChange={e => setNewSku(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="Например: HEETS Amber"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-400 transition-colors bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Минимальный остаток</label>
                <input
                  type="number"
                  min="0"
                  value={newMin}
                  onChange={e => setNewMin(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-400 transition-colors bg-slate-50"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full iqos-gradient text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-teal-200 hover:shadow-lg hover:shadow-teal-300 transition-all duration-200 hover:-translate-y-0.5"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* Import info */}
          <div className="bg-teal-50 rounded-2xl border border-teal-100 p-5">
            <div className="flex items-start gap-3">
              <FileSpreadsheet size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-teal-800 text-sm mb-2">Загрузка списка SKU</h4>
                <ul className="text-xs text-teal-700 space-y-1 leading-relaxed">
                  <li>• Скачай шаблон SKU</li>
                  <li>• Заполни колонки <strong>SKU</strong> и <strong>Минимум</strong></li>
                  <li>• Загрузи файл обратно</li>
                  <li>• Выбери режим: дополнить или заменить</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Logic info */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm mb-2">Логика приоритетов</h4>
                <ul className="text-xs text-amber-700 space-y-1.5 leading-relaxed">
                  <li>• Остаток = 0 → <strong>🔴 Критично</strong></li>
                  <li>• Остаток &lt; минимума → <strong>🟠 Низкий запас</strong></li>
                  <li>• Остаток ≥ минимума → <strong>🟢 В норме</strong></li>
                  <li>• Привезти = минимум − остаток</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportPreview({ preview, currentCount, onConfirm, onCancel }) {
  const { items, fileName } = preview;
  const newItems = items.filter(i => i.min > 0 || i.min === 0);

  return (
    <div className="mb-4 bg-white border-2 border-teal-200 rounded-2xl overflow-hidden shadow-md animate-fade-in">
      <div className="px-5 py-4 bg-teal-50 border-b border-teal-100 flex items-center gap-3">
        <CheckCircle size={18} className="text-teal-600" />
        <div>
          <div className="font-semibold text-teal-900 text-sm">{fileName}</div>
          <div className="text-xs text-teal-600">Найдено {items.length} позиций SKU</div>
        </div>
      </div>

      {/* Preview list */}
      <div className="max-h-40 overflow-y-auto divide-y divide-slate-50 px-5">
        {items.slice(0, 10).map(({ sku, min }) => (
          <div key={sku} className="flex justify-between items-center py-2 text-sm">
            <span className="text-slate-700 truncate mr-4">{sku}</span>
            <span className="font-semibold text-teal-700 shrink-0">мин: {min}</span>
          </div>
        ))}
        {items.length > 10 && (
          <div className="py-2 text-xs text-slate-400 text-center">и ещё {items.length - 10} позиций...</div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
        <p className="text-xs text-slate-600 mb-3">Выберите режим импорта:</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onConfirm('merge')}
            className="flex-1 px-3 py-2 text-sm font-semibold bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
          >
            Дополнить ({currentCount} + новые)
          </button>
          <button
            onClick={() => onConfirm('replace')}
            className="flex-1 px-3 py-2 text-sm font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            Заменить (только {items.length})
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
