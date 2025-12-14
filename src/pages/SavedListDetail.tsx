import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { supabase, getSavedListItems, addSavedListItem, updateSavedListItem, deleteSavedListItem, updateSavedList, type SavedListItemDB } from '../services/supabase';
import type { SavedList, Screen } from '../types';

interface SavedListDetailProps {
  list: SavedList;
  onNavigate: (screen: Screen) => void;
  onUpdateList: (list: SavedList) => void;
}

export function SavedListDetail({ list, onNavigate, onUpdateList }: SavedListDetailProps) {
  const [items, setItems] = useState(list.items);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, price: '' });
  const [editingItem, setEditingItem] = useState({ name: '', quantity: 1, price: '' });

  useEffect(() => {
    loadItems();
  }, [list.id]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const dbItems = await getSavedListItems(list.id);
      setItems(
        dbItems.map(item => ({
          id: item.id || '',
          name: item.name,
          quantity: item.quantity,
          lastPrice: item.last_price || 0,
          isNeeded: true,
          category: item.category
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast.error('Digite o nome do item');
      return;
    }

    try {
      const itemToAdd: SavedListItemDB = {
        list_id: list.id,
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        last_price: newItem.price ? parseFloat(newItem.price) : null,
        category: null
      };

      const added = await addSavedListItem(itemToAdd);
      if (added) {
        toast.success('Item adicionado');
        setNewItem({ name: '', quantity: 1, price: '' });
        setShowAddModal(false);
        await loadItems();
        // Atualizar timestamp da lista
        await updateSavedList(list.id, {});
      } else {
        toast.error('Erro ao adicionar item');
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const handleStartEdit = (item: typeof items[0]) => {
    setEditingId(item.id);
    setEditingItem({
      name: item.name,
      quantity: item.quantity,
      price: item.lastPrice > 0 ? item.lastPrice.toString() : ''
    });
  };

  const handleSaveEdit = async (itemId: string) => {
    try {
      const updates: Partial<SavedListItemDB> = {
        name: editingItem.name.trim(),
        quantity: editingItem.quantity,
        last_price: editingItem.price ? parseFloat(editingItem.price) : null
      };

      const success = await updateSavedListItem(itemId, updates);
      if (success) {
        toast.success('Item atualizado');
        setEditingId(null);
        await loadItems();
        await updateSavedList(list.id, {});
      } else {
        toast.error('Erro ao atualizar item');
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingItem({ name: '', quantity: 1, price: '' });
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const success = await deleteSavedListItem(itemId);
      if (success) {
        toast.success('Item removido');
        await loadItems();
        await updateSavedList(list.id, {});
      } else {
        toast.error('Erro ao remover item');
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

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
            <h2 className="text-[#111827] font-bold">{list.name}</h2>
            <small className="text-[#6B7280]">{items.length} {items.length === 1 ? 'item' : 'itens'}</small>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-[#0066FF] text-white rounded-xl hover:bg-[#0052CC] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <p className="text-[#6B7280] mb-6">Nenhum item nesta lista</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#0066FF] text-white rounded-xl font-semibold hover:bg-[#0052CC] transition-colors"
            >
              Adicionar primeiro item
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-[#E5E7EB]"
              >
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                      placeholder="Nome do item"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 1 })}
                        className="w-20 border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                        min="1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                        className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                        placeholder="Preço (opcional)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="flex-1 bg-[#10B981] text-white rounded-lg px-4 py-2 font-semibold hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Salvar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 border border-[#E5E7EB] text-[#6B7280] rounded-lg px-4 py-2 font-semibold hover:bg-[#F9FAFB] transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[#111827] font-semibold mb-1">{item.name}</p>
                      <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                        <span>Qtd: {item.quantity}</span>
                        {item.lastPrice > 0 && (
                          <span>R$ {item.lastPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-[#6B7280]" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 hover:bg-[#FEF2F2] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-[#EF4444]" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Adicionar Item */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-[#111827] font-bold text-xl mb-4">Adicionar Item</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do item"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                autoFocus
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Quantidade"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-24 border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  min="1"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço (opcional)"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ name: '', quantity: 1, price: '' });
                }}
                className="flex-1 border border-[#E5E7EB] text-[#6B7280] rounded-xl px-4 py-3 font-semibold hover:bg-[#F9FAFB] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim()}
                className="flex-1 bg-[#0066FF] text-white rounded-xl px-4 py-3 font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
