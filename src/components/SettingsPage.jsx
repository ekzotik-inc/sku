import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Settings, Plus, Trash2, RotateCcw, Save, Info } from 'lucide-react';

export default function SettingsPage() {
  const { minimums, updateMinimum, removeMinimum, addMinimum, resetMinimums, addToast } = useAppStore();
  const [newSku, setNewSku] = useState('');
  const [newMin, setNewMin] = useState(1);
  const [editValues, setEditValues] = useState({});

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
    setEditValues(p => { const n = {...p}; delete n[sku]; return n; });
  };

  const handleReset = () => {
    resetMinimums();
    setEditValues({});
    addToast('Настройки сброшены до значений по умолчанию', 'info');
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
          Сбросить
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* SKU list */}
        <div className="lg:col-span-2 animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Минимальные остатки</h2>
              <span className="text-sm text-slate-500">{sortedSkus.length} позиций</span>
            </div>

            <div className="divide-y divide-slate-50">
              {sortedSkus.map(([sku, min]) => {
                const editing = editValues[sku] !== undefined;
                const currentVal = editing ? editValues[sku] : min;
                return (
                  <div key={sku} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-800 truncate block">{sku}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="9999"
                        value={currentVal}
                        onChange={e => setEditValues(p => ({ ...p, [sku]: e.target.value }))}
                        onBlur={() => editing && handleSave(sku)}
                        onKeyDown={e => e.key === 'Enter' && handleSave(sku)}
                        className="w-20 text-center text-sm font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:border-teal-400 transition-colors"
                      />
                      {editing && (
                        <button
                          onClick={() => handleSave(sku)}
                          className="p-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                        >
                          <Save size={13} />
                        </button>
                      )}
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
                  Нет настроенных SKU
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add new + info */}
        <div className="space-y-4 animate-fade-in-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          {/* Add new SKU */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-teal-500" />
              Добавить SKU
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

          {/* Info card */}
          <div className="bg-teal-50 rounded-2xl border border-teal-100 p-5">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-teal-800 text-sm mb-2">Как работают минимумы</h4>
                <ul className="text-xs text-teal-700 space-y-1.5 leading-relaxed">
                  <li>• Если остаток = 0 → <strong>🔴 Критично</strong></li>
                  <li>• Если остаток &lt; минимума → <strong>🟠 Низкий запас</strong></li>
                  <li>• Если остаток ≥ минимума → <strong>🟢 В норме</strong></li>
                  <li>• «Нужно привезти» = минимум − остаток</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm mb-1">Сохранение</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Все настройки сохраняются автоматически в браузере (localStorage) и будут доступны при следующем посещении.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
