import { useAppStore } from '../store/appStore';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function Filters() {
  const { report, filters, setFilter, clearFilters } = useAppStore();
  if (!report) return null;

  const { meta } = report;
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-teal-500" />
          <span className="font-semibold text-slate-800 text-sm">Фильтры</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full font-medium">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
          >
            <X size={12} />
            Сбросить фильтры
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по торговой точке..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        {/* BRE */}
        <FilterSelect
          value={filters.bre}
          onChange={v => setFilter('bre', v)}
          placeholder="BRE"
          options={meta.allBres}
        />

        {/* City */}
        <FilterSelect
          value={filters.city}
          onChange={v => setFilter('city', v)}
          placeholder="Город"
          options={meta.allCities}
        />

        {/* SKU search */}
        <div className="md:col-span-2 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по SKU..."
            value={filters.sku}
            onChange={e => setFilter('sku', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors text-slate-700 appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
