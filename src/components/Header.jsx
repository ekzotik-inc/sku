import { useAppStore } from '../store/appStore';
import { LayoutDashboard, BarChart3, Settings, RefreshCw, FileSpreadsheet } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'analysis', label: 'Анализ', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function Header() {
  const { activeTab, setActiveTab, report, fileName, reset } = useAppStore();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg iqos-gradient flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm tracking-tight">IQ</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight tracking-tight">IQOS BRE Tool</div>
              <div className="text-xs text-slate-400 leading-tight">Inventory Management</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.id === 'analysis' && !report;
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                      : isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {fileName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <FileSpreadsheet size={14} className="text-teal-500" />
                <span className="text-xs text-slate-600 font-medium truncate max-w-40">{fileName}</span>
              </div>
            )}
            {report && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw size={14} />
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
