import { motion } from 'motion/react';
import { Home as HomeIcon, ShoppingCart, List, Settings } from 'lucide-react';
import type { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  cartCount?: number;
}

export function BottomNav({ currentScreen, onNavigate, cartCount = 0 }: BottomNavProps) {
  const navItems = [
    { id: 'home' as Screen, icon: HomeIcon, label: 'Início' },
    { id: 'cart' as Screen, icon: ShoppingCart, label: 'Carrinho', badge: cartCount },
    { id: 'savedLists' as Screen, icon: List, label: 'Listas' },
    { id: 'settings' as Screen, icon: Settings, label: 'Config' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] z-[1030]"
    >
      <div className="flex items-center justify-around max-w-2xl mx-auto px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-6 py-2.5 rounded-2xl transition-all duration-200 min-w-[70px] min-h-[60px] relative ${
                isActive 
                  ? 'bg-[#0066FF] text-white shadow-[0_2px_8px_rgba(0,102,255,0.25)]' 
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-[#EF4444] text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 font-semibold"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.div>
                )}
              </div>
              <small className={`text-xs font-medium ${isActive ? 'text-white' : 'text-[#6B7280]'}`}>
                {item.label}
              </small>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}