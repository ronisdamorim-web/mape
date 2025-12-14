import { motion } from 'motion/react';
import { Scan, MapPin, List } from 'lucide-react';
import type { Screen } from '../types';
import logo from '@/assets/df58293108af6df81355df9acb0914691822445d.png';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  onStartScanning: () => void;
  cartCount?: number;
}

export function Home({ onNavigate, onStartScanning, cartCount = 0 }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9FAFB] pb-24">
      {/* Header - Centralizado */}
      <div className="px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={logo} alt="Mape Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
            <h1 className="text-5xl font-extrabold text-[#111827] tracking-tight">Mape</h1>
          </div>
          <p className="text-xl text-[#6B7280] font-normal max-w-md mx-auto leading-relaxed">
            Escaneie preços e economize nas compras
          </p>
        </motion.div>

        {/* Current Cart Status */}
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-md mx-auto bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse" />
              <p className="text-[#0369A1] font-semibold text-base">
                {cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho
              </p>
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="text-[#0066FF] font-semibold text-sm hover:underline"
            >
              Ver →
            </button>
          </motion.div>
        )}
      </div>

      {/* Botão Principal - Destaque */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="max-w-md mx-auto"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={onStartScanning}
            className="w-full bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#003D99] text-white rounded-3xl p-8 shadow-2xl hover:shadow-[#0066FF]/30 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30">
                <Scan className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <p className="font-bold text-2xl mb-2 tracking-tight">Escanear Agora</p>
                <p className="text-white/90 text-base font-medium">Controle seus gastos em tempo real</p>
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 max-w-md mx-auto">
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#111827] mb-5 text-lg font-semibold text-center"
        >
          Outras ações
        </motion.h3>
        
        <div className="space-y-3">

          {/* Botão 2: Onde Comprar Barato */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('whereToShop')}
            className="w-full bg-white border-2 border-[#10B981] rounded-2xl p-5 shadow-sm hover:shadow-lg hover:bg-[#F0FDF4] transition-all flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[#111827] font-bold text-base mb-1">Onde Comprar Barato</p>
              <p className="text-[#6B7280] text-sm font-medium">Descubra o melhor mercado antes de sair de casa</p>
            </div>
          </motion.button>

          {/* Botão 3: Minhas Listas */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('savedLists')}
            className="w-full bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-[#D1D5DB] transition-all flex items-center gap-4 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
              <List className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[#111827] font-bold text-base mb-1">Minhas Listas</p>
              <p className="text-[#6B7280] text-sm font-medium">Crie, salve ou edite suas listas</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 mt-8 max-w-md mx-auto"
      >
        <div className="bg-gradient-to-br from-[#F9FAFB] to-white border border-[#E5E7EB] rounded-3xl p-5 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center flex-shrink-0">
            <List className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-[#111827] font-semibold mb-1.5 text-base">Dica Rápida</p>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Aponte a câmera para os preços e deixe o OCR fazer o resto automaticamente
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
