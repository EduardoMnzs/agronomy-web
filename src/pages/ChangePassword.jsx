import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import agronomyLogo from '../assets/images/Agronomy-logo.png';
import { auth } from '../api/api';
import useCurrentUser from '../hooks/useCurrentUser';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { data, loading } = useCurrentUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isPending = data?.status === 'pending';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('A nova senha deve ser diferente da atual.');
      return;
    }

    setSubmitting(true);
    try {
      await auth.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/app');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F7FF] dark:bg-[#1f2123]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F7FF] dark:bg-[#1f2123] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/20 dark:bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md bg-white dark:bg-[#323639] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <img src={agronomyLogo} alt="Agronomy Logo" className="w-10 h-10 object-contain" />
          <div className="text-2xl tracking-tight leading-none text-[#131E29] dark:text-white">
            <span className="font-bold">AGRONO</span><span className="font-light">MY</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#131E29] dark:text-white mb-1">
          {isPending ? 'Defina sua senha' : 'Alterar senha'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {isPending
            ? 'Este é seu primeiro acesso. Para continuar, defina uma senha pessoal.'
            : 'Informe sua senha atual e escolha uma nova.'}
        </p>

        {success ? (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="text-green-600 dark:text-green-400 shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Senha alterada!</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              label={isPending ? 'Senha temporária' : 'Senha atual'}
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              autoFocus
            />
            <PasswordField
              label="Nova senha"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              hint="Mínimo 6 caracteres."
            />
            <PasswordField
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              {!isPending && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
                className="cursor-pointer bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {isPending ? 'Definir senha' : 'Alterar senha'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, hint, autoFocus }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          required
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}
