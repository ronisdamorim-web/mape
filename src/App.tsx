import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Home } from './pages/Home';
import { Scanner } from './pages/Scanner';
import { SavedLists } from './pages/SavedLists';
import { SavedListDetail } from './pages/SavedListDetail';
import { WhereToShop } from './pages/WhereToShop';
import { Cart } from './pages/Cart';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { SettingsProfile } from './pages/SettingsProfile';
import { SettingsNotifications } from './pages/SettingsNotifications';
import { SettingsPrivacy } from './pages/SettingsPrivacy';
import { SettingsHelp } from './pages/SettingsHelp';
import { SettingsAbout } from './pages/SettingsAbout';
import { Compare } from './pages/Compare';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { BottomNav } from './components/BottomNav';
import { Toaster } from 'sonner';
import { supabase } from './services/supabase';
import type { Screen, Product, SavedList } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedList, setSelectedList] = useState<SavedList | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Verificar se está na rota /reset-password ou se há tokens de recovery no hash
    const pathname = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Verificar tokens na query string ou hash
    const type = urlParams.get('type') || hashParams.get('type');
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
    
    // Detectar rota de reset de senha pela URL ou parâmetros (mesmo na raiz)
    if (pathname === '/reset-password' || pathname === '/reset-password/' || (type === 'recovery' && accessToken)) {
      setCurrentScreen('resetPassword');
      // Se veio na raiz com hash, atualizar a URL para /reset-password (sem perder o hash)
      if (pathname === '/' && type === 'recovery' && accessToken) {
        window.history.replaceState({}, '', '/reset-password' + window.location.hash);
      }
    }
    
    // Timeout curto para garantir que sempre apareça
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleStartScanning = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const handleProductScanned = (product: Product) => {
    console.log('Produto escaneado:', product);
    setProducts(prev => [...prev, product]);
  };

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  const handleFinalizePurchase = () => {
    // Lógica de finalização será implementada depois
    setProducts([]);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentScreen('login');
      setProducts([]);
      setSelectedList(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleLogin = () => {
    setCurrentScreen('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  // Fallback caso nenhuma tela esteja selecionada
  if (!currentScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#111827] mb-4">Erro de navegação</h1>
          <p className="text-[#6B7280] mb-4">Tela não encontrada</p>
          <button
            onClick={() => setCurrentScreen('home')}
            className="px-6 py-3 bg-[#0066FF] text-white rounded-xl font-semibold"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Renderizar tela baseada no estado */}
        {currentScreen === 'home' && (
          <Home
            onNavigate={handleNavigate}
            onStartScanning={handleStartScanning}
            cartCount={products.length}
          />
        )}

      {currentScreen === 'cart' && (
        <Cart
          products={products}
          onUpdateProducts={handleUpdateProducts}
          onFinalizePurchase={handleFinalizePurchase}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'history' && (
        <div className="min-h-screen bg-[#F9FAFB] pb-24">
          <History onNavigate={handleNavigate} />
        </div>
      )}

      {currentScreen === 'compare' && (
        <Compare
          products={products}
          savedList={selectedList}
          onNavigate={handleNavigate}
          context="default"
        />
      )}

      {currentScreen === 'settings' && (
        <Settings
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'settingsProfile' && (
        <SettingsProfile onNavigate={handleNavigate} />
      )}

      {currentScreen === 'settingsNotifications' && (
        <SettingsNotifications onNavigate={handleNavigate} />
      )}

      {currentScreen === 'settingsPrivacy' && (
        <SettingsPrivacy onNavigate={handleNavigate} />
      )}

      {currentScreen === 'settingsHelp' && (
        <SettingsHelp onNavigate={handleNavigate} />
      )}

      {currentScreen === 'settingsAbout' && (
        <SettingsAbout onNavigate={handleNavigate} />
      )}

      {currentScreen === 'savedLists' && (
        <SavedLists
          onNavigate={handleNavigate}
          onSelectList={setSelectedList}
          onUseList={() => {}}
        />
      )}

      {currentScreen === 'savedListDetail' && selectedList && (
        <SavedListDetail
          list={selectedList}
          onNavigate={handleNavigate}
          onUpdateList={(updatedList) => {
            setSelectedList(updatedList);
          }}
        />
      )}

      {currentScreen === 'whereToShop' && (
        <WhereToShop
          onNavigate={handleNavigate}
          onSelectList={() => {}}
        />
      )}

      {currentScreen === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {currentScreen === 'resetPassword' && (
        <ResetPassword onNavigate={handleNavigate} />
      )}

      {/* Bottom Navigation - Sempre visível exceto na tela de login, resetPassword e scanner */}
      {currentScreen !== 'login' && currentScreen !== 'resetPassword' && !showScanner && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          cartCount={products.length}
        />
      )}

      {/* Scanner como modal overlay */}
      <AnimatePresence>
        {showScanner && (
          <Scanner
            onProductScanned={handleProductScanned}
            onClose={handleCloseScanner}
          />
        )}
      </AnimatePresence>

      <Toaster position="top-center" />
    </div>
  );
}
