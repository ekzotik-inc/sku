import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';

export default function ExportPanel() {
  const { report, addToast } = useAppStore();
  const [loading, setLoading] = useState('');

  if (!report) return null;

  const handle = async (type) => {
    setLoading(type);
    try {
      if (type === 'excel') exportToExcel(report.breList);
      else if (type === 'csv') exportToCSV(report.breList);
      else await exportToPDF(report.breList, report.stats);
      addToast(`Файл ${type.toUpperCase()} успешно выгружен`, 'success');
    } catch (e) {
      addToast('Ошибка при экспорте: ' + e.message, 'error');
    } finally {
      setLoading('');
    }
  };

  const buttons = [
    { type: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'hover:bg-green-50 hover:border-green-300 hover:text-green-700' },
    { type: 'csv',   label: 'CSV',   icon: FileText, color: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700' },
    { type: 'pdf',   label: 'PDF',   icon: File, color: 'hover:bg-red-50 hover:border-red-300 hover:text-red-700' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
        <Download size={14} />
        Выгрузить:
      </span>
      {buttons.map(({ type, label, icon: Icon, color }) => (
        <button
          key={type}
          onClick={() => handle(type)}
          disabled={!!loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-600 transition-all duration-200 ${color} disabled:opacity-50 disabled:cursor-wait`}
        >
          {loading === type ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-custom" />
          ) : (
            <Icon size={14} />
          )}
          {label}
        </button>
      ))}
    </div>
  );
}
