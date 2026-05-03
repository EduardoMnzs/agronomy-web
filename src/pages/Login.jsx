import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sprout, Zap, Brain, Loader2 } from 'lucide-react';
import agronomyLogo from '../assets/images/Agronomy-logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    // Simula um delay de rede para mostrar o loading premium
    setTimeout(() => {
      setIsLoading(false);
      navigate('/app');
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7FF] dark:bg-[#1f2123] flex relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#EC6608]/20 dark:bg-[#EC6608]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="hidden lg:flex lg:w-1/2 relative bg-[#131E29] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="absolute -left-40 top-1/2 -translate-y-1/2 pointer-events-none opacity-15">
          <img src={agronomyLogo} alt="Background Logo" className="w-[700px] h-[700px] object-contain" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131E29]/50 to-[#131E29]" />

        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-2xl">
                <img src={agronomyLogo} alt="Agronomy Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="text-3xl tracking-tight leading-none text-white">
                <span className="font-bold">AGRONO</span><span className="font-light text-white/80">MY</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white leading-[1.15] mb-5">
              A inteligência do campo <br /><span className="text-[#EC6608]">ao seu alcance.</span>
            </h1>
            <p className="text-base text-gray-400 leading-relaxed max-w-md">
              Acesse a base de conhecimento avançada, analise dados da safra e tome decisões com precisão suportada por IA.
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { text: 'Análise Rápida' },
                { text: 'Contexto Inteligente' },
                { text: 'Consultas Detalhadas' }
              ].map((feature, i) => {
                return (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (i * 0.1), duration: 0.4 }}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    {feature.text}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-[360px] relative z-10"
        >
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-white dark:bg-[#2c3033] rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-sm">
              <img src={agronomyLogo} alt="Agronomy Logo" className="w-6 h-6 object-contain" />
            </div>
            <div className="text-2xl tracking-tight leading-none text-[#131E29] dark:text-white">
              <span className="font-bold">AGRONO</span><span className="font-light">MY</span>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-[#131E29] dark:text-white mb-1.5">Bem-vindo de volta</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Insira suas credenciais para acessar a plataforma.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400 group-focus-within:text-[#EC6608] transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eduardo@agronomy.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-[#2c3033] border border-gray-200 dark:border-gray-700 rounded-lg text-[#131E29] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#EC6608] focus:ring-2 focus:ring-[#EC6608]/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400 group-focus-within:text-[#EC6608] transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-[#2c3033] border border-gray-200 dark:border-gray-700 rounded-lg text-[#131E29] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#EC6608] focus:ring-2 focus:ring-[#EC6608]/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-700 dark:bg-[#2c3033] accent-[#EC6608] focus:ring-[#EC6608]/30 transition-colors cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-[#131E29] dark:hover:text-white transition-colors">
                  Continuar conectado
                </label>
              </div>
              <a href="#" className="text-[11px] font-medium text-[#EC6608] hover:text-[#d95d07] transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !email || !password}
              className="cursor-pointer w-full mt-6 py-2.5 px-4 bg-[#EC6608] hover:bg-[#d95d07] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(236,102,8,0.39)] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                <>
                  <span>Entrar</span>
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Ainda não tem uma conta? <a href="#" className="font-semibold text-[#131E29] dark:text-white hover:text-[#EC6608] dark:hover:text-[#EC6608] transition-colors">Solicitar acesso</a>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
