import { motion } from 'motion/react';
import { 
  TrendingDown, 
  Package,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import type { Product, SavedList, Screen } from '../types';

interface CompareProps {
  products: Product[];
  savedList?: SavedList | null;
  onNavigate: (screen: Screen) => void;
  context?: 'whereToShop' | 'default';
}

export function Compare({ products, savedList, onNavigate }: CompareProps) {

  const itemsToCompare = savedList ? savedList.items : products;
  const itemCount = savedList ? savedList.items.length : products.length;

  if (!itemsToCompare || itemsToCompare.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pb-24 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-[#9CA3AF]" />
          </div>
          <h2 className="text-[#111827] mb-3">Carrinho vazio</h2>
          <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
            Adicione produtos ao seu carrinho para comparar preços entre mercados próximos
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('home')}
            className="bg-[#0066FF] text-white px-8 py-4 rounded-2xl font-semibold"
          >
            Voltar ao Início
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-[#0066FF] font-semibold hover:opacity-80 transition-opacity mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-6 h-6 text-[#0066FF]" />
            <h1 className="text-[#111827]">Comparar Mercados</h1>
          </div>
          <p className="text-[#6B7280] text-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'} para comparar
          </p>
        </motion.div>
      </div>

      {/* Status - Em Desenvolvimento */}
      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center"
        >
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h2 className="text-[#92400E] text-xl font-bold mb-3">
            Comparação em Desenvolvimento
          </h2>
          <p className="text-[#B45309] mb-2">
            A comparação de preços entre mercados será implementada quando houver dados reais no Supabase.
          </p>
          <p className="text-[#B45309] text-sm">
            Dados removidos: mockComparisons, preços simulados, ranking fake.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
