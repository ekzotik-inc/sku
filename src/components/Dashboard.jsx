import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { filterReport } from '../utils/analyzer';
import KPICards from './KPICards';
import Filters from './Filters';
import BRESection from './BRESection';
import ExportPanel from './ExportPanel';
import { BarChart3, Package, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { report, filters, setActiveTab } = useAppStore();

  const filteredBre = useMemo(() => {
    if (!report) return [];
    // Apply search filter separately (searches store name)
    let result = filterReport(report.breList, filters);
    if (filters.search) {
      result = result.map(b => ({
        ...b,
        stores: b.stores.filter(s =>
          s.storeName.toLowerCase().includes(filters.search.toLowerCase()) ||
          s.se?.toLowerCase().includes(filters.search.toLowerCase())
        ),
      })).filter(b => b.stores.length > 0);
    }
    return result;
  }, [report, filters]);

  const totalVisible = filteredBre.reduce((acc, b) => acc + b.stores.length, 0);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl iqos-gradient flex items-center justify-center shadow-md">
              <BarChart3 size={16} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Дашборд</h1>
          </div>
          {totalVisible > 0 && (
            <p className="text-slate-500 text-sm ml-12">
              Показано {totalVisible} торговых точек
            </p>
          )}
        </div>
        <ExportPanel />
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Quick action */}
      {report && (
        <div
          onClick={() => setActiveTab('analysis')}
          className="animate-fade-in-up mb-6 p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl text-white cursor-pointer hover:from-teal-600 hover:to-teal-700 transition-all duration-200 hover-lift shadow-lg shadow-teal-200"
          style={{ animationDelay: '0.3s', animationFillMode: 'forwards', opacity: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={20} className="opacity-90" />
              <div>
                <div className="font-bold">Перейти к подробному анализу по BRE</div>
                <div className="text-sm opacity-80">Карточки торговых точек с детальной информацией</div>
              </div>
            </div>
            <ArrowRight size={20} className="opacity-80" />
          </div>
        </div>
      )}

      {/* Filters */}
      <Filters />

      {/* Content */}
      {filteredBre.length > 0 ? (
        filteredBre.map((bre, i) => (
          <BRESection key={bre.breName} bre={bre} index={i} />
        ))
      ) : report ? (
        <EmptyFilters />
      ) : null}
    </div>
  );
}

function EmptyFilters() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Package size={28} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">Ничего не найдено</h3>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        Попробуйте изменить фильтры или сбросить их
      </p>
    </div>
  );
}
