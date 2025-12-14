import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, Check, Package, Tag, CreditCard, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { calculateCartTotals } from '../utils/calculations';
import type { Product, Screen } from '../types';

interface CartProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  onFinalizePurchase: () => void;
  onNavigate?: (screen: Screen) => void;
}

export function Cart({ products, onUpdateProducts, onFinalizePurchase, onNavigate }: CartProps) {

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const updateQuantity = (id: string, delta: number) => {
    onUpdateProducts(products.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
  };

  const deleteProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
    setItemToDelete(null);
    toast.success('Item removido');
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const { totalAvulso, totalCartao, totalAtacado } = calculateCartTotals(products);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-48">
      <div className="bg-white px-6 py-5 border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-[#0066FF] font-semibold hover:opacity-80 transition-opacity mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-[#111827] font-bold text-xl mb-1">Carrinho</h2>
            <small className="text-[#6B7280]">{products.length} {products.length === 1 ? 'item' : 'itens'}</small>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F0F9FF] rounded-full">
            <CartIcon className="w-4 h-4 text-[#0066FF]" />
            <small className="text-[#0066FF] font-semibold">{products.length}</small>
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="px-4 py-5 space-y-3">
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <SwipeableProductCard
                key={product.id}
                product={product}
                index={index}
                isDeleting={itemToDelete === product.id}
                onUpdateQuantity={updateQuantity}
                onDelete={confirmDelete}
                onConfirmDelete={deleteProduct}
                onCancelDelete={cancelDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 px-6"
        >
          <div className="w-24 h-24 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-[#9CA3AF]" />
          </div>
          <p className="text-[#111827] font-semibold mb-2">Carrinho vazio</p>
          <p className="text-[#6B7280] text-sm">Escaneie produtos para começar suas compras</p>
        </motion.div>
      )}

      {products.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20"
        >
          <div className="px-6 py-5">
            <div className="mb-5">
              <small className="text-[#6B7280] block mb-3">Compare com seu cupom fiscal:</small>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#10B981] rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <small className="text-[#065F46] font-semibold block">Avulso</small>
                      <small className="text-[#059669] text-xs">Preço normal</small>
                    </div>
                  </div>
                  <p className="text-[#065F46] font-bold text-lg">
                    R$ {totalAvulso.toFixed(2)}
                  </p>
                </div>

                {totalCartao > 0 && (
                  <div className="flex items-center justify-between bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#0066FF] rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <small className="text-[#1E3A8A] font-semibold block">Cartão</small>
                        <small className="text-[#2563EB] text-xs">Com desconto</small>
                      </div>
                    </div>
                    <p className="text-[#1E3A8A] font-bold text-lg">
                      R$ {totalCartao.toFixed(2)}
                    </p>
                  </div>
                )}

                {totalAtacado > 0 && (
                  <div className="flex items-center justify-between bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-[#F97316] rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <small className="text-[#7C2D12] font-semibold block">Atacado</small>
                        <small className="text-[#EA580C] text-xs">Compra mínima</small>
                      </div>
                    </div>
                    <p className="text-[#7C2D12] font-bold text-lg">
                      R$ {totalAtacado.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onFinalizePurchase}
              className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-2xl py-4 font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Check className="w-6 h-6" strokeWidth={3} />
              Fechar Compra
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface SwipeableProductCardProps {
  product: Product;
  index: number;
  isDeleting: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

function SwipeableProductCard({
  product,
  index,
  isDeleting,
  onUpdateQuantity,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: SwipeableProductCardProps) {

  const displayPrice = product.precoAvulso || product.precoCartao || product.precoAtacado || 0;
  const subtotal = displayPrice * product.quantity;

  const handleMinus = () => {
    onUpdateQuantity(product.id, -1);
  };

  const handlePlus = () => {
    onUpdateQuantity(product.id, 1);
  };

  if (isDeleting) {
    return (
      <motion.div
        initial={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#FEE2E2] rounded-2xl p-5 border-2 border-[#EF4444]"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-[#EF4444] rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[#111827] font-semibold mb-0.5">Remover este item?</p>
            <small className="text-[#6B7280]">{product.name}</small>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancelDelete}
            className="flex-1 py-3 bg-white border-2 border-[#E5E7EB] rounded-xl text-[#111827] font-semibold hover:bg-[#F9FAFB] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmDelete(product.id)}
            className="flex-1 py-3 bg-[#EF4444] rounded-xl text-white font-semibold hover:bg-[#DC2626] transition-colors"
          >
            Remover
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-[#111827] font-semibold mb-2">{product.name}</p>
          <p className="text-[#10B981] font-bold text-xl">R$ {displayPrice.toFixed(2)}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(product.id)}
          className="p-2.5 hover:bg-[#FEE2E2] rounded-xl transition-colors flex-shrink-0"
        >
          <Trash2 className="w-5 h-5 text-[#EF4444]" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl p-1">
          <button
            type="button"
            onClick={handleMinus}
            className="w-10 h-10 bg-white rounded-lg hover:bg-[#E5E7EB] active:scale-95 transition-all flex items-center justify-center shadow-sm touch-manipulation"
          >
            <Minus className="w-4 h-4 text-[#111827]" />
          </button>
          <span className="text-[#111827] font-bold min-w-[35px] text-center text-lg">
            {product.quantity}
          </span>
          <button
            type="button"
            onClick={handlePlus}
            className="w-10 h-10 bg-white rounded-lg hover:bg-[#E5E7EB] active:scale-95 transition-all flex items-center justify-center shadow-sm touch-manipulation"
          >
            <Plus className="w-4 h-4 text-[#111827]" />
          </button>
        </div>
        <div className="text-right">
          <small className="text-[#6B7280] block mb-0.5">Subtotal</small>
          <p className="text-[#111827] font-bold text-lg">
            R$ {subtotal.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
