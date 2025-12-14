import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Check, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu e-mail antes de entrar');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        onLogin();
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.message.includes('provider is not enabled')) {
          setError('Login com Google não está configurado no Supabase');
        } else {
          setError(error.message);
        }
        setGoogleLoading(false);
      }
    } catch (err) {
      setError('Erro ao conectar com Google. Tente novamente.');
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setMode('login');
    } catch (err) {
      setError('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
      <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
      <path d="M4.405 11.9a6.02 6.02 0 010-3.8V5.51H1.064a9.996 9.996 0 000 8.98L4.405 11.9z" fill="#FBBC05"/>
      <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.737 7.395 3.977 10 3.977z" fill="#EA4335"/>
    </svg>
  );

  const renderForm = () => {
    if (mode === 'forgot') {
      return (
        <form onSubmit={handleForgotPassword} className="w-full space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066FF] text-white rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Enviar e-mail de recuperação'
            )}
          </button>

          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
            className="w-full text-[#0066FF] font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </button>
        </form>
      );
    }

    return (
      <div className="w-full space-y-4">
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === 'signup' && (
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar senha"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
              className="text-[#0066FF] text-sm font-medium"
            >
              Esqueceu a senha?
            </button>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-[#0066FF] text-white rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Entrar com e-mail'
            ) : (
              'Criar conta'
            )}
          </button>

          <div className="text-center">
            {mode === 'login' ? (
              <p className="text-gray-600">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                  className="text-[#0066FF] font-semibold"
                >
                  Criar conta
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                  className="text-[#0066FF] font-semibold"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-8"
      >
        <div className="flex items-center justify-center mb-4">
          <ShoppingCart className="h-20 w-20 text-[#0066FF]" />
        </div>
        <h1 className="text-[#111827] text-3xl font-bold">Mape</h1>
        <p className="text-[#6B7280]">Compras Inteligentes</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <h2 className="text-[#111827] text-xl font-semibold text-center mb-6">
          {mode === 'login' && 'Bem-vindo ao Mape'}
          {mode === 'signup' && 'Criar sua conta'}
          {mode === 'forgot' && 'Recuperar senha'}
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

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm"
          >
            {success}
          </motion.div>
        )}

        {renderForm()}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-sm"
      >
        <p className="text-[#111827] font-semibold mb-4">Benefícios do Mape:</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-[#0066FF]" />
            </div>
            <p className="text-[#6B7280]">Compare preços antes de sair</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-[#0066FF]" />
            </div>
            <p className="text-[#6B7280]">Economize com base real de dados</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-[#0066FF]" />
            </div>
            <p className="text-[#6B7280]">Suas listas seguras na nuvem</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center px-8"
      >
        <small className="text-[#9CA3AF] leading-relaxed">
          Ao continuar, você concorda com os{' '}
          <button className="text-[#0066FF] hover:underline">Termos</button>
          {' '}e{' '}
          <button className="text-[#0066FF] hover:underline">Política de Privacidade</button>.
        </small>
      </motion.div>
    </div>
  );
}
