import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { X, MapPin, User, Users, Package, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';

const STATUS_CONFIG = {
  critical: { label: 'Критично', icon: '🔴', textColor: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  low:      { label: 'Низкий запас', icon: '🟠', textColor: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ok:       { label: 'В норме', icon: '🟢', textColor: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
};

export default function StoreModal() {
  const { selectedStore, setSelectedStore } = useAppStore();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSelectedStore(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSelectedStore]);

  if (!selectedStore) return null;

  const { storeName, breName, se, region, city, skus, criticalCount, lowCount, okCount } = selectedStore;
  const needToDeliver = skus.filter(s => s.needed > 0);
  const inStock = skus.filter(s => s.needed === 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) setSelectedStore(null); }}
    >
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                criticalCount > 0 ? 'bg-red-50 text-red-600 border border-red-200'
                : lowCount > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-green-50 text-green-600 border border-green-200'
              }`}>
                {criticalCount > 0 ? '🔴 Критично' : lowCount > 0 ? '🟠 Низкий запас' : '🟢 В норме'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 truncate">{storeName}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
              {breName && <span className="flex items-center gap-1"><User size={13} />{breName}</span>}
              {se && <span className="flex items-center gap-1"><Users size={13} />SE: {se}</span>}
              {region && <span className="flex items-center gap-1"><MapPin size={13} />{region}{city && `, ${city}`}</span>}
            </div>
          </div>
          <button
            onClick={() => setSelectedStore(null)}
            className="shrink-0 ml-4 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex border-b border-slate-100">
          <StatChip icon={AlertTriangle} value={criticalCount} label="Критично" color="text-red-500" bg="bg-red-50" />
          <StatChip icon={TrendingDown} value={lowCount} label="Низкий запас" color="text-amber-500" bg="bg-amber-50" />
          <StatChip icon={CheckCircle} value={okCount} label="В норме" color="text-green-500" bg="bg-green-50" />
          <StatChip icon={Package} value={needToDeliver.length} label="К доставке" color="text-teal-500" bg="bg-teal-50" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {needToDeliver.length > 0 && (
            <section className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Package size={14} className="text-teal-500" />
                Нужно привезти ({needToDeliver.length})
              </h3>
              <div className="space-y-2">
                {needToDeliver.map(sku => {
                  const cfg = STATUS_CONFIG[sku.status];
                  return (
                    <div key={sku.sku} className={`flex items-center justify-between p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none">{cfg.icon}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">{sku.sku}</div>
                          <div className="text-xs text-slate-500">Остаток: {sku.qty} / Минимум: {sku.minQty}</div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-3 text-right">
                        <div className={`text-lg font-bold ${cfg.textColor}`}>+{sku.needed}</div>
                        <div className="text-xs text-slate-400">привезти</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {inStock.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-500" />
                В норме ({inStock.length})
              </h3>
              <div className="space-y-1.5">
                {inStock.map(sku => (
                  <div key={sku.sku} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🟢</span>
                      <span className="text-sm text-slate-700">{sku.sku}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-green-600">{sku.qty}</span>
                      <span className="text-xs text-slate-400 ml-1">/ мин {sku.minQty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skus.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Package size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Нет данных по SKU</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, value, label, color, bg }) {
  return (
    <div className={`flex-1 flex flex-col items-center py-3 ${bg}`}>
      <Icon size={14} className={`${color} mb-1`} />
      <div className="text-lg font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
