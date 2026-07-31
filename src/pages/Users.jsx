import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Mail, Shield, X, RefreshCw, ChevronLeft, ChevronRight, Loader2, Copy, KeyRound } from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/ui/CustomSelect';
import Toast from '../components/ui/Toast';
import useCurrentUser from '../hooks/useCurrentUser';
import { users as usersApi } from '../api/api';
import { AccessRequestsPanel } from './AccessRequests';

const ITEMS_PER_PAGE = 10;

const ROLE_LABEL = { admin: 'Administrador', user: 'Usuário' };
const STATUS_LABEL = { active: 'Ativo', inactive: 'Inativo', pending: 'Pendente' };
const STATUS_BADGE = {
  active: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  inactive: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
};

function formatRelative(iso) {
  if (!iso) return 'Nunca';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 'Nunca';
  const diff = (Date.now() - then.getTime()) / 1000;
  if (diff < 60) return 'Agora mesmo';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `Há ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `Há ${h} ${h === 1 ? 'hora' : 'horas'}`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    if (d === 1) return 'Ontem';
    return `Há ${d} dias`;
  }
  if (diff < 2592000) {
    const w = Math.floor(diff / 604800);
    return `Há ${w} ${w === 1 ? 'semana' : 'semanas'}`;
  }
  const months = Math.floor(diff / 2592000);
  return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export default function UsersPage() {
  const { setIsMobileOpen } = useOutletContext();
  const { data: currentUser } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const mainRef = React.useRef(null);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'user', status: 'active' });
  const [resetPassword, setResetPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await usersApi.list(params);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao carregar usuários.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const values = new Uint32Array(12);
    crypto.getRandomValues(values);
    const password = Array.from(values, (v) => chars[v % chars.length]).join('');
    setFormData((prev) => ({ ...prev, password }));
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setFormData((prev) => ({ ...prev, password: '' }));
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({ full_name: '', email: '', password: '', role: 'user', status: 'active' });
    setResetPassword(false);
    setFormError('');
    setIsUserModalOpen(true);
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setFormData({ full_name: u.full_name, email: u.email, password: '', role: u.role, status: u.status });
    setResetPassword(false);
    setFormError('');
    setIsUserModalOpen(true);
  };

  const handleDeleteClick = (u) => {
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.status && formData.status !== 'pending' && formData.status !== editingUser.status) {
          payload.status = formData.status;
        }
        if (resetPassword && formData.password) {
          payload.password = formData.password;
        }
        await usersApi.update(editingUser.id, payload);
        setToast({
          show: true,
          title: 'Usuário atualizado',
          message: payload.password
            ? 'Nova senha gerada. O usuário deverá trocá-la no próximo acesso.'
            : 'As alterações foram salvas.',
          type: 'success',
        });
      } else {
        await usersApi.create({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        setToast({
          show: true,
          title: 'Usuário criado',
          message: 'O usuário deverá trocar a senha no primeiro acesso.',
          type: 'success',
        });
      }
      closeUserModal();
      fetchUsers();
    } catch (err) {
      if (err.status === 409) {
        setFormError('Já existe um usuário com esse e-mail.');
      } else {
        setFormError(err.message || 'Erro ao salvar usuário.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await usersApi.remove(userToDelete.id);
      setToast({ show: true, title: 'Usuário removido', message: 'A conta foi excluída.', type: 'success' });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao excluir.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchTerm !== '' || roleFilter !== '' || statusFilter !== '';
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const adminCount = items.filter((u) => u.role === 'admin').length;
  const regularUserCount = items.filter((u) => u.role === 'user').length;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'requests' ? 'requests' : 'users';
  const setActiveTab = (t) => {
    const next = new URLSearchParams(searchParams);
    if (t === 'requests') next.set('tab', 'requests');
    else next.delete('tab');
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <Header title="Usuários" onOpenMobile={() => setIsMobileOpen(true)} />

      <main ref={mainRef} className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#131E29] dark:text-white">Gerenciamento de Usuários</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie os acessos, permissões e solicitações de acesso.</p>
            </div>
            {activeTab === 'users' && (
              <button
                onClick={handleNewUser}
                className="cursor-pointer bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={16} />
                Adicionar Usuário
              </button>
            )}
          </motion.div>

          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Usuários</TabButton>
            <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>Solicitações</TabButton>
          </div>

          {activeTab === 'requests' && <AccessRequestsPanel compact />}

          {activeTab === 'users' && (
          <>
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#2c3033] border border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand dark:focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <CustomSelect
                placeholder="Todas as Funções"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { value: 'admin', label: 'Administrador' },
                  { value: 'user', label: 'Usuário' },
                ]}
              />
              <CustomSelect
                placeholder="Todos os Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'active', label: 'Ativo' },
                  { value: 'inactive', label: 'Inativo' },
                  { value: 'pending', label: 'Pendente' },
                ]}
              />
            </div>
          </motion.div>

          <div className="flex items-center justify-between min-h-[24px]">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {regularUserCount} {regularUserCount === 1 ? 'usuário' : 'usuários'} · {adminCount} {adminCount === 1 ? 'admin' : 'admins'}
              {total > items.length && <span className="ml-1 text-gray-400">(de {total})</span>}
            </div>
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={clearFilters}
                  className="cursor-pointer text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1.5 transition-colors"
                >
                  <X size={14} />
                  Limpar Filtros
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#2c3033] border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Função</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Último Acesso</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <Loader2 size={18} className="inline animate-spin mr-2" />
                        Carregando...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        {hasActiveFilters ? 'Nenhum usuário encontrado com os filtros atuais.' : 'Nenhum usuário cadastrado.'}
                      </td>
                    </tr>
                  ) : (
                    items.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                              {u.full_name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#131E29] dark:text-white">{u.full_name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Mail size={12} /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Shield size={14} className={u.role === 'admin' ? 'text-brand' : 'text-gray-400'} />
                            {ROLE_LABEL[u.role] ?? u.role}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[u.status] ?? STATUS_BADGE.active}`}>
                            {STATUS_LABEL[u.status] ?? u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatRelative(u.last_active_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditUser(u)}
                              className="cursor-pointer p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-md transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            {currentUser?.id !== u.id && (
                              <button
                                onClick={() => handleDeleteClick(u)}
                                className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 pb-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`cursor-pointer w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? 'bg-brand text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          </>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#323639] w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-lg font-bold text-[#131E29] dark:text-white">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button
                  onClick={closeUserModal}
                  className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveUser} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome completo</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@fazenda.com"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
                  />
                </div>
                <div className={editingUser ? 'grid grid-cols-2 gap-3' : ''}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nível de Acesso</label>
                    <CustomSelect
                      fullWidth
                      placeholder="Selecione..."
                      value={formData.role}
                      onChange={(val) => setFormData({ ...formData, role: val })}
                      options={[
                        { value: 'user', label: 'Usuário' },
                        { value: 'admin', label: 'Administrador' },
                      ]}
                    />
                  </div>
                  {editingUser && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <CustomSelect
                        fullWidth
                        placeholder="Selecione..."
                        value={formData.status === 'pending' ? '' : formData.status}
                        onChange={(val) => setFormData({ ...formData, status: val })}
                        options={[
                          { value: 'active', label: 'Ativo' },
                          { value: 'inactive', label: 'Inativo' },
                        ]}
                      />
                      {formData.status === 'pending' && (
                        <p className="text-[11px] text-yellow-600 dark:text-yellow-400">
                          Usuário ainda não definiu sua senha.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {editingUser ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                    {!resetPassword ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResetPassword(true);
                          generatePassword();
                        }}
                        className="cursor-pointer w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#2c3033] hover:bg-gray-100 dark:hover:bg-white/5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        <KeyRound size={14} />
                        Redefinir senha
                      </button>
                    ) : (
                      <>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full px-3 py-2 pr-20 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
                          />
                          <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard?.writeText(formData.password)}
                              title="Copiar"
                              className="cursor-pointer p-1.5 text-gray-400 hover:text-brand transition-colors"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={generatePassword}
                              title="Gerar nova senha"
                              className="cursor-pointer p-1.5 text-gray-400 hover:text-brand transition-colors"
                            >
                              <RefreshCw size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] text-yellow-600 dark:text-yellow-400 flex-1">
                            O usuário deverá trocar esta senha no próximo login.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setResetPassword(false);
                              setFormData({ ...formData, password: '' });
                            }}
                            className="cursor-pointer text-[11px] text-gray-500 hover:text-brand underline transition-colors shrink-0"
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Senha Temporária</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        title="Gerar senha aleatória"
                        className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand transition-colors"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">O usuário deverá alterar esta senha no primeiro login.</p>
                  </div>
                )}
                {formError && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={closeUserModal}
                    disabled={submitting}
                    className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="cursor-pointer bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 mx-4 text-left"
            >
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-3">Excluir usuário?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                O usuário <strong className="text-gray-700 dark:text-gray-200">"{userToDelete.full_name}"</strong> será excluído permanentemente e não poderá ser recuperado.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleting}
                  className="cursor-pointer px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="cursor-pointer px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
                >
                  {deleting && <Loader2 size={12} className="animate-spin" />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative ${
        active
          ? 'text-brand'
          : 'text-gray-500 dark:text-gray-400 hover:text-[#131E29] dark:hover:text-white'
      }`}
    >
      {children}
      {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand" />}
    </button>
  );
}
