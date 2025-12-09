import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, ShoppingBag, Package } from 'lucide-react';
import { supabase, getPurchaseHistory, type PurchaseHistory } from '../services/supabase';

export function History() {
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const history = await getPurchaseHistory(session.user.id);
        setPurchases(history);
      }
      setLoading(false);
    };

    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      <div className="bg-white px-6 py-5 border-b border-[#E5E7EB]">
        <h2 className="text-[#111827] text-xl font-bold mb-1">Histórico</h2>
        <small className="text-[#6B7280]">Suas compras anteriores</small>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]"></div>
          </div>
        ) : purchases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <p className="text-[#111827] font-semibold mb-2">Nenhuma compra registrada</p>
            <p className="text-[#6B7280] text-sm">Finalize uma compra para ver o histórico aqui</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-[#0066FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">
                        R$ {Number(purchase.total).toFixed(2)}
                      </p>
                      <p className="text-[#6B7280] text-sm">
                        {purchase.item_count} {purchase.item_count === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#9CA3AF] text-xs">
                    {purchase.created_at ? formatDate(purchase.created_at) : ''}
                  </p>
                </div>

                <div className="border-t border-[#F3F4F6] pt-3">
                  <div className="flex flex-wrap gap-2">
                    {(purchase.items as Array<{name: string; quantity: number; price: number}>).slice(0, 3).map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-1 bg-[#F3F4F6] rounded-full px-3 py-1"
                      >
                        <Package className="w-3 h-3 text-[#6B7280]" />
                        <span className="text-xs text-[#374151]">
                          {item.name.substring(0, 15)}{item.name.length > 15 ? '...' : ''}
                        </span>
                      </div>
                    ))}
                    {(purchase.items as Array<{name: string; quantity: number; price: number}>).length > 3 && (
                      <div className="bg-[#F3F4F6] rounded-full px-3 py-1">
                        <span className="text-xs text-[#6B7280]">
                          +{(purchase.items as Array<{name: string; quantity: number; price: number}>).length - 3} mais
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
