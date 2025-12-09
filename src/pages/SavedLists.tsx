import { motion } from 'motion/react';
import { List, AlertCircle } from 'lucide-react';
import type { SavedList, Screen } from '../types';

interface SavedListsProps {
  onNavigate: (screen: Screen, listId?: string) => void;
  onSelectList: (list: SavedList) => void;
  onUseList: (list: SavedList) => void;
}

export function SavedLists({ onNavigate }: SavedListsProps) {

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#111827] mb-1">Minhas Listas</h2>
            <small className="text-[#6B7280]">Organize suas compras recorrentes</small>
          </div>
        </div>
      </div>

      {/* Status - Em Desenvolvimento */}
      <div className="px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center mb-6"
        >
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h3 className="text-[#92400E] text-xl font-bold mb-3">
            Listas Salvas em Desenvolvimento
          </h3>
          <p className="text-[#B45309] mb-2">
            As listas salvas serão exibidas quando houver dados reais no Supabase.
          </p>
          <p className="text-[#B45309] text-sm">
            Dados removidos: localStorage smartbuy_saved_lists, polling, eventos storage.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-6">
            <List className="w-12 h-12 text-[#9CA3AF]" />
          </div>
          <p className="text-[#111827] font-semibold mb-2">Nenhuma lista criada</p>
          <p className="text-[#6B7280] text-sm mb-6">
            Crie listas quando o Supabase estiver configurado
          </p>
          <button
            disabled
            className="px-8 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
          >
            Criar Lista (em breve)
          </button>
        </motion.div>
      </div>
    </div>
  );
}
