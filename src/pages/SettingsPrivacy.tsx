import { motion } from 'motion/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { Screen } from '../types';

interface SettingsPrivacyProps {
  onNavigate: (screen: Screen) => void;
}

export function SettingsPrivacy({ onNavigate }: SettingsPrivacyProps) {

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
            <h2 className="text-[#111827]">Privacidade</h2>
            <small className="text-[#6B7280]">Controle seus dados</small>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5">
        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center mb-5"
        >
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h3 className="text-[#92400E] text-xl font-bold mb-3">
            Privacidade em Desenvolvimento
          </h3>
          <p className="text-[#B45309] mb-2">
            O gerenciamento de dados será implementado com Supabase.
          </p>
          <p className="text-[#B45309] text-sm">
            Dados removidos: exclusão de localStorage.
          </p>
        </motion.div>

        {/* Info Card */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5">
          <p className="text-[#1E3A8A] font-semibold mb-2">Seus dados serão seguros</p>
          <small className="text-[#2563EB]">
            Quando o Supabase estiver configurado, todas as informações serão armazenadas 
            de forma segura na nuvem com autenticação adequada.
          </small>
        </div>
      </div>
    </div>
  );
}
