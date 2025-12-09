import { motion } from 'motion/react';
import { User, Bell, Shield, Info, LogOut, ChevronRight, HelpCircle } from 'lucide-react';
import type { Screen } from '../types';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

export function Settings({ onNavigate, onLogout }: SettingsProps) {
  const settings = [
    { 
      icon: User, 
      label: 'Perfil', 
      description: 'Dados pessoais e preferências',
      color: 'bg-[#0066FF]',
      screen: 'settingsProfile' as Screen
    },
    { 
      icon: Bell, 
      label: 'Notificações', 
      description: 'Alertas e lembretes de compras',
      color: 'bg-[#F59E0B]',
      screen: 'settingsNotifications' as Screen
    },
    { 
      icon: Shield, 
      label: 'Privacidade', 
      description: 'Controle seus dados',
      color: 'bg-[#10B981]',
      screen: 'settingsPrivacy' as Screen
    },
    { 
      icon: HelpCircle, 
      label: 'Ajuda', 
      description: 'Perguntas frequentes',
      color: 'bg-[#8B5CF6]',
      screen: 'settingsHelp' as Screen
    },
    { 
      icon: Info, 
      label: 'Sobre', 
      description: 'Versão 1.0.0 • Mape',
      color: 'bg-[#6B7280]',
      screen: 'settingsAbout' as Screen
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-[#E5E7EB]">
        <h2 className="text-[#111827] mb-1">Configurações</h2>
        <small className="text-[#6B7280]">Personalize sua experiência</small>
      </div>

      {/* Settings List */}
      <div className="px-4 py-5 space-y-2">
        {settings.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all flex items-center gap-4"
            onClick={() => onNavigate(item.screen)}
          >
            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[#111827] font-semibold mb-0.5">{item.label}</p>
              <small className="text-[#6B7280]">{item.description}</small>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white border-2 border-[#FEE2E2] text-[#EF4444] rounded-2xl p-5 font-semibold hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-3"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </motion.button>
      </div>
    </div>
  );
}