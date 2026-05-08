import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Check, X, Clock, CheckCircle2, AlertCircle, Mail, Building2,
  MessageSquareText, Loader2, Trash2,
} from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/ui/CustomSelect';
import Toast from '../components/ui/Toast';
import { accessRequests } from '../api/api';

const STATUS_META = {
  pending: { label: 'Pendente', icon: Clock, cls: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' },
  approved: { label: 'Aprovada', icon: CheckCircle2, cls: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' },
  rejected: { label: 'Rejeitada', icon: X, cls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' },
};

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function AccessRequestsPanel({ compact = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const [decideFor, setDecideFor] = useState(null);
  const [approveResult, setApproveResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accessRequests.list(statusFilter ? { status: statusFilter } : {});
      setItems(data.items ?? []);
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao carregar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await accessRequests.remove(deleteTarget.id);
      setDeleteTarget(null);
      fetchList();
      window.dispatchEvent(new Event('access-requests:changed'));
      setToast({ show: true, title: 'Solicitação excluída', message: '', type: 'success' });
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {!compact && (
          <div>
            <h2 className="text-lg font-bold text-[#131E29] dark:text-white">Solicitações de acesso</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Revise e aprove novos usuários que solicitaram entrada na plataforma.
            </p>
          </div>
        )}
        <div className="sm:w-56 sm:ml-auto">
          <CustomSelect
            fullWidth
            placeholder="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'pending', label: 'Pendentes' },
              { value: 'approved', label: 'Aprovadas' },
              { value: 'rejected', label: 'Rejeitadas' },
              { value: '', label: 'Todas' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#EC6608]" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#2c3033] flex items-center justify-center mb-3">
            <Inbox className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-[#131E29] dark:text-white">Nada por aqui</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhuma solicitação encontrada com o filtro atual.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((r) => (
            <RequestCard
              key={r.id}
              req={r}
              onDecide={() => setDecideFor(r)}
              onDelete={() => setDeleteTarget(r)}
            />
          ))}
        </div>
      )}

      <Toast show={toast.show} onClose={() => setToast({ ...toast, show: false })} title={toast.title} message={toast.message} type={toast.type} />

      <AnimatePresence>
        {decideFor && (
          <DecideModal
            req={decideFor}
            onClose={() => setDecideFor(null)}
            onDone={(result) => {
              setDecideFor(null);
              if (result?.temporary_password) setApproveResult(result);
              setToast({ show: true, title: 'Decisão registrada', message: 'O usuário foi notificado por e-mail.', type: 'success' });
              fetchList();
              window.dispatchEvent(new Event('access-requests:changed'));
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {approveResult && (
          <ApproveResultModal result={approveResult} onClose={() => setApproveResult(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 mx-4"
            >
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-2">Excluir solicitação?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                A solicitação de <strong className="text-gray-700 dark:text-gray-200">{deleteTarget.full_name}</strong> ({deleteTarget.email}) será excluída permanentemente.
                {deleteTarget.status === 'pending' && ' O solicitante não receberá nenhuma resposta.'}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="cursor-pointer px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60 flex items-center gap-2"
                >
                  {deleting && <Loader2 size={12} className="animate-spin" />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccessRequestsPage() {
  const { setIsMobileOpen } = useOutletContext();
  return (
    <>
      <Header title="Solicitações de acesso" onOpenMobile={() => setIsMobileOpen(true)} />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
        <div className="max-w-5xl mx-auto w-full">
          <AccessRequestsPanel />
        </div>
      </main>
    </>
  );
}

function RequestCard({ req, onDecide, onDelete }) {
  const meta = STATUS_META[req.status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#131E29] dark:text-white truncate">{req.full_name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
            <Mail size={12} /> {req.email}
          </p>
          {req.organization && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
              <Building2 size={12} /> {req.organization}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border shrink-0 ${meta.cls}`}>
          <StatusIcon size={11} /> {meta.label}
        </span>
      </div>

      {req.message && (
        <div className="bg-gray-50 dark:bg-[#2c3033] rounded-lg p-3 mb-3 flex gap-2">
          <MessageSquareText size={13} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{req.message}</p>
        </div>
      )}

      {req.rejection_reason && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 mb-3">
          <p className="text-xs text-red-700 dark:text-red-400"><strong>Motivo:</strong> {req.rejection_reason}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-[11px] text-gray-400">Recebida em {formatDate(req.created_at)}</span>
        <div className="flex items-center gap-1.5">
          {req.status === 'pending' && (
            <button
              onClick={onDecide}
              className="cursor-pointer bg-[#EC6608] hover:bg-[#d95d07] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              Decidir
            </button>
          )}
          <button
            onClick={onDelete}
            title="Excluir"
            className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DecideModal({ req, onClose, onDone }) {
  const [action, setAction] = useState('approve');
  const [role, setRole] = useState('user');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const body = { action };
      if (action === 'approve') body.role = role;
      else body.rejection_reason = reason || null;
      const res = await accessRequests.decide(req.id, body);
      onDone(res);
    } catch (err) {
      setError(err.message || 'Falha ao registrar decisão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#323639] w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-[#131E29] dark:text-white">Decidir solicitação</h2>
          <button onClick={onClose} className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 dark:bg-[#2c3033] rounded-lg p-3">
            <p className="text-sm font-semibold text-[#131E29] dark:text-white">{req.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{req.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('approve')}
              className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                action === 'approve'
                  ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-400'
              }`}
            >
              <Check size={15} /> Aprovar
            </button>
            <button
              type="button"
              onClick={() => setAction('reject')}
              className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                action === 'reject'
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-400'
              }`}
            >
              <X size={15} /> Rejeitar
            </button>
          </div>

          {action === 'approve' ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nível de acesso</label>
              <CustomSelect
                fullWidth
                placeholder="Selecione..."
                value={role}
                onChange={setRole}
                options={[{ value: 'user', label: 'Usuário' }, { value: 'admin', label: 'Administrador' }]}
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                O usuário receberá um e-mail com uma senha temporária e será obrigado a trocá-la no primeiro login.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Motivo (opcional)</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explicação que será enviada por e-mail"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white outline-none resize-none"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
            </p>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className={`cursor-pointer px-5 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60 ${
                action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Confirmar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ApproveResultModal({ result, onClose }) {
  const copy = () => navigator.clipboard?.writeText(result.temporary_password);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#323639] w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-white/5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="text-green-600 dark:text-green-400" size={18} />
          </div>
          <h3 className="text-base font-bold text-[#131E29] dark:text-white">Aprovado</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Conta criada. O usuário recebeu a senha temporária por e-mail e será obrigado a trocá-la no primeiro login.
        </p>
        <div className="bg-gray-50 dark:bg-[#2c3033] rounded-lg p-3 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Senha temporária</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm font-mono text-[#131E29] dark:text-white">{result.temporary_password}</code>
            <button onClick={copy} className="cursor-pointer text-xs text-[#EC6608] font-semibold hover:underline">Copiar</button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer w-full bg-[#EC6608] hover:bg-[#d95d07] text-white px-5 py-2 rounded-lg text-sm font-semibold"
        >
          Entendi
        </button>
      </motion.div>
    </motion.div>
  );
}
