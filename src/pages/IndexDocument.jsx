import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileUp, File, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { marked } from 'marked';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import CustomSelect from '../components/ui/CustomSelect';
import Toast from '../components/ui/Toast';

function SpreadsheetPreview({ sheets }) {
  const [activeSheet, setActiveSheet] = useState(0);

  if (!sheets || sheets.length === 0) return null;

  const { name, headers, rows } = sheets[activeSheet];

  return (
    <div className="w-full h-full flex flex-col">
      {sheets.length > 1 && (
        <div className="flex gap-1 px-2 pt-2 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          {sheets.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveSheet(i)}
              className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs rounded-t-md font-medium border-b-2 transition-colors ${i === activeSheet
                ? 'border-[#EC6608] text-[#EC6608] bg-[#EC6608]/5'
                : 'border-transparent text-gray-500 hover:text-[#131E29] dark:hover:text-white'
                }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-[#2c3033]">
            <tr>
              <th className="px-2 py-1.5 text-gray-400 font-medium text-right border-b border-r border-gray-200 dark:border-gray-700 min-w-[32px]">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-1.5 text-left text-[#131E29] dark:text-gray-200 font-semibold border-b border-r border-gray-200 dark:border-gray-700 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-[#323639]' : 'bg-gray-50/50 dark:bg-[#2c3033]/40'}>
                <td className="px-2 py-1.5 text-gray-400 text-right border-r border-gray-100 dark:border-gray-700 select-none">{ri + 1}</td>
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 whitespace-nowrap"
                  >
                    {row[ci] !== undefined && row[ci] !== null ? String(row[ci]) : ''}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-8 text-center text-sm text-gray-400">
                  Planilha vazia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <span>{name}</span>
        <span>{rows.length} linhas · {headers.length} colunas</span>
      </div>
    </div>
  );
}

function JsonPreview({ data }) {
  return (
    <div className="w-full h-full overflow-auto p-4 bg-gray-50 dark:bg-[#2c3033] font-mono text-xs text-left">
      <pre className="text-gray-700 dark:text-gray-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function DocxPreview({ html }) {
  return (
    <div className="w-full h-full overflow-auto p-10 bg-white text-[#131E29] text-left">
      <div
        className="max-w-2xl mx-auto space-y-4"
        style={{ fontFamily: 'serif', lineHeight: '1.6' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function MarkdownPreview({ html }) {
  return (
    <div className="w-full h-full overflow-auto p-8 bg-white dark:bg-[#323639] text-left">
      <div
        className="max-w-2xl mx-auto prose-md"
        style={{
          fontFamily: 'Inter, sans-serif',
          lineHeight: '1.75',
          color: 'inherit',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default function IndexDocument() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [docxHtml, setDocxHtml] = useState(null);
  const [markdownHtml, setMarkdownHtml] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  const validateFile = (f) => {
    setError('');
    if (!f) return false;
    if (f.size > 100 * 1024 * 1024) { setError('O arquivo excede o limite máximo de 100 MB.'); return false; }
    const ext = f.name.split('.').pop().toLowerCase();
    const valid = ['pdf', 'docx', 'csv', 'xlsx', 'xls', 'json', 'md'];
    if (!valid.includes(ext)) { setError(`Formato não suportado. Use: ${valid.join(', ').toUpperCase()}`); return false; }
    return true;
  };

  const parseSpreadsheet = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const parsedSheets = workbook.SheetNames.map((sheetName) => {
          const ws = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          const headers = json[0] ? json[0].map(String) : [];
          const rows = json.slice(1).filter(r => r.some(c => c !== ''));
          return { name: sheetName, headers, rows };
        });

        setSheetData(parsedSheets);
      } catch {
        setError('Não foi possível ler a planilha. Verifique se o arquivo não está corrompido.');
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const processFile = (f) => {
    if (!validateFile(f)) return;
    setFile(f);
    setFilePreviewUrl(null);
    setSheetData(null);
    setJsonData(null);
    setDocxHtml(null);
    setMarkdownHtml(null);

    const ext = f.name.split('.').pop().toLowerCase();
    if (f.type === 'application/pdf') {
      setFilePreviewUrl(URL.createObjectURL(f));
    } else if (['csv', 'xlsx', 'xls'].includes(ext)) {
      parseSpreadsheet(f);
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setJsonData(json);
        } catch {
          setError('Não foi possível ler o arquivo JSON. Verifique se o formato está correto.');
        }
      };
      reader.readAsText(f);
    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value);
        } catch {
          setError('Não foi possível ler o arquivo DOCX.');
        }
      };
      reader.readAsArrayBuffer(f);
    } else if (ext === 'md') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const html = marked.parse(e.target.result);
          setMarkdownHtml(html);
        } catch {
          setError('Não foi possível ler o arquivo Markdown.');
        }
      };
      reader.readAsText(f);
    }

    if (!formData.name) {
      setFormData(prev => ({ ...prev, name: f.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setSheetData(null);
    setJsonData(null);
    setDocxHtml(null);
    setMarkdownHtml(null);
    if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!file) { 
      setError('Por favor, selecione um arquivo para indexar.'); 
      return; 
    }

    if (!formData.category) {
      setError('Por favor, selecione uma categoria obrigatória.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      removeFile();
      setFormData({ name: '', category: '', description: '' });
    }, 3000);
  };

  const hasPreview = filePreviewUrl || sheetData || jsonData || docxHtml || markdownHtml;

  return (
    <div className="h-screen w-screen bg-[#F7F7FF] dark:bg-[#2c3033] flex overflow-hidden transition-colors duration-300">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Base de conhecimento" onOpenMobile={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto box-border">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full flex flex-col gap-6">

            <motion.div variants={itemVariants}>
              <h1 className="text-2xl font-bold text-[#131E29] dark:text-white">Indexar Novo Documento</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Adicione novos arquivos à base de conhecimento da IA para consultas futuras.
              </p>
            </motion.div>

            <Toast 
              show={success} 
              onClose={() => setSuccess(false)}
              title="Sucesso!"
              message="Documento indexado com sucesso e adicionado à base."
              type="success"
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-3">
                <div
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all bg-white dark:bg-[#323639] overflow-hidden
                    ${isDragging
                      ? 'border-[#EC6608] bg-[#EC6608]/5 dark:bg-[#EC6608]/10 p-8 h-[450px]'
                      : file
                        ? hasPreview ? 'border-gray-200 dark:border-gray-700 p-0 h-[450px]' : 'border-gray-200 dark:border-gray-700 p-8 h-[450px]'
                        : 'cursor-pointer border-gray-300 dark:border-gray-600 hover:border-[#EC6608]/50 hover:bg-gray-50 dark:hover:bg-[#40454a] p-8 h-[450px]'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => { if (!file) fileInputRef.current?.click(); }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.docx,.csv,.xlsx,.xls,.json,.md" className="hidden" />

                  {file ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="absolute top-2 right-2 z-20 bg-white dark:bg-[#2c3033] rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>

                      {filePreviewUrl && (
                        <iframe
                          src={`${filePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full"
                          title="Preview do Arquivo"
                        />
                      )}

                      {sheetData && <SpreadsheetPreview sheets={sheetData} />}

                      {jsonData && <JsonPreview data={jsonData} />}

                      {docxHtml && <DocxPreview html={docxHtml} />}

                      {markdownHtml && <MarkdownPreview html={markdownHtml} />}

                      {!filePreviewUrl && !sheetData && !jsonData && !docxHtml && !markdownHtml && (
                        <div className="flex flex-col items-center text-center w-full">
                          <div className="w-20 h-20 rounded-2xl bg-[#EC6608]/10 flex items-center justify-center text-[#EC6608] mb-4">
                            <File size={40} />
                          </div>
                          <p className="text-sm font-semibold text-[#131E29] dark:text-white truncate w-full max-w-[200px]" title={file.name}>{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          <p className="text-xs text-[#EC6608] mt-4 font-medium px-4 py-2 bg-[#EC6608]/5 rounded-lg border border-[#EC6608]/10">
                            Visualização não disponível para este formato.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#2c3033] flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
                        <FileUp size={32} />
                      </div>
                      <p className="text-sm font-semibold text-[#131E29] dark:text-white mb-2">Clique ou arraste um arquivo</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX, CSV, XLSX, XLS, JSON, MD</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Até 100 MB</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-500 text-xs bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-[#323639] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <div className="space-y-5">

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome de Exibição <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Análise de Solo - Fazenda Esperança"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-xl text-sm text-[#131E29] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      fullWidth
                      placeholder="Selecione..."
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      options={[
                        { value: 'analise_solo', label: 'Análise de Solo' },
                        { value: 'relatorio_safra', label: 'Relatório de Safra' },
                        { value: 'clima', label: 'Dados Climáticos' },
                        { value: 'maquinario', label: 'Manual de Maquinário' },
                        { value: 'insumos', label: 'Tabela de Insumos' },
                        { value: 'outro', label: 'Outro' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descrição <span className="text-xs text-gray-400 font-normal">(Opcional)</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Adicione notas relevantes sobre o conteúdo deste documento para facilitar as buscas da IA..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#2c3033] border border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-[#323639] focus:border-[#EC6608] rounded-xl text-sm text-[#131E29] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={!file || !formData.category}
                      className="cursor-pointer bg-[#EC6608] hover:bg-[#d95d07] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      Iniciar Indexação
                    </button>
                  </div>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
