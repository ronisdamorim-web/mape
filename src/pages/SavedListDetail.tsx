import { motion } from 'motion/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { SavedList, Screen } from '../types';

interface SavedListDetailProps {
  list: SavedList;
  onNavigate: (screen: Screen) => void;
  onUpdateList: (list: SavedList) => void;
}

export function SavedListDetail({ list, onNavigate }: SavedListDetailProps) {

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => onNavigate('savedLists')}
            className="p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#111827]" />
          </button>
          <div className="flex-1">
            <h2 className="text-[#111827]">{list.name}</h2>
            <small className="text-[#6B7280]">{list.items.length} itens no total</small>
          </div>
        </div>
      </div>

      {/* Status - Em Desenvolvimento */}
      <div className="px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl p-6 text-center"
        >
          <AlertCircle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
          <h3 className="text-[#92400E] text-xl font-bold mb-3">
            Detalhes da Lista em Desenvolvimento
          </h3>
          <p className="text-[#B45309] mb-2">
            A edição de listas será disponibilizada quando houver dados reais no Supabase.
          </p>
          <p className="text-[#B45309] text-sm">
            Dados removidos: todas as operações de localStorage para listas.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
