import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Trash2, Edit2, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Screen, Product } from '../types';

interface ShoppingListProps {
  onNavigate: (screen: Screen) => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export function ShoppingList({ onNavigate, products, onUpdateProducts }: ShoppingListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQty, setNewProductQty] = useState('1');

  // Cálculo dos totais (simulando descontos)
  const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const atacadoTotal = subtotal * 0.85; // 15% desconto
  const creditoTotal = subtotal * 1.05; // 5% juros
  const varejoTotal = subtotal;

  const addProduct = () => {
    if (!newProductName.trim() || !newProductPrice) {
      toast.error('Preencha nome e preço');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: newProductName.trim(),
      price: parseFloat(newProductPrice),
      quantity: parseInt(newProductQty) || 1,
      timestamp: Date.now(),
    };

    onUpdateProducts([...products, newProduct]);
    setShowAddModal(false);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductQty('1');
    toast.success('Produto adicionado!');
  };

  const removeProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
    toast.info('Produto removido');
  };

  const updateQuantity = (id: string, delta: number) => {
    onUpdateProducts(products.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-[#F4F4F4] rounded-lg transition-colors duration-200"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
          </button>
          <h2 className="text-[#1a1a1a]">Minha Lista</h2>
        </div>
        <div className="text-[#666666]">
          <small>{products.length} itens</small>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-48">
        <AnimatePresence>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[#1a1a1a] mb-1 truncate">{product.name}</p>
                  <p className="text-[#1B5E20]">R$ {product.price.toFixed(2)}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeProduct(product.id)}
                  className="p-2 hover:bg-[#F4F4F4] rounded-lg transition-colors duration-200 ml-3 flex-shrink-0"
                  aria-label="Remover"
                >
                  <Trash2 className="w-5 h-5 text-[#ef4444]" />
                </motion.button>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-10 h-10 bg-[#F4F4F4] rounded-lg hover:bg-[#e0e0e0] transition-colors duration-200 flex items-center justify-center"
                  aria-label="Diminuir quantidade"
                >
                  −
                </motion.button>
                <span className="text-[#1a1a1a] min-w-[40px] text-center">{product.quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-10 h-10 bg-[#F4F4F4] rounded-lg hover:bg-[#e0e0e0] transition-colors duration-200 flex items-center justify-center"
                  aria-label="Aumentar quantidade"
                >
                  +
                </motion.button>
                <div className="flex-1 text-right text-[#666666]">
                  <small>Total: R$ {(product.price * product.quantity).toFixed(2)}</small>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {products.length === 0 && (
          <div className="text-center py-16 text-[#666666]">
            <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="mb-1">Lista vazia</p>
            <small className="text-[#999999]">Adicione produtos usando o botão abaixo</small>
          </div>
        )}
      </div>

      {/* Footer Totals */}
      {products.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 bg-white border-t border-[#e0e0e0] shadow-lg p-4 space-y-2"
        >
          <div className="grid grid-cols-3 gap-3 mb-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-[#F4F4F4] rounded-lg p-3 text-center"
            >
              <small className="text-[#666666] block mb-1">Atacado</small>
              <p className="text-[#22c55e]">R$ {atacadoTotal.toFixed(2)}</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-[#F4F4F4] rounded-lg p-3 text-center"
            >
              <small className="text-[#666666] block mb-1">Crédito</small>
              <p className="text-[#ef4444]">R$ {creditoTotal.toFixed(2)}</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-[#1E90FF] rounded-lg p-3 text-center"
            >
              <small className="text-white/80 block mb-1">Varejo</small>
              <p className="text-white">R$ {varejoTotal.toFixed(2)}</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Floating Add Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-32 right-6 w-14 h-14 bg-[#1E90FF] text-white rounded-full shadow-[0_4px_16px_rgba(30,144,255,0.4)] flex items-center justify-center hover:bg-[#1873cc] transition-all duration-200"
        aria-label="Adicionar produto"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 shadow-xl max-w-md mx-auto"
            >
              <h3 className="text-[#1a1a1a] mb-4">Adicionar Produto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#666666] mb-2">
                    <small>Nome do produto</small>
                  </label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ex: Arroz 5kg"
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#1E90FF] transition-colors duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#666666] mb-2">
                      <small>Preço (R$)</small>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#1E90FF] transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[#666666] mb-2">
                      <small>Quantidade</small>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newProductQty}
                      onChange={(e) => setNewProductQty(e.target.value)}
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#1E90FF] transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-lg hover:bg-[#F4F4F4] transition-colors duration-200 min-h-[48px]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addProduct}
                    className="flex-1 px-4 py-3 bg-[#1E90FF] text-white rounded-lg hover:bg-[#1873cc] transition-colors duration-200 min-h-[48px]"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}