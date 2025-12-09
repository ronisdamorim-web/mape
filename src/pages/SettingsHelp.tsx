import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronDown, Camera, ShoppingCart, BarChart3, ListChecks } from 'lucide-react';
import type { Screen } from '../types';

interface SettingsHelpProps {
  onNavigate: (screen: Screen) => void;
}

export function SettingsHelp({ onNavigate }: SettingsHelpProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      icon: Camera,
      question: 'Como escanear produtos?',
      answer: 'Toque no botão azul de câmera na tela inicial ou no carrinho. Aponte a câmera para a etiqueta de preço e o Mape reconhecerá automaticamente o produto e os preços (avulso, cartão, atacado).',
      color: 'bg-[#0066FF]'
    },
    {
      id: '2',
      icon: ShoppingCart,
      question: 'Como finalizar uma compra?',
      answer: 'Após adicionar todos os produtos ao carrinho, toque em "Fechar Compra". Você poderá salvar essa compra como uma lista reutilizável ou apenas registrar no histórico.',
      color: 'bg-[#10B981]'
    },
    {
      id: '3',
      icon: ListChecks,
      question: 'Para que servem as listas salvas?',
      answer: 'As listas salvas são suas compras recorrentes. Você pode marcar quais itens precisa na próxima compra e usar a função "Onde Comprar Barato" para comparar preços entre mercados.',
      color: 'bg-[#F59E0B]'
    },
    {
      id: '4',
      icon: BarChart3,
      question: 'Como funciona "Onde Comprar Barato"?',
      answer: 'Selecione uma lista salva e o Mape mostrará em quais mercados você pode economizar mais. A comparação usa dados da comunidade e seus preços escaneados anteriormente.',
      color: 'bg-[#8B5CF6]'
    },
  ];

  const toggleFaq = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#111827]" />
          </button>
          <div>
            <h2 className="text-[#111827]">Ajuda</h2>
            <small className="text-[#6B7280]">Perguntas frequentes</small>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="px-4 py-5 space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleFaq(faq.id)}
              className="w-full p-5 flex items-center gap-4 text-left hover:bg-[#F9FAFB] transition-colors"
            >
              <div className={`w-12 h-12 ${faq.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <faq.icon className="w-6 h-6 text-white" />
              </div>
              <p className="flex-1 text-[#111827] font-semibold">{faq.question}</p>
              <motion.div
                animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedId === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0">
                    <div className="border-t border-[#E5E7EB] pt-4">
                      <p className="text-[#6B7280] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] rounded-2xl p-5 text-white">
          <p className="font-semibold mb-2">Ainda tem dúvidas?</p>
          <small className="opacity-90">
            Entre em contato: suporte@smartbuy.com.br
          </small>
        </div>
      </div>
    </div>
  );
}
