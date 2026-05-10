import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare, Search, Clock, AlertTriangle, User as UserIcon } from 'lucide-react';
import Header from '../components/layout/Header';
import { metrics as metricsApi } from '../api/api';

const RANGE_OPTIONS = [
  { value: 1, label: 'Último dia' },
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

function KpiCard({ icon: Icon, label, value, hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay }}
      className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-start gap-3 shadow-sm"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#EC6608] bg-[#EC6608]/10">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
        <p className="text-2xl font-bold text-[#131E29] dark:text-white mt-0.5">{value}</p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </motion.div>
  );
}

function Panel({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      className={`bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

function formatDayBR(iso) {
  // "2026-05-10" → "10/05"
  if (!iso || iso.length < 10) return iso || '';
  const [, mm, dd] = iso.split('-');
  return `${dd}/${mm}`;
}

function DailyChart({ daily, baseDelay = 0 }) {
  if (!daily || daily.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-8">Sem dados no período.</p>;
  }
  const max = Math.max(...daily.map((d) => d.total), 1);
  return (
    <div className="flex gap-1.5 h-56 w-full">
      {daily.map((d, i) => {
        const heightPct = (d.total / max) * 100;
        const errorPct = d.total ? (d.errors / d.total) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0 h-full">
            <div className="flex-1 w-full flex flex-col justify-end items-center">
              <span className={`text-[10px] font-mono leading-none mb-0.5 ${d.total > 0 ? 'text-gray-600 dark:text-gray-200 font-semibold' : 'text-gray-300 dark:text-gray-600'}`}>
                {d.total}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%`, minHeight: d.total > 0 ? 4 : 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: baseDelay + i * 0.03 }}
                className="w-full bg-[#EC6608] rounded-t-sm relative overflow-hidden hover:bg-[#d95d07] transition-colors"
                title={`${formatDayBR(d.date)}: ${d.total} consultas${d.errors ? ` (${d.errors} erros)` : ''}`}
              >
                {errorPct > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-red-500"
                    style={{ height: `${errorPct}%` }}
                  />
                )}
              </motion.div>
            </div>
            <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap leading-none">
              {formatDayBR(d.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FeedbackList({ feedbacks, baseDelay = 0 }) {
  if (!feedbacks || feedbacks.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">Nenhum feedback registrado no período.</p>;
  }
  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };
  return (
    <div className="space-y-2">
      {feedbacks.map((f, idx) => {
        const positive = f.rating === 1;
        return (
          <motion.div
            key={f.log_id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: baseDelay + Math.min(idx * 0.04, 0.4) }}
            className={`border rounded-lg p-3 transition-colors ${
              positive
                ? 'border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5'
                : 'border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  positive
                    ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                }`}
                title={positive ? 'Resposta útil' : 'Resposta ruim'}
              >
                {positive ? <ThumbsUp size={13} /> : <ThumbsDown size={13} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold text-[#131E29] dark:text-white flex items-center gap-1">
                    <UserIcon size={11} className="text-gray-400" />
                    {f.user_name || 'Usuário desconhecido'}
                  </span>
                  {f.user_email && (
                    <span className="text-[10px] text-gray-400 font-mono">{f.user_email}</span>
                  )}
                  <span className="text-[10px] text-gray-400 ml-auto">{formatDate(f.feedback_at)}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 italic">
                  “{f.question}”
                </p>
                {f.feedback_text && (
                  <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/40">
                    <p className="text-xs text-gray-700 dark:text-gray-200 flex items-start gap-1.5">
                      <MessageSquare size={11} className="text-gray-400 mt-0.5 shrink-0" />
                      <span>{f.feedback_text}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ModelsList({ models }) {
  if (!models || models.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">Nenhum modelo usado no período.</p>;
  }
  const max = Math.max(...models.map((m) => m.count), 1);
  return (
    <div className="space-y-3">
      {models.map((m, i) => (
        <div key={i} className="flex items-center gap-3 text-xs">
          <span className="w-48 truncate font-mono text-gray-600 dark:text-gray-300" title={m.model}>{m.model}</span>
          <div className="flex-1 bg-gray-100 dark:bg-[#2c3033] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#EC6608] h-full rounded-full"
              style={{ width: `${(m.count / max) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-gray-500 dark:text-gray-400 font-mono">{m.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Metrics() {
  const { setIsMobileOpen } = useOutletContext();
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    metricsApi.get(days)
      .then((m) => { if (!cancelled) setData(m); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Falha ao carregar métricas.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  return (
    <>
      <Header title="Métricas" onOpenMobile={() => setIsMobileOpen(true)} />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#131E29] dark:text-white">Métricas de uso</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Consultas, latência, taxa de erro e feedback dos usuários sobre as respostas da IA.
              </p>
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-[#2c3033] rounded-lg p-1">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setDays(r.value)}
                  className={`cursor-pointer text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    days === r.value
                      ? 'bg-white dark:bg-[#3a3f42] text-[#131E29] dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-[#131E29] dark:hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-xs">Carregando métricas...</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                  delay={0}
                  icon={Search}
                  label="Consultas"
                  value={data.total_queries}
                  hint={`em ${data.range_days} ${data.range_days === 1 ? 'dia' : 'dias'}`}
                />
                <KpiCard
                  delay={0.06}
                  icon={Clock}
                  label="Latência p50 / p95"
                  value={data.p50_latency_ms != null ? `${data.p50_latency_ms} / ${data.p95_latency_ms ?? '—'}` : '—'}
                  hint={data.avg_latency_ms != null ? `média ${Math.round(data.avg_latency_ms)} ms` : 'sem dados'}
                />
                <KpiCard
                  delay={0.12}
                  icon={AlertTriangle}
                  label="Taxa de erro"
                  value={`${(data.error_rate * 100).toFixed(1)}%`}
                  hint={`sucesso ${(data.success_rate * 100).toFixed(1)}%`}
                />
                <KpiCard
                  delay={0.18}
                  icon={MessageSquare}
                  label="Feedbacks"
                  value={data.feedback_total}
                  hint={`${data.feedback_positive} 👍 · ${data.feedback_negative} 👎`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Panel delay={0.35}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#131E29] dark:text-white">Consultas por dia</h3>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-[#EC6608]" /> total
                      <span className="w-2 h-2 rounded-sm bg-red-500 ml-2" /> erros
                    </span>
                  </div>
                  <DailyChart daily={data.daily} baseDelay={0.45} />
                </Panel>

                <Panel delay={0.55}>
                  <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-4">Modelos mais usados</h3>
                  <ModelsList models={data.top_models} />
                </Panel>
              </div>

              {data.feedback_total > 0 && (
                <Panel delay={0.75}>
                  <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-4">Distribuição de Feedback</h3>
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-[#1f2123]">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${(data.feedback_positive / data.feedback_total) * 100}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${(data.feedback_negative / data.feedback_total) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5"><ThumbsUp size={12} className="text-green-600" /> {data.feedback_positive} úteis</span>
                    <span className="flex items-center gap-1.5">{data.feedback_negative} ruins <ThumbsDown size={12} className="text-red-600" /></span>
                  </div>
                </Panel>
              )}

              <Panel delay={0.9}>
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h3 className="text-sm font-semibold text-[#131E29] dark:text-white">Lista de Feedbacks</h3>
                  {data.feedbacks?.length > 0 && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      {data.feedbacks.length} {data.feedbacks.length === 1 ? 'registro' : 'registros'}
                    </span>
                  )}
                </div>
                <FeedbackList feedbacks={data.feedbacks ?? []} baseDelay={1.0} />
              </Panel>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
