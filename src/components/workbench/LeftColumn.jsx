import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Layers, MapPin, Ruler, Tractor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { documents as docsApi, myDocuments as myDocsApi, user as userApi } from '../../api/api';
import { BR_STATES, MAIN_CROPS, PLANTING_SYSTEMS, PREFERRED_UNITS } from '../../constants/agronomy';

const LABEL_MAPS = {
  state: Object.fromEntries(BR_STATES.map((s) => [s.value, s.label])),
  main_crop: Object.fromEntries(MAIN_CROPS.map((s) => [s.value, s.label])),
  planting_system: Object.fromEntries(PLANTING_SYSTEMS.map((s) => [s.value, s.label])),
  preferred_units: Object.fromEntries(PREFERRED_UNITS.map((s) => [s.value, s.label])),
};

function buildContextData(profile) {
  if (!profile) return [];
  const out = [];
  if (profile.state) {
    const label = LABEL_MAPS.state[profile.state] || profile.state;
    const region = profile.city ? `${profile.city} — ${profile.state}` : label;
    out.push({ icon: MapPin, label: 'Região', value: region });
  }
  if (profile.biome) {
    out.push({ icon: Layers, label: 'Bioma', value: profile.biome });
  }
  if (profile.main_crop) {
    out.push({ icon: Sprout, label: 'Cultura', value: LABEL_MAPS.main_crop[profile.main_crop] || profile.main_crop });
  }
  if (profile.planting_system) {
    out.push({ icon: Tractor, label: 'Plantio', value: LABEL_MAPS.planting_system[profile.planting_system] || profile.planting_system });
  }
  if (profile.preferred_units) {
    out.push({ icon: Ruler, label: 'Unidades', value: LABEL_MAPS.preferred_units[profile.preferred_units] || profile.preferred_units });
  }
  return out;
}

const Card = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    }}
    className={`bg-white dark:bg-[#323639] border border-gray-200 dark:border-transparent rounded-[12px] p-[14px] shadow-[0_1px_3px_rgba(19,30,41,.06)] dark:shadow-sm flex flex-col transition-colors duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

function SectionLabel({ label }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-2">
      {label}
    </p>
  );
}

export default function LeftColumn({ selectedIds, onSelectionChange }) {
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    Promise.all([
      docsApi.list().catch(() => null),
      myDocsApi.list().catch(() => []),
      userApi.getProfile().catch(() => null),
    ]).then(([kbData, mine, prof]) => {
      const items = kbData?.items ?? kbData ?? [];
      const ready = items.filter((d) => d.status === 'done');
      const myReady = (mine ?? []).filter((d) => d.status === 'done');
      setKnowledgeDocs(ready);
      setMyDocs(myReady);
      setProfile(prof);
      const allIds = [
        ...ready.map((d) => d.id),
        ...myReady.map((d) => `user_${d.id}`),
      ];
      onSelectionChange(allIds);
    });
  }, []);

  const contextData = buildContextData(profile);

  const toggle = (id) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id],
    );
  };

  const allIds = [
    ...knowledgeDocs.map((d) => d.id),
    ...myDocs.map((d) => `user_${d.id}`),
  ];
  const selectAll = () => onSelectionChange(allIds);
  const clearAll = () => onSelectionChange([]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
      }}
      className="flex flex-col gap-[14px] h-full overflow-hidden"
    >
      <Card className="shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
            Contexto
          </h2>
          <Link to="/settings" className="text-[10px] text-gray-400 hover:text-[#EC6608] transition-colors">
            Editar
          </Link>
        </div>
        {contextData.length === 0 ? (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
            Defina sua região, cultura e sistema de plantio em <Link to="/settings" className="text-[#EC6608] font-semibold hover:underline">Configurações</Link> para que o assistente use esses dados automaticamente.
          </p>
        ) : (
        <div className="space-y-2">
          {contextData.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 shrink-0">
                <Icon size={12} className="shrink-0" />
                <span className="text-[11px]">{label}</span>
              </div>
              <span className="text-[11px] font-semibold text-[#131E29] dark:text-white text-right truncate">
                {value}
              </span>
            </div>
          ))}
        </div>
        )}
      </Card>

      <Card className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
            Documentos
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="cursor-pointer text-[10px] text-gray-400 hover:text-[#EC6608] dark:hover:text-[#EC6608] transition-colors">
              Tudo
            </button>
            <span className="text-gray-300 dark:text-gray-600 text-[10px]">|</span>
            <button onClick={clearAll} className="cursor-pointer text-[10px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              Limpar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 flex flex-col gap-4">
          <div>
            <SectionLabel label="Base de conhecimento" />
            <div className="flex flex-col gap-2">
              {knowledgeDocs.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">Nenhum documento indexado.</p>
              )}
              {knowledgeDocs.map((doc) => (
                <DocCheckbox
                  key={doc.id}
                  id={doc.id}
                  name={doc.name}
                  checked={selectedIds.includes(doc.id)}
                  onChange={toggle}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel label="Meus documentos" />
            <div className="flex flex-col gap-2">
              {myDocs.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">Nenhum documento pessoal.</p>
              )}
              {myDocs.map((doc) => (
                <DocCheckbox
                  key={doc.id}
                  id={`user_${doc.id}`}
                  name={doc.name}
                  checked={selectedIds.includes(`user_${doc.id}`)}
                  onChange={toggle}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function DocCheckbox({ id, name, checked, onChange }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(id)}
        className="mt-[3px] w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c3033] accent-[#EC6608] transition-colors duration-300 cursor-pointer"
      />
      <span className="text-xs text-[#131E29] dark:text-gray-200 group-hover:text-[#EC6608] truncate transition-colors duration-300 leading-relaxed">
        {name}
      </span>
    </label>
  );
}
