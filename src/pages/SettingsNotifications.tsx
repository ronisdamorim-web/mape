import { motion } from 'motion/react';
import { ArrowLeft, Bell, ShoppingCart, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import type { Screen } from '../types';

interface SettingsNotificationsProps {
  onNavigate: (screen: Screen) => void;
}

export function SettingsNotifications({ onNavigate }: SettingsNotificationsProps) {

  const notifications = [
    {
      key: 'priceAlerts',
      icon: TrendingDown,
      label: 'Alertas de Preço',
      description: 'Quando produtos ficarem mais baratos',
      color: 'bg-[#10B981]'
    },
    {
      key: 'shoppingReminders',
      icon: ShoppingCart,
      label: 'Lembretes de Compras',
      description: 'Itens recorrentes da sua lista',
      color: 'bg-[#0066FF]'
    },
    {
      key: 'deals',
      icon: Bell,
      label: 'Promoções',
      description: 'Ofertas em mercados próximos',
      color: 'bg-[#F59E0B]'
    },
    {
      key: 'weeklyReport',
      icon: Calendar,
      label: 'Relatório Semanal',
      description: 'Resumo dos seus gastos',
      color: 'bg-[#8B5CF6]'
    },
  ];

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
            <h2 className="text-[#111827]">Notificações</h2>
            <small className="text-[#6B7280]">Gerencie seus alertas</small>
          </div>
        </div>
      </div>

      {/* Aviso */}
      <div className="px-4 pt-4">
        <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl p-3 flex items-start gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <p className="text-[#92400E] text-sm">
            Configurações em desenvolvimento. Aguardando Supabase.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-2 space-y-3">
        {notifications.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB] opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 opacity-50`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[#111827] font-semibold mb-0.5">{item.label}</p>
                <small className="text-[#6B7280]">{item.description}</small>
              </div>
              <div className="relative w-14 h-8 rounded-full bg-[#E5E7EB] cursor-not-allowed">
                <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
