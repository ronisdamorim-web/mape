import { motion } from 'motion/react';
import { ArrowLeft, Smartphone, Shield, Heart, Github } from 'lucide-react';
import type { Screen } from '../types';

interface SettingsAboutProps {
  onNavigate: (screen: Screen) => void;
}

export function SettingsAbout({ onNavigate }: SettingsAboutProps) {
  const appVersion = '1.0.0';
  const buildDate = 'Novembro 2024';

  const features = [
    {
      icon: Smartphone,
      title: 'OCR Inteligente',
      description: 'Reconhecimento automático de preços por câmera',
      color: 'bg-[#0066FF]'
    },
    {
      icon: Shield,
      title: 'Privacidade Total',
      description: 'Seus dados ficam apenas no seu dispositivo',
      color: 'bg-[#10B981]'
    },
    {
      icon: Heart,
      title: 'Sem Anúncios',
      description: 'Experiência limpa e focada em você',
      color: 'bg-[#EF4444]'
    },
  ];

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
            <h2 className="text-[#111827]">Sobre</h2>
            <small className="text-[#6B7280]">Informações do aplicativo</small>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5">
        {/* App Logo & Version */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Smartphone className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-[#111827] mb-1">Mape</h2>
          <p className="text-[#6B7280]">Versão {appVersion}</p>
          <small className="text-[#9CA3AF]">{buildDate}</small>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] flex items-center gap-4"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[#111827] font-semibold mb-0.5">{feature.title}</p>
                <small className="text-[#6B7280]">{feature.description}</small>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legal Info */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-5">
          <p className="text-[#111827] font-semibold mb-3">Informações Legais</p>
          <div className="space-y-2">
            <button className="text-[#0066FF] font-semibold text-sm hover:underline">
              Termos de Uso
            </button>
            <br />
            <button className="text-[#0066FF] font-semibold text-sm hover:underline">
              Política de Privacidade
            </button>
            <br />
            <button className="text-[#0066FF] font-semibold text-sm hover:underline">
              Licenças de Código Aberto
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <small className="text-[#9CA3AF] block mb-2">
            Desenvolvido com ❤️ para economizar seu dinheiro
          </small>
          <small className="text-[#9CA3AF]">
            © 2024 Mape. Todos os direitos reservados.
          </small>
        </div>
      </div>
    </div>
  );
}
