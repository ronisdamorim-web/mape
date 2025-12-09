import { motion } from 'motion/react';
import { Scan, MapPin, List } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { Screen } from '../types';
import logo from '@/assets/df58293108af6df81355df9acb0914691822445d.png';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  onStartScanning: () => void;
  cartCount?: number;
}

export function Home({ onNavigate, onStartScanning, cartCount = 0 }: HomeProps) {
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="Mape Logo" className="w-12 h-12" />
            <h1 className="text-[#111827]">Mape</h1>
          </div>
          <p className="text-[#6B7280]">Escaneie preços e economize nas compras</p>
        </motion.div>

        {/* Current Cart Status */}
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse" />
              <p className="text-[#0369A1] font-medium">
                {cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho
              </p>
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="text-[#0066FF] font-semibold text-sm"
            >
              Ver →
            </button>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6">
        <h3 className="text-[#111827] mb-4">Ações Principais</h3>
        
        <div className="space-y-3">
          {/* Botão 1: Escanear Agora */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartScanning}
            className="w-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Scan className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-lg mb-1">Escanear Agora</p>
              <small className="text-white/90">Controle seus gastos em tempo real</small>
            </div>
          </motion.button>

          {/* Botão 2: Onde Comprar Barato */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('whereToShop')}
            className="w-full bg-white border-2 border-[#10B981] rounded-2xl p-5 shadow-sm hover:shadow-md hover:bg-[#F0FDF4] transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[#111827] font-semibold mb-0.5">Onde Comprar Barato</p>
              <small className="text-[#6B7280]">Descubra o melhor mercado antes de sair de casa</small>
            </div>
          </motion.button>

          {/* Botão 3: Minhas Listas */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('savedLists')}
            className="w-full bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#D1D5DB] transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center flex-shrink-0">
              <List className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[#111827] font-semibold mb-0.5">Minhas Listas</p>
              <small className="text-[#6B7280]">Crie, salve ou edite suas listas</small>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-6 mt-8"
      >
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 flex items-start gap-3">
          <List className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#111827] font-medium mb-1 text-sm">Dica Rápida</p>
            <small className="text-[#6B7280]">
              Aponte a câmera para os preços e deixe o OCR fazer o resto automaticamente
            </small>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
