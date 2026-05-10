import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare, Activity, Clock, AlertTriangle } from 'lucide-react';
import Header from '../components/layout/Header';
import { metrics as metricsApi } from '../api/api';

const RANGE_OPTIONS = [
  { value: 1, label: 'Último dia' },
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

function KpiCard({ icon: Icon, label, value, hint, accent = 'orange' }) {
  const colors = {
    orange: 'text-[#EC6608] bg-[#EC6608]/10',
    green: 'text-green-600 bg-green-100 dark:bg-green-500/10',
    red: 'text-red-600 bg-red-100 dark:bg-red-500/10',
    gray: 'text-gray-500 bg-gray-100 dark:bg-white/5',
  };
  return (
    <div className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-start gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[accent]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
        <p className="text-2xl font-bold text-[#131E29] dark:text-white mt-0.5">{value}</p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function DailyChart({ daily }) {
  if (!daily || daily.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-8">Sem dados no período.</p>;
  }
  const max = Math.max(...daily.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-1.5 h-40">
      {daily.map((d, i) => {
        const heightPct = (d.total / max) * 100;
        const errorPct = d.total ? (d.errors / d.total) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex flex-col justify-end h-full relative">
              <div
                className="bg-[#EC6608] rounded-t-sm transition-all relative overflow-hidden"
                style={{ height: `${heightPct}%`, minHeight: d.total > 0 ? '2px' : 0 }}
                title={`${d.date}: ${d.total} consultas (${d.errors} erros)`}
              >
                {errorPct > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-red-500"
                    style={{ height: `${errorPct}%` }}
                  />
                )}
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-mono">
              {d.date.slice(5)}
            </span>
          </div>
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

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

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
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          </motion.div>

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
              <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                  icon={Activity}
                  label="Consultas"
                  value={data.total_queries}
                  hint={`em ${data.range_days} ${data.range_days === 1 ? 'dia' : 'dias'}`}
                />
                <KpiCard
                  icon={Clock}
                  label="Latência p50 / p95"
                  value={data.p50_latency_ms != null ? `${data.p50_latency_ms} / ${data.p95_latency_ms ?? '—'}` : '—'}
                  hint={data.avg_latency_ms != null ? `média ${Math.round(data.avg_latency_ms)} ms` : 'sem dados'}
                  accent="gray"
                />
                <KpiCard
                  icon={AlertTriangle}
                  label="Taxa de erro"
                  value={`${(data.error_rate * 100).toFixed(1)}%`}
                  hint={`sucesso ${(data.success_rate * 100).toFixed(1)}%`}
                  accent={data.error_rate > 0.05 ? 'red' : 'green'}
                />
                <KpiCard
                  icon={MessageSquare}
                  label="Feedbacks"
                  value={data.feedback_total}
                  hint={`${data.feedback_positive} 👍 · ${data.feedback_negative} 👎`}
                  accent={data.feedback_total > 0 && data.feedback_positive >= data.feedback_negative ? 'green' : 'gray'}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#131E29] dark:text-white">Consultas por dia</h3>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-[#EC6608]" /> total
                      <span className="w-2 h-2 rounded-sm bg-red-500 ml-2" /> erros
                    </span>
                  </div>
                  <DailyChart daily={data.daily} />
                </div>

                <div className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-4">Modelos mais usados</h3>
                  <ModelsList models={data.top_models} />
                </div>
              </motion.div>

              {data.feedback_total > 0 && (
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-4">Distribuição de feedback</h3>
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
                </motion.div>
              )}
            </>
          ) : null}
        </motion.div>
      </main>
    </>
  );
}
