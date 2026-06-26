import { useRef, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { parseExcelFile } from '../utils/excelParser';
import { analyzeData } from '../utils/analyzer';
import { generateSampleExcel } from '../utils/sampleData';
import { Upload, FileSpreadsheet, Zap, Shield, BarChart3, FlaskConical } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Мгновенный анализ', desc: 'Обработка файлов до 30 000 строк за секунды' },
  { icon: Shield, title: 'Без сервера', desc: 'Все данные обрабатываются локально в браузере' },
  { icon: BarChart3, title: 'Умные отчёты', desc: 'Автоматическое определение дефицита по точкам' },
];

export default function FileUpload() {
  const { setLoading, setRawData, setReport, setActiveTab, minimums, addToast, isLoading, loadingProgress, loadingMessage } = useAppStore();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      addToast('Поддерживаются только файлы Excel (.xlsx, .xls) и CSV', 'error');
      return;
    }

    try {
      setLoading(true, 10, 'Чтение файла...');
      await delay(100);

      setLoading(true, 30, 'Парсинг данных...');
      const parsed = await parseExcelFile(file);
      setRawData(parsed, file.name);

      setLoading(true, 60, `Найдено ${parsed.rows.length} строк. Анализирую...`);
      await delay(50);

      setLoading(true, 85, 'Формирование отчёта...');
      const report = analyzeData(parsed.rows, minimums);
      setReport(report);

      setLoading(true, 100, 'Готово!');
      await delay(300);
      setLoading(false);

      addToast(`Загружено ${parsed.rows.length} строк. Обнаружено ${report.stats.problemStores} проблемных точек.`, 'success');
      setActiveTab('dashboard');
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Ошибка обработки файла', 'error');
    }
  }, [minimums, setLoading, setRawData, setReport, setActiveTab, addToast]);

  const handleFile = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-100 mb-6">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-sm font-medium text-teal-700">IQOS BRE Inventory Tool</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Анализ остатков <span className="iqos-gradient-text">SKU</span>
          </h1>
          <p className="text-slate-500 text-lg">
            Загрузите отчёт — система автоматически определит дефицит и сформирует рекомендации для каждого BRE
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer animate-fade-in-up stagger-2
            ${isDragging
              ? 'border-teal-400 bg-teal-50 scale-[1.01]'
              : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/30'
            }
            ${isLoading ? 'cursor-wait pointer-events-none' : ''}
          `}
          style={{ animationFillMode: 'forwards' }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="hidden"
          />

          <div className="p-12 text-center">
            {isLoading ? (
              <LoadingState progress={loadingProgress} message={loadingMessage} />
            ) : (
              <IdleState isDragging={isDragging} />
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`animate-fade-in-up bg-white rounded-xl p-4 border border-slate-100 shadow-sm`}
                style={{ animationDelay: `${0.3 + i * 0.1}s`, animationFillMode: 'forwards', opacity: 0 }}
              >
                <Icon size={18} className="text-teal-500 mb-2" />
                <div className="text-sm font-semibold text-slate-800 mb-1">{f.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Sample data hint */}
        <div className="flex flex-col items-center gap-2 mt-6">
          <p className="text-center text-xs text-slate-400 animate-fade-in-up stagger-6" style={{ animationFillMode: 'forwards' }}>
            Ожидаемые колонки: BRE, SE, Торговая точка, Регион, Город, SKU, Остаток
          </p>
          <button
            onClick={() => processFile(generateSampleExcel())}
            disabled={isLoading}
            className="animate-fade-in-up stagger-7 flex items-center gap-2 text-xs text-teal-600 hover:text-teal-700 font-medium border border-teal-200 hover:border-teal-300 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50"
            style={{ animationFillMode: 'forwards' }}
          >
            <FlaskConical size={13} />
            Загрузить демо-данные
          </button>
        </div>
      </div>
    </div>
  );
}

function IdleState({ isDragging }) {
  return (
    <>
      <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-all duration-300 ${
        isDragging ? 'iqos-gradient scale-110' : 'bg-slate-100'
      }`}>
        {isDragging
          ? <FileSpreadsheet size={28} className="text-white" />
          : <Upload size={28} className="text-slate-400" />
        }
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {isDragging ? 'Отпустите файл' : 'Загрузить отчёт'}
      </h3>
      <p className="text-slate-500 text-sm mb-5">
        {isDragging ? 'Файл будет обработан автоматически' : 'Перетащите файл сюда или нажмите для выбора'}
      </p>
      <button className="iqos-gradient text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all duration-200 hover:-translate-y-0.5">
        Выбрать Excel файл
      </button>
      <p className="text-xs text-slate-400 mt-3">.xlsx, .xls, .csv</p>
    </>
  );
}

function LoadingState({ progress, message }) {
  return (
    <div className="py-4">
      <div className="w-14 h-14 rounded-2xl iqos-gradient mx-auto mb-5 flex items-center justify-center animate-pulse">
        <FileSpreadsheet size={24} className="text-white" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{message}</h3>
      <p className="text-sm text-slate-500 mb-6">{progress}%</p>
      <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full iqos-gradient rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
