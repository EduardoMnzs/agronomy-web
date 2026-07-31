import { useState, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Loader2, Mail, Calendar, Shield, CheckCircle2, Pencil,
  KeyRound, Settings as SettingsIcon, Trash2, X, Save, Eye, EyeOff, AlertCircle,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Toast from '../components/ui/Toast';
import { user as userApi } from '../api/api';
import useCurrentUser from '../hooks/useCurrentUser';

const STATUS_META = {
  active: { label: 'Ativo', cls: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' },
  inactive: { label: 'Inativo', cls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' },
  pending: { label: 'Pendente', cls: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20' },
};

const ROLE_LABEL = { admin: 'Administrador', user: 'Usuário' };

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function ProfilePage() {
  const { setIsMobileOpen } = useOutletContext();
  const { data: me, initials, updateLocal } = useCurrentUser();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [avatarSaving, setAvatarSaving] = useState(false);
  const [deleteAvatarOpen, setDeleteAvatarOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const fileRef = useRef(null);

  if (!me) {
    return (
      <>
        <Header title="Perfil" onOpenMobile={() => setIsMobileOpen(true)} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-brand" />
        </main>
      </>
    );
  }

  const status = STATUS_META[me.status] ?? STATUS_META.active;

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ show: true, title: 'Erro', message: 'Imagem excede 5 MB.', type: 'error' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setToast({ show: true, title: 'Erro', message: 'Formato não suportado. Use JPG, PNG, WEBP ou GIF.', type: 'error' });
      return;
    }
    setAvatarSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const updated = await userApi.uploadAvatar(fd);
      updateLocal(updated);
      setToast({ show: true, title: 'Foto atualizada', message: '', type: 'success' });
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao enviar.', type: 'error' });
    } finally {
      setAvatarSaving(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    setAvatarSaving(true);
    try {
      const updated = await userApi.deleteAvatar();
      updateLocal(updated);
      setDeleteAvatarOpen(false);
      setToast({ show: true, title: 'Foto removida', message: '', type: 'success' });
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha.', type: 'error' });
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleSaveName = async () => {
    const name = nameDraft.trim();
    if (!name || name === me.full_name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const updated = await userApi.updateMe({ full_name: name });
      updateLocal(updated);
      setEditingName(false);
      setToast({ show: true, title: 'Nome atualizado', message: '', type: 'success' });
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha.', type: 'error' });
    } finally {
      setSavingName(false);
    }
  };

  return (
    <>
      <Header title="Perfil" onOpenMobile={() => setIsMobileOpen(true)} />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative group mx-auto sm:mx-0">
                <div className="w-28 h-28 rounded-full bg-brand text-white flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden">
                  {me.avatar_url ? (
                    <img src={me.avatar_url} alt={me.full_name} className="w-full h-full object-cover" />
                  ) : (
                    initials || '?'
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarSaving}
                  title="Alterar foto"
                  className="cursor-pointer absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white dark:bg-[#2c3033] border-2 border-white dark:border-[#323639] shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand transition-colors disabled:opacity-60"
                >
                  {avatarSaving ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarPick}
                  className="hidden"
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                {editingName ? (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                      autoFocus
                      className="text-xl font-bold bg-transparent border-b-2 border-brand outline-none text-[#131E29] dark:text-white w-full max-w-sm"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="cursor-pointer p-1.5 rounded-md text-brand hover:bg-brand/10 disabled:opacity-60"
                    >
                      {savingName ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="cursor-pointer p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl font-bold text-[#131E29] dark:text-white truncate">{me.full_name}</h1>
                    <button
                      onClick={() => { setNameDraft(me.full_name); setEditingName(true); }}
                      title="Editar nome"
                      className="cursor-pointer p-1.5 rounded-md text-gray-400 hover:text-brand hover:bg-brand/10 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1 justify-center sm:justify-start">
                  <Mail size={13} /> {me.email}
                </div>
                <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.cls}`}>
                    {status.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20">
                    <Shield size={11} /> {ROLE_LABEL[me.role] ?? me.role}
                  </span>
                </div>
              </div>
            </div>

            {me.avatar_url && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setDeleteAvatarOpen(true)}
                  className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                >
                  <Trash2 size={13} /> Remover foto
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-[#131E29] dark:text-white mb-4">Informações da conta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="E-mail" value={me.email} />
              <InfoRow icon={Shield} label="Função" value={ROLE_LABEL[me.role] ?? me.role} />
              <InfoRow icon={null} label="Status" value={status.label} />
              <InfoRow icon={Calendar} label="Conta criada em" value={formatDate(me.created_at)} />
              <InfoRow icon={Calendar} label="Último acesso" value={formatDate(me.last_active_at)} />
              <InfoRow icon={KeyRound} label="ID" value={`#${me.id}`} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-[#131E29] dark:text-white mb-4">Segurança e preferências</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard
                icon={KeyRound}
                title="Alterar senha"
                description="Troque sua senha pessoal."
                onClick={() => setPasswordOpen(true)}
              />
              <ActionCard
                as={Link}
                to="/settings"
                icon={SettingsIcon}
                title="Configurações"
                description="Perfil agronômico, tema e (admin) integração."
              />
            </div>
          </motion.div>
        </div>
      </main>

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      <AnimatePresence>
        {deleteAvatarOpen && (
          <ConfirmModal
            title="Remover foto de perfil?"
            description="Sua inicial voltará a ser exibida no lugar da foto."
            confirmLabel="Remover"
            confirmVariant="danger"
            loading={avatarSaving}
            onConfirm={handleAvatarDelete}
            onClose={() => setDeleteAvatarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {passwordOpen && (
          <PasswordModal
            onClose={() => setPasswordOpen(false)}
            onSuccess={() => {
              setPasswordOpen(false);
              setToast({ show: true, title: 'Senha alterada', message: 'Use a nova senha no próximo login.', type: 'success' });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#2c3033] flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={14} className="text-gray-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-[#131E29] dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick, as, to }) {
  const Tag = as || 'button';
  const props = as ? { to } : { onClick, type: 'button' };
  return (
    <Tag
      {...props}
      className="cursor-pointer text-left flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 hover:border-brand hover:bg-brand/5 dark:hover:bg-brand/10 rounded-xl transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#131E29] dark:text-white group-hover:text-brand">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </Tag>
  );
}

function ConfirmModal({ title, description, confirmLabel, confirmVariant, loading, onConfirm, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 mx-4"
      >
        <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-2">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{description}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer px-4 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-60 flex items-center gap-2 ${
              confirmVariant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-brand hover:bg-brand-dark'
            }`}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PasswordModal({ onClose, onSuccess }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (next.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    if (next !== confirm) { setError('A nova senha e a confirmação não coincidem.'); return; }
    if (next === current) { setError('A nova senha deve ser diferente da atual.'); return; }
    setSaving(true);
    try {
      await userApi.changePassword({ currentPassword: current, newPassword: next });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Falha ao alterar senha.');
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
          <h2 className="text-lg font-bold text-[#131E29] dark:text-white">Alterar senha</h2>
          <button onClick={onClose} className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <PasswordInput label="Senha atual" value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} autoFocus />
          <PasswordInput label="Nova senha" value={next} onChange={setNext} show={showNext} onToggle={() => setShowNext((v) => !v)} hint="Mínimo 6 caracteres." />
          <PasswordInput label="Confirmar nova senha" value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
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
              type="submit"
              disabled={saving || !current || !next || !confirm}
              className="cursor-pointer bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Alterar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PasswordInput({ label, value, onChange, show, onToggle, hint, autoFocus }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-3 pr-10 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none"
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
