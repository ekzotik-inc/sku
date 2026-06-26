import { useState } from 'react';
import { User, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Store } from 'lucide-react';
import StoreCard from './StoreCard';

export default function BRESection({ bre, index }) {
  const [collapsed, setCollapsed] = useState(false);
  const { breName, stores, totalStores, problemStores } = bre;

  return (
    <div
      className="animate-fade-in-up mb-6"
      style={{ animationDelay: `${Math.min(index * 0.08, 0.4)}s`, animationFillMode: 'forwards', opacity: 0 }}
    >
      {/* BRE Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl iqos-gradient flex items-center justify-center shadow-md">
            <User size={16} className="text-white" />
          </div>
          <div className="text-left">
            <div className="font-bold text-slate-900">{breName}</div>
            <div className="text-xs text-slate-500">
              {totalStores} {plural(totalStores, 'точка', 'точки', 'точек')}
              {problemStores > 0 && (
                <span className="text-red-500 ml-2">
                  · {problemStores} с проблемами
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini stats */}
          <div className="flex items-center gap-2">
            {problemStores > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle size={12} className="text-red-500" />
                <span className="text-xs font-bold text-red-600">{problemStores}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
              <Store size={12} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-600">{totalStores}</span>
            </div>
            {problemStores === 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-xs font-medium text-green-600">Всё хорошо</span>
              </div>
            )}
          </div>
          {collapsed
            ? <ChevronDown size={16} className="text-slate-400" />
            : <ChevronUp size={16} className="text-slate-400" />
          }
        </div>
      </button>

      {/* Stores grid */}
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-2">
          {stores.map((store, i) => (
            <StoreCard key={`${store.storeName}-${i}`} store={store} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function plural(n, one, few, many) {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return few;
  return many;
}
