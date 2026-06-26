import { useState, useEffect } from 'react';
import { hasPassword, verifyPassword, setPassword, isAuthed, lockSettings, removePassword } from '../utils/auth';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, KeyRound, LogOut, Trash2 } from 'lucide-react';

/**
 * Wraps the Settings page with password protection.
 * - No password set → show "create password" form
 * - Password set, not authed → show login form
 * - Authed → render children + lock button in corner
 */
export default function SettingsLock({ children }) {
  const [authed, setAuthed] = useState(isAuthed());
  const [pwdExists, setPwdExists] = useState(hasPassword());
  const [mode, setMode] = useState(pwdExists ? 'login' : 'setup'); // 'login' | 'setup' | 'change'
  const [input, setInput] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthed(isAuthed());
    setPwdExists(hasPassword());
    setMode(hasPassword() ? 'login' : 'setup');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!input) { setError('Введите пароль'); return; }
    setLoading(true);
    const ok = await verifyPassword(input);
    setLoading(false);
    if (ok) { setAuthed(true); setInput(''); setError(''); }
    else { setError('Неверный пароль'); setInput(''); }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (input.length < 4) { setError('Минимум 4 символа'); return; }
    if (input !== confirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    await setPassword(input);
    setLoading(false);
    setPwdExists(true);
    setAuthed(true);
    setInput(''); setConfirm(''); setError('');
  };

  const handleLock = () => { lockSettings(); setAuthed(false); setMode('login'); setInput(''); };

  const handleRemovePwd = () => {
    if (!window.confirm('Удалить пароль? Настройки станут открытыми для всех.')) return;
    removePassword();
    setPwdExists(false);
    setMode('setup');
  };

  if (authed) {
    return (
      <div className="relative">
        {/* Lock bar */}
        <div className="max-w-screen-2xl mx-auto px-6 pt-4 flex items-center justify-end gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
            <ShieldCheck size={13} className="text-green-600" />
            <span className="text-xs font-medium text-green-700">Настройки защищены паролем</span>
          </div>
          <button
            onClick={() => setMode('change')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <KeyRound size={12} />
            Сменить пароль
          </button>
          <button
            onClick={handleLock}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <LogOut size={12} />
            Заблокировать
          </button>
        </div>

        {/* Change password modal */}
        {mode === 'change' && (
          <ChangePasswordModal
            onClose={() => setMode('login')}
            onSuccess={() => { setMode('login'); }}
            onRemove={handleRemovePwd}
          />
        )}

        {children}
      </div>
    );
  }

  // Login / Setup screen
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="iqos-gradient p-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'setup' ? 'Защита настроек' : 'Вход в настройки'}
            </h2>
            <p className="text-teal-100 text-sm mt-1">
              {mode === 'setup'
                ? 'Установите пароль для защиты SKU и минимумов'
                : 'Введите пароль для доступа к настройкам'}
            </p>
          </div>

          <form onSubmit={mode === 'setup' ? handleSetup : handleLogin} className="p-6 space-y-4">
            <PasswordField
              label={mode === 'setup' ? 'Новый пароль' : 'Пароль'}
              value={input}
              onChange={setInput}
              show={showPwd}
              onToggle={() => setShowPwd(s => !s)}
              placeholder={mode === 'setup' ? 'Минимум 4 символа' : '••••••••'}
            />

            {mode === 'setup' && (
              <PasswordField
                label="Повторите пароль"
                value={confirm}
                onChange={setConfirm}
                show={showPwd}
                onToggle={() => setShowPwd(s => !s)}
                placeholder="Повторите пароль"
              />
            )}

            {error && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full iqos-gradient text-white font-semibold py-2.5 rounded-xl shadow-md shadow-teal-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-custom" />
                : <Unlock size={15} />
              }
              {mode === 'setup' ? 'Установить пароль' : 'Войти'}
            </button>
          </form>
        </div>

        {mode === 'login' && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Пароль хранится только в этом браузере
          </p>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="current-password"
          className="w-full pr-10 pl-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-400 transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose, onSuccess, onRemove }) {
  const [step, setStep] = useState('current'); // 'current' | 'new'
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCurrent = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyPassword(current);
    setLoading(false);
    if (ok) { setStep('new'); setError(''); }
    else { setError('Неверный текущий пароль'); }
  };

  const handleSetNew = async (e) => {
    e.preventDefault();
    if (newPwd.length < 4) { setError('Минимум 4 символа'); return; }
    if (newPwd !== confirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    await setPassword(newPwd);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="iqos-gradient px-6 py-4 flex items-center gap-3">
          <KeyRound size={18} className="text-white" />
          <h3 className="font-bold text-white">Смена пароля</h3>
        </div>
        <form onSubmit={step === 'current' ? handleVerifyCurrent : handleSetNew} className="p-6 space-y-4">
          {step === 'current' ? (
            <PasswordField label="Текущий пароль" value={current} onChange={setCurrent} show={show} onToggle={() => setShow(s => !s)} placeholder="Введите текущий пароль" />
          ) : (
            <>
              <PasswordField label="Новый пароль" value={newPwd} onChange={setNewPwd} show={show} onToggle={() => setShow(s => !s)} placeholder="Минимум 4 символа" />
              <PasswordField label="Повторите пароль" value={confirm} onChange={setConfirm} show={show} onToggle={() => setShow(s => !s)} placeholder="Повторите новый пароль" />
            </>
          )}
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="flex-1 iqos-gradient text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-70">
              {step === 'current' ? 'Далее' : 'Сохранить'}
            </button>
          </div>
          {step === 'current' && (
            <button type="button" onClick={onRemove} className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:text-red-700 transition-colors mt-1">
              <Trash2 size={12} />
              Удалить пароль (открыть для всех)
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
