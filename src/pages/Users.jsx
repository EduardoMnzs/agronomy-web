import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, MoreVertical, Edit2, Trash2, Mail, Shield, CheckCircle2, XCircle, ChevronDown, AlertTriangle, X, RefreshCw } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import CustomSelect from '../components/ui/CustomSelect';

const mockUsers = [
  { id: 1, name: 'Eduardo Menezes', email: 'eduardo@agronomy.com', role: 'Administrador', status: 'Ativo', lastActive: 'Agora mesmo' },
  { id: 2, name: 'Carlos Silva', email: 'carlos.silva@fazenda.com', role: 'Usuário', status: 'Ativo', lastActive: 'Há 2 horas' },
  { id: 3, name: 'Ana Oliveira', email: 'ana.oliveira@agrotech.com', role: 'Usuário', status: 'Inativo', lastActive: 'Há 5 dias' },
  { id: 4, name: 'João Santos', email: 'joao.santos@fazenda.com', role: 'Usuário', status: 'Pendente', lastActive: 'Nunca' },
];

export default function UsersPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Usuário' });

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'Usuário' });
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setIsUserModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    setIsUserModalOpen(false);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === '' || user.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="h-screen w-screen bg-[#F7F7FF] dark:bg-[#2c3033] flex overflow-hidden transition-colors duration-300">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Usuários"
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-6xl mx-auto w-full flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#131E29] dark:text-white">Gerenciamento de Usuários</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie os acessos e permissões da plataforma.</p>
              </div>
              <button
                onClick={handleNewUser}
                className="cursor-pointer bg-[#EC6608] hover:bg-[#d95d07] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={16} />
                Adicionar Usuário
              </button>
            </motion.div>

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
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#2c3033] border border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] dark:focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EC6608]/20 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <CustomSelect
                  placeholder="Todas as Funções"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={[
                    { value: 'administrador', label: 'Administrador' },
                    { value: 'usuário', label: 'Usuário' }
                  ]}
                />
                <CustomSelect
                  placeholder="Todos os Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'inativo', label: 'Inativo' },
                    { value: 'pendente', label: 'Pendente' }
                  ]}
                />
              </div>
            </motion.div>

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
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#EC6608]/10 text-[#EC6608] flex items-center justify-center font-bold text-sm shrink-0">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#131E29] dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Mail size={12} /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Shield size={14} className={user.role === 'Administrador' ? 'text-[#EC6608]' : 'text-gray-400'} />
                            {user.role}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                              user.status === 'Inativo' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
                            }`}>
                            {user.status === 'Ativo'}
                            {user.status === 'Inativo'}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {user.lastActive}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="cursor-pointer p-1.5 text-gray-400 hover:text-[#EC6608] hover:bg-[#EC6608]/10 rounded-md transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          Nenhum usuário encontrado com "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>

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
                  onClick={() => setIsUserModalOpen(false)}
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nível de Acesso</label>
                  <CustomSelect
                    fullWidth
                    placeholder="Selecione..."
                    value={formData.role}
                    onChange={(val) => setFormData({ ...formData, role: val })}
                    options={[
                      { value: 'Usuário', label: 'Usuário' },
                      { value: 'Administrador', label: 'Administrador' }
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {editingUser ? 'Nova Senha (opcional)' : 'Senha Temporária'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Deixe em branco para manter" : "Senha gerada ou definida"}
                      className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-lg text-sm text-[#131E29] dark:text-white outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      title="Gerar senha aleatória"
                      className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#EC6608] transition-colors"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  {!editingUser && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">O usuário deverá alterar esta senha no primeiro login.</p>
                  )}
                </div>
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer bg-[#EC6608] hover:bg-[#d95d07] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
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
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 mx-4 text-left"
            >
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-3">Excluir usuário?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                O usuário <strong className="text-gray-700 dark:text-gray-200">"{userToDelete.name}"</strong> será excluído permanentemente e não poderá ser recuperado.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="cursor-pointer px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="cursor-pointer px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                >
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
