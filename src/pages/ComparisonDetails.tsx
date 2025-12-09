import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import type { Product } from '../types';

interface MarketComparison {
  id: string;
  name: string;
  totalPrice: number;
  savings: number;
  availableItems: number;
  totalItems: number;
}

interface ComparisonDetailsProps {
  market: MarketComparison;
  products: Product[];
  onClose: () => void;
}

export function ComparisonDetails({ market, onClose }: ComparisonDetailsProps) {

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#0066FF] text-white px-6 py-6 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-white mb-1">{market.name}</h2>
              <p className="text-white/80 text-sm">Detalhes da comparação</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center">
              <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
              <h3 className="text-[#92400E] text-lg font-bold mb-3">
                Detalhes em Desenvolvimento
              </h3>
              <p className="text-[#B45309] mb-2">
                Os detalhes de preços por mercado serão exibidos quando houver dados reais no Supabase.
              </p>
              <p className="text-[#B45309] text-sm">
                Dados removidos: preços simulados, variação aleatória, cálculos fake.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
