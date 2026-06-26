import { useMemo, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { filterReport } from '../utils/analyzer';
import Filters from './Filters';
import ExportPanel from './ExportPanel';
import { BarChart3, ChevronDown, ChevronRight, Store, Package, AlertTriangle, MapPin } from 'lucide-react';

export default function AnalysisPage() {
  const { report, filters } = useAppStore();

  const filteredBre = useMemo(() => {
    if (!report) return [];
    let result = filterReport(report.breList, filters);
    if (filters.search) {
      result = result.map(b => ({
        ...b,
        stores: b.stores.filter(s =>
          s.storeName.toLowerCase().includes(filters.search.toLowerCase())
        ),
      })).filter(b => b.stores.length > 0);
    }
    return result;
  }, [report, filters]);

  if (!report) return null;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl iqos-gradient flex items-center justify-center shadow-md">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Анализ по BRE</h1>
            <p className="text-slate-500 text-sm">Детальные рекомендации по каждому менеджеру и точке</p>
          </div>
        </div>
        <ExportPanel />
      </div>

      <Filters />

      <div className="space-y-4">
        {filteredBre.map((bre, i) => (
          <BRETable key={bre.breName} bre={bre} index={i} />
        ))}
        {filteredBre.length === 0 && (
          <div className="text-center py-20 text-slate-400 animate-fade-in">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p>Нет данных по выбранным фильтрам</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BRETable({ bre, index }) {
  const [open, setOpen] = useState(true);
  const deliverCount = bre.stores.reduce((acc, s) => acc + s.skus.filter(sk => sk.needed > 0).length, 0);
  const storesWithProblems = bre.stores.filter(s => s.skus.some(sk => sk.needed > 0));

  return (
    <div
      className="animate-fade-in-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 0.07, 0.35)}s`, animationFillMode: 'forwards', opacity: 0 }}
    >
      {/* BRE header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <div className="w-8 h-8 rounded-lg iqos-gradient flex items-center justify-center">
            <span className="text-white text-xs font-bold">{bre.breName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="text-left">
            <div className="font-bold text-slate-900">{bre.breName}</div>
            <div className="text-xs text-slate-500">{bre.totalStores} точек · {bre.problemStores} с дефицитом</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {deliverCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 rounded-xl border border-teal-200">
              <Package size={13} className="text-teal-500" />
              <span className="text-sm font-bold text-teal-700">{deliverCount} позиций к доставке</span>
            </div>
          )}
          {bre.problemStores > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-xl border border-red-200">
              <AlertTriangle size={13} className="text-red-500" />
              <span className="text-sm font-bold text-red-600">{bre.problemStores} точек</span>
            </div>
          )}
        </div>
      </button>

      {/* Stores — one block per store */}
      {open && (
        <div>
          {storesWithProblems.length > 0 ? (
            storesWithProblems.map((store, si) => {
              const skusToDeliver = store.skus.filter(sk => sk.needed > 0);
              return (
                <div key={store.storeName} className={si < storesWithProblems.length - 1 ? 'border-b-2 border-slate-200' : ''}>
                  {/* Store header row */}
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      store.worstStatus === 'critical' ? 'bg-red-500'
                      : store.worstStatus === 'low' ? 'bg-amber-400'
                      : 'bg-green-400'
                    }`} />
                    <Store size={13} className="text-teal-500 shrink-0" />
                    <span className="font-semibold text-slate-800 text-sm">{store.storeName}</span>
                    {store.city && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={11} />
                        {store.city}
                      </span>
                    )}
                    {store.se && (
                      <span className="text-xs text-slate-400 ml-1">· SE: {store.se}</span>
                    )}
                    <span className="ml-auto text-xs font-medium text-slate-500">
                      {skusToDeliver.length} позиций к доставке
                    </span>
                  </div>

                  {/* SKU rows */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                        <th className="px-6 py-2 text-left font-semibold w-[40%]">SKU</th>
                        <th className="px-4 py-2 text-right font-semibold w-[15%]">Остаток</th>
                        <th className="px-4 py-2 text-right font-semibold w-[15%]">Минимум</th>
                        <th className="px-4 py-2 text-right font-semibold w-[15%]">Привезти</th>
                        <th className="px-4 py-2 text-left font-semibold w-[15%]">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skusToDeliver.map((sku, ki) => (
                        <tr
                          key={sku.sku}
                          className={`transition-colors hover:bg-slate-50 ${ki < skusToDeliver.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                          <td className="px-6 py-2.5 text-slate-700 font-medium">{sku.sku}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`font-bold ${sku.qty === 0 ? 'text-red-600' : 'text-slate-700'}`}>{sku.qty}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-400">{sku.minQty}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="font-bold text-teal-600">+{sku.needed}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={sku.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-8 text-center text-sm text-slate-400">
              У этого BRE нет точек с дефицитом по текущим фильтрам
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    critical: { label: '🔴 Критично', cls: 'bg-red-50 text-red-700 border-red-200' },
    low:      { label: '🟠 Низкий',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    ok:       { label: '🟢 В норме',  cls: 'bg-green-50 text-green-700 border-green-200' },
  }[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
