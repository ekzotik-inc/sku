import { useState, useEffect } from 'react';
import { hasPassword, verifyPassword, isAuthed, lockSettings } from '../utils/auth';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, LogOut } from 'lucide-react';

export default function SettingsLock({ children }) {
  const [authed, setAuthed] = useState(false);
  const [pwdConfigured, setPwdConfigured] = useState(false);
  const [input, setInput] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const configured = hasPassword();
    setPwdConfigured(configured);
    if (!configured || isAuthed()) setAuthed(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!input) { setError('Введите пароль'); return; }
    setLoading(true);
    const ok = await verifyPassword(input);
    setLoading(false);
    if (ok) {
      setAuthed(true);
      setInput('');
      setError('');
    } else {
      setError('Неверный пароль');
      setInput('');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleLock = () => {
    lockSettings();
    setAuthed(false);
    setInput('');
    setError('');
  };

  // Password not configured in build — show settings openly with a warning
  if (!pwdConfigured) {
    return (
      <div>
        <div className="max-w-screen-2xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 w-fit">
            <Lock size={14} className="shrink-0" />
            Пароль не установлен — настройки открыты для всех. Добавьте секрет <code className="font-mono bg-amber-100 px-1 rounded">VITE_SETTINGS_PWD_HASH</code> в GitHub Actions.
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Authenticated — show content with lock button
  if (authed) {
    return (
      <div>
        <div className="max-w-screen-2xl mx-auto px-6 pt-4 flex justify-end">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
              <ShieldCheck size={13} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Доступ открыт</span>
            </div>
            <button
              onClick={handleLock}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <LogOut size={12} />
              Заблокировать
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Lock screen
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden ${shake ? 'animate-shake' : ''}`}>
          {/* Header */}
          <div className="iqos-gradient p-7 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Настройки</h2>
            <p className="text-teal-100 text-sm mt-1.5">
              Введите пароль для доступа
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Пароль</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={input}
                  onChange={e => { setInput(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoFocus
                  autoComplete="current-password"
                  className={`w-full pr-10 pl-4 py-3 text-sm border rounded-xl bg-slate-50 focus:outline-none transition-colors ${
                    error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-teal-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full iqos-gradient text-white font-semibold py-3 rounded-xl shadow-md shadow-teal-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-custom" />
                : <Unlock size={15} />
              }
              Войти
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Обратитесь к администратору если забыли пароль
        </p>
      </div>
    </div>
  );
}
