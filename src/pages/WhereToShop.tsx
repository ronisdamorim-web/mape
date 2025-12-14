import { motion } from 'motion/react';
import { MapPin, Package, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Screen, SavedList } from '../types';

interface WhereToShopProps {
  onNavigate: (screen: Screen) => void;
  onSelectList: (list: SavedList) => void;
}

export function WhereToShop({ onNavigate }: WhereToShopProps) {

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-white mb-6 font-semibold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-white">Onde comprar barato hoje?</h1>
          </div>
          <p className="text-white/90 text-lg">
            Compare preços entre mercados antes de sair de casa
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6">
        {/* Status - Em Desenvolvimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center mb-4"
        >
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h3 className="text-[#92400E] text-xl font-bold mb-3">
            Funcionalidade em Desenvolvimento
          </h3>
          <p className="text-[#B45309] mb-2">
            A comparação de mercados será disponibilizada quando houver listas e dados reais no Supabase.
          </p>
          <p className="text-[#B45309] text-sm">
            Dados removidos: localStorage smartbuy_saved_lists.
          </p>
        </motion.div>

        {/* Usuário SEM lista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] mb-4"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#9CA3AF]" />
            </div>
            <h3 className="text-[#111827] mb-2">Você ainda não tem uma lista</h3>
            <p className="text-[#6B7280] leading-relaxed max-w-sm mx-auto">
              Crie uma lista para comparar preços antes de sair de casa (em breve)
            </p>
          </div>

          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 rounded-xl py-4 font-semibold cursor-not-allowed"
          >
            Criar Lista (em breve)
          </button>
        </motion.div>

        {/* Info adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB] mb-4"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#111827] font-semibold mb-2">
                Como vai funcionar?
              </p>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5">1.</span>
                  <span>Tenha uma lista salva com seus produtos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5">2.</span>
                  <span>Selecione a lista que deseja comparar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5">3.</span>
                  <span>Descubra onde sua compra sai mais barata</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Benefícios */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-6"
        >
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-[#065F46] font-semibold text-sm mb-1">
                Economize tempo e dinheiro
              </p>
              <small className="text-[#059669]">
                Veja qual mercado oferece os melhores preços para sua lista
              </small>
            </div>
          </div>

          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <p className="text-[#1E3A8A] font-semibold text-sm mb-1">
                Planeje antes de sair
              </p>
              <small className="text-[#1E40AF]">
                Decida onde ir com base em dados reais da comunidade
              </small>
            </div>
          </div>

          <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-[#92400E] font-semibold text-sm mb-1">
                Comparação transparente
              </p>
              <small className="text-[#B45309]">
                Veja item por item e entenda onde está economizando
              </small>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
