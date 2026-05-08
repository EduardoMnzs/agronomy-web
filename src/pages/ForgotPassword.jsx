import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import agronomyLogo from '../assets/images/Agronomy-logo.png';
import { auth } from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Não foi possível processar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7FF] dark:bg-[#1f2123] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#EC6608]/20 dark:bg-[#EC6608]/10 blur-[120px] pointer-events-none" />

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

        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h1 className="text-xl font-bold text-[#131E29] dark:text-white mb-2">Pronto!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Se houver uma conta com esse e-mail, enviaremos um link para redefinir sua senha.
              Verifique sua caixa de entrada.
            </p>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-[#EC6608] font-semibold hover:underline">
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#131E29] dark:text-white mb-1">Esqueci minha senha</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Informe seu e-mail. Enviaremos um link para você criar uma nova senha.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@fazenda.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="cursor-pointer w-full bg-[#EC6608] hover:bg-[#d95d07] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enviar link
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#EC6608]">
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
