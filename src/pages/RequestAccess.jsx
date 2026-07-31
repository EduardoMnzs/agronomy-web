import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, User, Building2, Loader2, CheckCircle2, ArrowLeft, MessageSquareText } from 'lucide-react';
import agronomyLogo from '../assets/images/Agronomy-logo.png';
import { accessRequests } from '../api/api';

export default function RequestAccess() {
  const [form, setForm] = useState({ full_name: '', email: '', organization: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await accessRequests.create(form);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Não foi possível enviar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7FF] dark:bg-[#1f2123] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/20 dark:bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#323639] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-8"
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
            <h1 className="text-xl font-bold text-[#131E29] dark:text-white mb-2">Solicitação enviada!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Um administrador vai revisar sua solicitação. Você receberá um e-mail com a resposta.
            </p>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-brand font-semibold hover:underline">
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#131E29] dark:text-white mb-1">Solicitar acesso</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Preencha os dados para solicitar uma conta. Um administrador revisará e você receberá a resposta por e-mail.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <Field icon={User} label="Nome completo" value={form.full_name} onChange={update('full_name')} placeholder="Ex: João da Silva" required autoFocus />
              <Field icon={Mail} label="E-mail" type="email" value={form.email} onChange={update('email')} placeholder="joao@fazenda.com" required />
              <Field icon={Building2} label="Organização (opcional)" value={form.organization} onChange={update('organization')} placeholder="Fazenda, cooperativa, empresa..." />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem (opcional)</label>
                <div className="relative">
                  <MessageSquareText size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={update('message')}
                    placeholder="Conte rapidamente como pretende usar a plataforma"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none resize-none"
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
                disabled={loading || !form.full_name || !form.email}
                className="cursor-pointer w-full bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enviar solicitação
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand">
                  <ArrowLeft size={12} /> Já tem conta? Fazer login
                </Link>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = 'text', required, autoFocus }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={type}
          required={required}
          autoFocus={autoFocus}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none"
        />
      </div>
    </div>
  );
}
