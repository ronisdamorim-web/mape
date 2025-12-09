import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListChecks, Check, X } from 'lucide-react';

interface SaveAsListModalProps {
  isOpen: boolean;
  itemCount: number;
  onConfirm: (listName: string) => void;
  onDecline: () => void;
}

export function SaveAsListModal({ isOpen, itemCount, onConfirm, onDecline }: SaveAsListModalProps) {
  const [customName, setCustomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Gerar nome sugerido
  const getSuggestedName = () => {
    const now = new Date();
    const month = now.toLocaleDateString('pt-BR', { month: 'long' });
    const year = now.getFullYear();
    const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
    return `Lista Mensal — ${monthCapitalized} ${year}`;
  };

  const suggestedName = getSuggestedName();
  const finalName = customName.trim() || suggestedName;

  const handleConfirm = () => {
    onConfirm(finalName);
    setCustomName('');
    setIsEditingName(false);
  };

  const handleDecline = () => {
    onDecline();
    setCustomName('');
    setIsEditingName(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleDecline}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-[101] max-w-md mx-auto overflow-hidden"
          >
            {/* Icon Header */}
            <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] px-6 pt-8 pb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <ListChecks className="w-10 h-10 text-white" strokeWidth={2.5} />
              </motion.div>
              <h3 className="text-white mb-2">Salvar esta compra como Lista Mensal?</h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-[#6B7280] text-center mb-6">
                Crie automaticamente uma lista com todos os{' '}
                <strong className="text-[#111827]">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</strong>{' '}
                desta compra para usar no próximo mês.
              </p>

              {/* List Name Preview */}
              <div className="bg-[#F0F9FF] border-2 border-[#BAE6FD] rounded-2xl p-4 mb-6">
                <small className="text-[#0369A1] font-medium block mb-2">Nome da lista:</small>
                
                {isEditingName ? (
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={suggestedName}
                    className="w-full px-4 py-2.5 border-2 border-[#0066FF] rounded-xl focus:outline-none text-[#111827] font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingName(false);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-[#111827] font-bold">{finalName}</p>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-[#0066FF] text-sm font-semibold hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <small className="text-[#6B7280] block">
                      A lista será criada sem preços (os preços mudam mensalmente)
                    </small>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary - Salvar */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-2xl py-4 font-bold shadow-[0_4px_16px_rgba(0,102,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,102,255,0.4)] transition-all flex items-center justify-center gap-3"
                >
                  <Check className="w-6 h-6" strokeWidth={3} />
                  Sim, salvar como Lista
                </motion.button>

                {/* Secondary - Não salvar */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDecline}
                  className="w-full bg-white border-2 border-[#E5E7EB] text-[#6B7280] rounded-2xl py-4 font-semibold hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all flex items-center justify-center gap-3"
                >
                  <X className="w-5 h-5" />
                  Não, apenas finalizar compra
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
