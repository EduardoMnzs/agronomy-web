import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import agronomyLogo from '../assets/images/Agronomy-logo.png';
import { auth } from '../api/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('Link inválido. Solicite um novo em "Esqueci minha senha".');
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (p1.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (p1 !== p2) { setError('As senhas não coincidem.'); return; }
    setLoading(true);
    try {
      await auth.resetPassword({ token, newPassword: p1 });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7FF] dark:bg-[#1f2123] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/20 dark:bg-brand/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-[#323639] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <img src={agronomyLogo} alt="Agronomy" className="w-10 h-10 object-contain" />
          <div className="text-2xl tracking-tight leading-none text-[#131E29] dark:text-white">
            <span className="font-bold">AGRONO</span><span className="font-light">MY</span>
          </div>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h1 className="text-xl font-bold text-[#131E29] dark:text-white mb-2">Senha redefinida</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecionando para o login...</p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#131E29] dark:text-white mb-1">Criar nova senha</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Escolha uma nova senha para sua conta.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <PasswordField label="Nova senha" value={p1} onChange={setP1} show={show1} onToggle={() => setShow1((v) => !v)} autoFocus hint="Mínimo 6 caracteres." disabled={!token} />
              <PasswordField label="Confirmar nova senha" value={p2} onChange={setP2} show={show2} onToggle={() => setShow2((v) => !v)} disabled={!token} />

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !token || !p1 || !p2}
                className="cursor-pointer w-full bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Redefinir senha
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand">
                  <ArrowLeft size={12} /> Voltar ao login
                </Link>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, hint, autoFocus, disabled }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          required
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}
