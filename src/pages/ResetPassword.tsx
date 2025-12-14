import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabase';
import type { Screen } from '../types';

interface ResetPasswordProps {
  onNavigate: (screen: Screen) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  // Processar parâmetros da URL e inicializar sessão
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setInitializing(true);
        
        // Ler parâmetros da URL (query string ou hash)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Tentar obter tokens da query string primeiro, depois do hash
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = urlParams.get('type') || hashParams.get('type');

        // Verificar se é um link de recovery
        if (type !== 'recovery' || !accessToken) {
          console.error('Link inválido: type ou access_token ausente', { type, hasAccessToken: !!accessToken });
          setInvalidLink(true);
          setInitializing(false);
          return;
        }

        // Inicializar sessão com os tokens
        // Se refresh_token não estiver presente, tentar apenas com access_token
        const sessionData: { access_token: string; refresh_token?: string } = {
          access_token: accessToken
        };
        
        if (refreshToken) {
          sessionData.refresh_token = refreshToken;
        }

        const { data, error: sessionError } = await supabase.auth.setSession(sessionData);

        if (sessionError) {
          console.error('Erro ao inicializar sessão:', sessionError);
          setError(sessionError.message || 'Link inválido ou expirado');
          setInvalidLink(true);
          setInitializing(false);
          return;
        }

        // Verificar se a sessão foi estabelecida
        if (!data.session) {
          console.error('Sessão não foi estabelecida após setSession');
          setError('Não foi possível estabelecer a sessão. O link pode ter expirado.');
          setInvalidLink(true);
          setInitializing(false);
          return;
        }

        // Limpar tokens da URL por segurança (tanto hash quanto query string)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        setInitializing(false);
      } catch (err) {
        console.error('Erro inesperado ao processar link:', err);
        setError('Erro ao processar link de redefinição');
        setInvalidLink(true);
        setInitializing(false);
      }
    };

    initializeSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      toast.success('Senha alterada com sucesso!');
      
      // Fazer logout e redirecionar para login
      await supabase.auth.signOut();
      
      setTimeout(() => {
        // Limpar URL e navegar para login
        window.history.replaceState({}, document.title, '/');
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mb-4"></div>
        <p className="text-[#6B7280]">Processando link de redefinição...</p>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Link inválido ou expirado</h2>
          <p className="text-[#6B7280] mb-6">
            Este link de redefinição de senha não é válido ou já expirou. Solicite um novo link.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-[#0066FF] text-white rounded-xl py-4 px-6 font-semibold hover:bg-[#0052CC] transition-colors"
          >
            Voltar para Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Senha alterada com sucesso!</h2>
          <p className="text-[#6B7280]">Redirecionando para o login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <ShoppingCart className="h-16 w-16 text-[#0066FF]" />
        </div>
        <h1 className="text-[#111827] text-2xl font-bold">Mape</h1>
        <p className="text-[#6B7280]">Compras Inteligentes</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <h2 className="text-[#111827] text-xl font-semibold text-center mb-6">
          Redefinir sua senha
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nova senha"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Salvar nova senha'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
