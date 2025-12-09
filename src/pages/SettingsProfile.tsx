import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, AlertCircle } from 'lucide-react';
import type { Screen } from '../types';

interface SettingsProfileProps {
  onNavigate: (screen: Screen) => void;
}

export function SettingsProfile({ onNavigate }: SettingsProfileProps) {

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

      {/* Status */}
      <div className="px-4 py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center mb-5"
        >
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h3 className="text-[#92400E] text-xl font-bold mb-3">
            Perfil em Desenvolvimento
          </h3>
          <p className="text-[#B45309] mb-2">
            O perfil do usuário será gerenciado pelo Supabase Auth.
          </p>
          <p className="text-[#B45309] text-sm">
            Dados removidos: localStorage smartbuy_user.
          </p>
        </motion.div>

        {/* Form - Disabled */}
        <div className="space-y-4 opacity-60">
          <div>
            <label className="block text-[#374151] font-semibold mb-2 px-1">Nome</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                disabled
                placeholder="Aguardando autenticação..."
                className="w-full bg-gray-100 border border-[#E5E7EB] rounded-2xl px-14 py-4 text-[#9CA3AF] cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#374151] font-semibold mb-2 px-1">E-mail</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-5 h-5 text-[#9CA3AF]" />
              </div>
              <input
                type="email"
                disabled
                placeholder="Aguardando autenticação..."
                className="w-full bg-gray-100 border border-[#E5E7EB] rounded-2xl px-14 py-4 text-[#9CA3AF] cursor-not-allowed"
              />
            </div>
          </div>

          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 rounded-2xl py-4 font-bold cursor-not-allowed mt-8"
          >
            Salvar (em breve)
          </button>
        </div>
      </div>
    </div>
  );
}
