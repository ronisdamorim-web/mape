import { motion, AnimatePresence } from 'motion/react';
import { X, Scan, Database, TrendingDown, Check } from 'lucide-react';

interface ComparisonInfoModalProps {
  onClose: () => void;
}

export function ComparisonInfoModal({ onClose }: ComparisonInfoModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white px-6 py-8 text-center relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
            
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💡</span>
            </div>
            
            <h2 className="text-white mb-2">Como funciona o comparador?</h2>
            <p className="text-white/80 text-sm">
              Entenda de onde vêm os dados de preços
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex gap-4"
            >
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <Scan className="w-6 h-6 text-[#0066FF]" />
              </div>
              <div className="flex-1">
                <p className="text-[#111827] font-semibold mb-1">
                  1. Você escaneia produtos
                </p>
                <small className="text-[#6B7280] leading-relaxed block">
                  Use o scanner OCR do Mape para adicionar itens ao seu carrinho
                </small>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex gap-4"
            >
              <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-[#10B981]" />
              </div>
              <div className="flex-1">
                <p className="text-[#111827] font-semibold mb-1">
                  2. Dados da comunidade
                </p>
                <small className="text-[#6B7280] leading-relaxed block">
                  Os preços vêm de milhares de usuários que escanearam produtos 
                  em mercados próximos a você
                </small>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex gap-4"
            >
              <div className="w-12 h-12 bg-[#FFF7ED] rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <p className="text-[#111827] font-semibold mb-1">
                  3. Calculamos a economia
                </p>
                <small className="text-[#6B7280] leading-relaxed block">
                  Comparamos o preço total do seu carrinho em cada mercado e 
                  mostramos quanto você economiza vs. o mais caro
                </small>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 flex gap-4"
            >
              <div className="w-12 h-12 bg-[#D1FAE5] rounded-xl flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-[#10B981]" />
              </div>
              <div className="flex-1">
                <p className="text-[#111827] font-semibold mb-1">
                  4. Você decide onde comprar
                </p>
                <small className="text-[#6B7280] leading-relaxed block">
                  Veja qual mercado oferece o melhor preço e use a navegação 
                  para chegar lá
                </small>
              </div>
            </motion.div>

            {/* Info Box */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4">
              <p className="text-[#111827] font-semibold mb-2 text-sm">
                ⚠️ Importante saber:
              </p>
              <ul className="space-y-2">
                <li className="text-[#6B7280] text-sm flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5">•</span>
                  <span>Os preços podem variar ligeiramente no caixa</span>
                </li>
                <li className="text-[#6B7280] text-sm flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5">•</span>
                  <span>Produtos em promoção podem não estar refletidos</span>
                </li>
                <li className="text-[#6B7280] text-sm flex items-start gap-2">
                  <span className="text-[#10B981] mt-0.5">•</span>
                  <span>Sempre confira a disponibilidade e o cupom fiscal</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full bg-[#0066FF] text-white rounded-2xl py-4 font-semibold shadow-lg"
            >
              Entendi
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
