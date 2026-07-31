import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Loader2, Save, Eye, EyeOff, AlertCircle, Lock,
} from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/ui/CustomSelect';
import Toast from '../components/ui/Toast';
import { appSettings, user as userApi } from '../api/api';
import useCurrentUser from '../hooks/useCurrentUser';
import { BR_STATES, MAIN_CROPS, PLANTING_SYSTEMS, PREFERRED_UNITS } from '../constants/agronomy';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'azure', label: 'Azure OpenAI' },
];

const MODEL_SUGGESTIONS = {
  openai: ['gpt-4o-2024-11-20', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['anthropic/claude-sonnet-4-5', 'anthropic/claude-opus-4', 'anthropic/claude-haiku-4-5'],
  gemini: ['gemini/gemini-1.5-pro', 'gemini/gemini-1.5-flash', 'gemini/gemini-2.0-flash'],
  azure: ['azure/gpt-4o', 'azure/gpt-4o-mini'],
};

const PROVIDER_KEY_FIELDS = {
  openai: [{ key: 'OPENAI_API_KEY', label: 'OpenAI API Key', placeholder: 'sk-...' }],
  anthropic: [{ key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', placeholder: 'sk-ant-...' }],
  gemini: [{ key: 'GEMINI_API_KEY', label: 'Gemini API Key', placeholder: 'AIza...' }],
  azure: [
    { key: 'AZURE_API_KEY', label: 'Azure API Key', placeholder: '...' },
    { key: 'AZURE_API_BASE', label: 'Azure API Base', placeholder: 'https://...', secret: false },
    { key: 'AZURE_API_VERSION', label: 'Azure API Version', placeholder: '2024-02-15-preview', secret: false },
  ],
};

const BOOL_FIELDS = [
  { key: 'ROUTER_ENABLED', label: 'Roteador ativado', help: 'O LLM escolhe documentos relevantes antes de consultá-los.' },
  { key: 'PROMPT_CACHE_ENABLED', label: 'Cache de prompt', help: 'Reduz custo em providers compatíveis (Anthropic).' },
  { key: 'ENABLE_DOC_DESCRIPTION', label: 'Gerar descrição dos documentos', help: 'Descrição curta é útil para o roteador.' },
];

const INT_FIELDS = [
  { key: 'AGENT_MAX_TOOL_CALLS', label: 'Máximo de chamadas de ferramenta por consulta', min: 1, max: 50 },
  { key: 'AGENT_MAX_PAGES_PER_CALL', label: 'Máximo de páginas por chamada', min: 1, max: 50 },
];

function TabHeader({ title, description }) {
  return (
    <div className="mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
      <h2 className="text-base font-bold text-[#131E29] dark:text-white">{title}</h2>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
  );
}

function SecretField({ label, value, onChange, preview, hasValue, source, placeholder }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent rounded-lg text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 min-h-[40px]">
            {hasValue ? (
              <>
                <Lock size={13} className="text-gray-400 shrink-0" />
                <span className="font-mono">{preview || '••••••••'}</span>
                <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider ${source === 'db' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {source === 'db' ? 'Salvo' : source === 'env' ? '.env' : ''}
                </span>
              </>
            ) : (
              <span className="text-gray-400 italic">não configurado</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="cursor-pointer px-3 py-2 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors"
          >
            {hasValue ? 'Alterar' : 'Definir'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-3 pr-20 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none font-mono"
          autoFocus
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="cursor-pointer p-1.5 text-gray-400 hover:text-brand transition-colors"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); onChange(undefined); }}
            className="cursor-pointer px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-[#131E29] dark:hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, help, source, suggestions, listId }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {source === 'env' && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">.env</span>
        )}
      </div>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={suggestions && suggestions.length ? listId : undefined}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none font-mono"
      />
      {suggestions && suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
      {help && <p className="text-[11px] text-gray-500 dark:text-gray-400">{help}</p>}
    </div>
  );
}

function ToggleField({ label, value, onChange, help }) {
  return (
    <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#2c3033] rounded-lg cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-brand cursor-pointer"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-[#131E29] dark:text-white">{label}</p>
        {help && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{help}</p>}
      </div>
    </label>
  );
}

function NumberField({ label, value, onChange, min, max }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { setIsMobileOpen } = useOutletContext();
  const { isAdmin } = useCurrentUser();
  const [remote, setRemote] = useState(null);
  const [dirty, setDirty] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileDirty, setProfileDirty] = useState({});

  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  const applyTheme = (t) => {
    setTheme(t);
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', t);
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const prof = await userApi.getProfile();
      setProfile(prof ?? {});
      setProfileDirty({});
      if (isAdmin) {
        const data = await appSettings.get();
        setRemote(data.settings ?? {});
        setDirty({});
      }
    } catch (err) {
      setToast({ show: true, title: 'Erro', message: err.message || 'Falha ao carregar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const getProfile = (k) => (k in profileDirty ? profileDirty[k] : (profile?.[k] ?? ''));
  const setProfileValue = (k, v) => setProfileDirty((prev) => ({ ...prev, [k]: v }));
  const hasProfileDirty = Object.keys(profileDirty).length > 0;

  const getValue = (key) => {
    if (key in dirty) return dirty[key];
    const meta = remote?.[key];
    return meta?.value ?? '';
  };

  const setValue = (key, value) => {
    setDirty((prev) => ({ ...prev, [key]: value }));
  };

  const getSecretMeta = (key) => {
    const meta = remote?.[key] || {};
    const override = dirty[key];
    return {
      preview: meta.preview,
      hasValue: meta.has_value,
      source: meta.source,
      pending: override !== undefined,
      override,
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdmin && Object.keys(dirty).length > 0) {
        const payload = {};
        for (const [k, v] of Object.entries(dirty)) {
          if (v === undefined || v === null) payload[k] = '';
          else payload[k] = v;
        }
        const data = await appSettings.update(payload);
        setRemote(data.settings ?? {});
        setDirty({});
      }
      if (Object.keys(profileDirty).length > 0) {
        const prof = await userApi.updateProfile(profileDirty);
        setProfile(prof ?? {});
        setProfileDirty({});
      }
      setConfirmOpen(false);
      setToast({ show: true, title: 'Configurações salvas', message: 'As alterações já estão em vigor.', type: 'success' });
    } catch (err) {
      setToast({ show: true, title: 'Erro ao salvar', message: err.message || 'Falha.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const provider = getValue('LLM_PROVIDER') || 'openai';
  const providerFields = PROVIDER_KEY_FIELDS[provider] || [];
  const hasDirty = Object.keys(dirty).length > 0 || hasProfileDirty;
  const totalDirtyCount = Object.keys(dirty).length + Object.keys(profileDirty).length;

  const tabs = [
    { id: 'profile', label: 'Perfil', adminOnly: false },
    { id: 'appearance', label: 'Aparência', adminOnly: false },
    { id: 'provider', label: 'Provedor', adminOnly: true },
    { id: 'rag', label: 'Comportamento RAG', adminOnly: true },
  ];
  const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin);
  const [activeTab, setActiveTab] = useState('profile');

  const renderTab = () => {
    if (activeTab === 'profile') {
      return (
        <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-4">
          <TabHeader
            title="Perfil agronômico"
            description="Esses dados são enviados como contexto ao assistente em cada consulta. Deixe em branco se não souber."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <CustomSelect
                fullWidth
                placeholder="Selecione..."
                value={getProfile('state') || ''}
                onChange={(v) => setProfileValue('state', v)}
                options={BR_STATES}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Município</label>
              <input
                type="text"
                value={getProfile('city')}
                onChange={(e) => setProfileValue('city', e.target.value)}
                placeholder="ex: Campo Grande"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-brand rounded-lg text-sm text-[#131E29] dark:text-white outline-none"
              />
            </div>
          </div>
          {profile?.biome && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Bioma estimado: <span className="font-semibold text-brand">{profile.biome}</span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cultura principal</label>
              <CustomSelect
                fullWidth
                placeholder="Selecione..."
                value={getProfile('main_crop') || ''}
                onChange={(v) => setProfileValue('main_crop', v)}
                options={MAIN_CROPS}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sistema de plantio</label>
              <CustomSelect
                fullWidth
                placeholder="Selecione..."
                value={getProfile('planting_system') || ''}
                onChange={(v) => setProfileValue('planting_system', v)}
                options={PLANTING_SYSTEMS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unidades preferidas</label>
            <CustomSelect
              fullWidth
              placeholder="Selecione..."
              value={getProfile('preferred_units') || ''}
              onChange={(v) => setProfileValue('preferred_units', v)}
              options={PREFERRED_UNITS}
            />
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'appearance') {
      return (
        <motion.div key="appearance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          <TabHeader title="Aparência" description="Aplicado apenas ao seu navegador." />
          <div className="flex gap-3">
            <button
              onClick={() => applyTheme('light')}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                theme === 'light' ? 'border-brand bg-brand/5 text-brand' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand/50'
              }`}
            >
              <Sun size={16} /> Claro
            </button>
            <button
              onClick={() => applyTheme('dark')}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                theme === 'dark' ? 'border-brand bg-brand/5 text-brand' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand/50'
              }`}
            >
              <Moon size={16} /> Escuro
            </button>
          </div>
        </motion.div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="flex items-start gap-3 p-4">
          <AlertCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configurações avançadas de IA são gerenciadas por administradores.
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-brand" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      );
    }

    if (!remote) return null;

    if (activeTab === 'provider') {
      return (
        <motion.div key="provider" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-4">
          <TabHeader title="Provedor de IA" description="Provedor padrão, chave de API e modelo usado nas consultas." />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Provedor padrão</label>
            <CustomSelect fullWidth placeholder="Selecione..." value={provider} onChange={(v) => setValue('LLM_PROVIDER', v)} options={PROVIDERS} />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Define qual campo de chave é exibido abaixo.
            </p>
          </div>

          <TextField
            label="Modelo"
            value={getValue('LLM_MODEL')}
            onChange={(v) => setValue('LLM_MODEL', v)}
            placeholder="ex: gpt-4o-2024-11-20"
            source={remote?.LLM_MODEL?.source}
            help="Digite ou escolha um modelo no formato LiteLLM. O prefixo (anthropic/, gemini/, azure/) define o provider real."
            suggestions={MODEL_SUGGESTIONS[provider] || []}
            listId={`model-suggestions-${provider}`}
          />

          {providerFields.map((f) => {
            if (f.secret === false) {
              return (
                <TextField key={f.key} label={f.label} value={getValue(f.key)} onChange={(v) => setValue(f.key, v)} placeholder={f.placeholder} source={remote?.[f.key]?.source} />
              );
            }
            const meta = getSecretMeta(f.key);
            return (
              <SecretField
                key={f.key}
                label={f.label}
                placeholder={f.placeholder}
                value={meta.pending ? meta.override : undefined}
                onChange={(v) => setValue(f.key, v)}
                preview={meta.preview}
                hasValue={meta.hasValue}
                source={meta.source}
              />
            );
          })}
        </motion.div>
      );
    }

if (activeTab === 'rag') {
      return (
        <motion.div key="rag" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="space-y-4">
          <TabHeader title="Comportamento do RAG" description="Ajustes finos do pipeline de consulta e indexação." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INT_FIELDS.map((f) => (
              <NumberField key={f.key} label={f.label} value={getValue(f.key)} onChange={(v) => setValue(f.key, v)} min={f.min} max={f.max} />
            ))}
          </div>
          <div className="space-y-2 pt-2">
            {BOOL_FIELDS.map((f) => (
              <ToggleField key={f.key} label={f.label} help={f.help} value={getValue(f.key)} onChange={(v) => setValue(f.key, v)} />
            ))}
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <>
      <Header title="Configurações" onOpenMobile={() => setIsMobileOpen(true)} />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[#131E29] dark:text-white">Configurações</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isAdmin ? 'Gerencie provedor de IA, modelos e comportamento do RAG.' : 'Preferências locais da sua conta.'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col">
            <div className="flex flex-wrap gap-1 px-3 pt-3 border-b border-gray-100 dark:border-gray-700">
              {visibleTabs.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`cursor-pointer relative px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                      active
                        ? 'text-brand bg-brand/5 dark:bg-brand/10'
                        : 'text-gray-500 dark:text-gray-400 hover:text-[#131E29] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                    {active && (
                      <motion.span
                        layoutId="settings-tab-underline"
                        className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {renderTab()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {hasDirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-lg"
          >
            <span className="text-xs text-gray-600 dark:text-gray-300 pl-2 pr-1">
              {totalDirtyCount} alteração{totalDirtyCount === 1 ? '' : 's'} pendente{totalDirtyCount === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => { setDirty({}); setProfileDirty({}); }}
              disabled={saving}
              className="cursor-pointer px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-50"
            >
              Descartar
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={saving}
              className="cursor-pointer bg-brand hover:bg-brand-dark text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save size={13} />
              Salvar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => !saving && setConfirmOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#323639] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 mx-4"
            >
              <h3 className="text-sm font-semibold text-[#131E29] dark:text-white mb-2">Salvar configurações?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                {totalDirtyCount} alteraç{totalDirtyCount === 1 ? 'ão' : 'ões'} ser{totalDirtyCount === 1 ? 'á' : 'ão'} aplicada{totalDirtyCount === 1 ? '' : 's'} imediatamente. As próximas consultas já usarão os novos valores.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={saving}
                  className="cursor-pointer px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2c3033] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  Salvar
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
