import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabase';
import type { Screen } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SettingsProfileProps {
  onNavigate: (screen: Screen) => void;
}

export function SettingsProfile({ onNavigate }: SettingsProfileProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Erro ao buscar usuário:', authError);
        setError('Erro ao carregar dados do usuário');
        setUser(null);
        return;
      }

      setUser(user);
      // Inicializar o nome do campo editável
      if (user) {
        setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar usuário:', err);
      setError('Erro inesperado ao carregar dados');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Obter nome do usuário (user_metadata.full_name ou fallback)
  const getUserName = (): string => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.user_metadata?.name || '';
  };

  // Obter email do usuário
  const getUserEmail = (): string => {
    return user?.email || '';
  };

  // Salvar nome do usuário
  const handleSaveName = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    const trimmedName = name.trim();
    
    try {
      setSaving(true);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: trimmedName }
      });

      if (updateError) {
        console.error('Erro ao atualizar nome:', updateError);
        toast.error('Erro ao salvar nome. Tente novamente.');
        return;
      }

      // Recarregar dados do usuário para atualizar o estado
      await loadUser();
      toast.success('Nome salvo com sucesso!');
    } catch (err) {
      console.error('Erro inesperado ao salvar nome:', err);
      toast.error('Erro inesperado ao salvar nome');
    } finally {
      setSaving(false);
    }
  };

  // Alterar senha via e-mail
  const handleChangePassword = async () => {
    if (!user || !user.email) {
      toast.error('E-mail não disponível');
      return;
    }

    try {
      setChangingPassword(true);
      
      // Usar URL de produção ou fallback para desenvolvimento
      const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD;
      const redirectUrl = isProduction
        ? 'https://mape.vercel.app/reset-password'
        : `${window.location.origin}/reset-password`;
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl
      });

      if (resetError) {
        console.error('Erro ao enviar e-mail de redefinição:', resetError);
        toast.error('Erro ao enviar e-mail. Tente novamente.');
        return;
      }

      toast.success('Enviamos um link para seu e-mail');
    } catch (err) {
      console.error('Erro inesperado ao alterar senha:', err);
      toast.error('Erro inesperado ao enviar e-mail');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#111827]" />
          </button>
          <div>
            <h2 className="text-[#111827]">Perfil</h2>
            <small className="text-[#6B7280]">Seus dados pessoais</small>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-5">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[40vh]"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
          </motion.div>
        ) : !user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center mb-5"
          >
            <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
            <h3 className="text-[#92400E] text-xl font-bold mb-3">
              Usuário não autenticado
            </h3>
            <p className="text-[#B45309]">
              Faça login para visualizar seus dados de perfil.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-[#374151] font-semibold mb-2 px-1">Nome</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-[#6B7280]" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full bg-white border border-[#E5E7EB] rounded-2xl px-14 py-4 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#374151] font-semibold mb-2 px-1">E-mail</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-[#6B7280]" />
                  </div>
                  <input
                    type="email"
                    readOnly
                    value={getUserEmail() || 'Não informado'}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-14 py-4 text-[#111827] cursor-default"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveName}
                disabled={saving || name.trim() === getUserName()}
                className="w-full bg-[#0066FF] text-white rounded-2xl py-4 font-bold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#E5E7EB] text-[#374151] rounded-2xl py-4 font-semibold hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  {changingPassword ? 'Enviando...' : 'Alterar senha'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
