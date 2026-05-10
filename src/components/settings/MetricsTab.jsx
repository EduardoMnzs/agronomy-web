import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare, Activity, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { metrics as metricsApi } from '../../api/api';

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
    <div className="bg-gray-50 dark:bg-[#2c3033] rounded-xl p-4 flex items-start gap-3 border border-gray-100 dark:border-transparent">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[accent]}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
        <p className="text-xl font-bold text-[#131E29] dark:text-white mt-0.5">{value}</p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function DailyChart({ daily }) {
  if (!daily || daily.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">Sem dados no período.</p>;
  }
  const max = Math.max(...daily.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-1.5 h-32">
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
    return <p className="text-xs text-gray-400 text-center py-4">Nenhum modelo usado no período.</p>;
  }
  const max = Math.max(...models.map((m) => m.count), 1);
  return (
    <div className="space-y-2">
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

export default function MetricsTab() {
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-[#131E29] dark:text-white">Métricas de uso</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Consultas, latência e feedback do usuário.
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
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
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
              icon={Activity}
              label="Consultas"
              value={data.total_queries}
              hint={`em ${data.range_days} ${data.range_days === 1 ? 'dia' : 'dias'}`}
            />
            <KpiCard
              icon={Clock}
              label="Latência p50 / p95"
              value={data.p50_latency_ms != null ? `${data.p50_latency_ms} / ${data.p95_latency_ms ?? '—'} ms` : '—'}
              hint={data.avg_latency_ms != null ? `média ${Math.round(data.avg_latency_ms)} ms` : null}
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-[#2c3033] rounded-xl p-4 border border-gray-100 dark:border-transparent">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#131E29] dark:text-white">Consultas por dia</h3>
                <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#EC6608]" /> total
                  <span className="w-2 h-2 rounded-sm bg-red-500 ml-2" /> erros
                </span>
              </div>
              <DailyChart daily={data.daily} />
            </div>

            <div className="bg-gray-50 dark:bg-[#2c3033] rounded-xl p-4 border border-gray-100 dark:border-transparent">
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-3">Modelos mais usados</h3>
              <ModelsList models={data.top_models} />
            </div>
          </div>

          {data.feedback_total > 0 && (
            <div className="bg-gray-50 dark:bg-[#2c3033] rounded-xl p-4 border border-gray-100 dark:border-transparent">
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-3">Distribuição de feedback</h3>
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
              <div className="flex justify-between mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><ThumbsUp size={11} className="text-green-600" /> {data.feedback_positive}</span>
                <span className="flex items-center gap-1.5">{data.feedback_negative} <ThumbsDown size={11} className="text-red-600" /></span>
              </div>
            </div>
          )}
        </>
      ) : null}
    </motion.div>
  );
}
