import { useAppStore } from '../store/appStore';
import { MapPin, Users, Package, Eye, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';

export default function StoreCard({ store, index }) {
  const { setSelectedStore } = useAppStore();

  const worstBadge = {
    critical: { label: '🔴 Критично', cls: 'bg-red-50 text-red-600 border-red-200' },
    low:      { label: '🟠 Низкий запас', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    ok:       { label: '🟢 В норме', cls: 'bg-green-50 text-green-600 border-green-200' },
  }[store.worstStatus];

  return (
    <div
      className="animate-fade-in-up bg-white rounded-2xl border border-slate-100 shadow-sm hover-lift overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s`, animationFillMode: 'forwards', opacity: 0 }}
    >
      {/* Status bar */}
      <div className={`h-1 w-full ${
        store.worstStatus === 'critical' ? 'bg-red-500'
        : store.worstStatus === 'low' ? 'bg-amber-400'
        : 'bg-green-400'
      }`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-sm truncate" title={store.storeName}>
              {store.storeName}
            </h3>
            {(store.region || store.city) && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500 truncate">
                  {[store.region, store.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${worstBadge.cls}`}>
            {worstBadge.label}
          </span>
        </div>

        {/* Info row */}
        <div className="flex flex-col gap-1 mb-4">
          {store.se && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users size={11} className="text-slate-400" />
              SE: <span className="font-medium text-slate-700">{store.se}</span>
            </div>
          )}
          {store.breName && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Package size={11} className="text-slate-400" />
              BRE: <span className="font-medium text-slate-700">{store.breName}</span>
            </div>
          )}
        </div>

        {/* SKU counts */}
        <div className="flex items-center gap-2 mb-4">
          {store.criticalCount > 0 && (
            <Chip icon={AlertTriangle} count={store.criticalCount} color="text-red-500" bg="bg-red-50" label="крит." />
          )}
          {store.lowCount > 0 && (
            <Chip icon={TrendingDown} count={store.lowCount} color="text-amber-500" bg="bg-amber-50" label="низк." />
          )}
          {store.okCount > 0 && (
            <Chip icon={CheckCircle} count={store.okCount} color="text-green-500" bg="bg-green-50" label="ок" />
          )}
        </div>

        {/* Deliver preview */}
        {store.hasProblems && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-1.5">Привезти:</p>
            <div className="space-y-1">
              {store.skus.filter(s => s.needed > 0).slice(0, 3).map(s => (
                <div key={s.sku} className="flex justify-between text-xs">
                  <span className="text-slate-600 truncate mr-2">{s.sku}</span>
                  <span className="font-bold text-slate-800 shrink-0">+{s.needed}</span>
                </div>
              ))}
              {store.skus.filter(s => s.needed > 0).length > 3 && (
                <div className="text-xs text-teal-600 font-medium">
                  +{store.skus.filter(s => s.needed > 0).length - 3} ещё...
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setSelectedStore(store)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-sm font-medium text-slate-600 hover:text-teal-700 transition-all duration-200"
        >
          <Eye size={14} />
          Подробнее
        </button>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, count, color, bg, label }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${bg}`}>
      <Icon size={11} className={color} />
      <span className={`text-xs font-bold ${color}`}>{count}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
