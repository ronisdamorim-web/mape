import { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Home } from './pages/Home';
import { Scanner } from './pages/Scanner';
import { Cart } from './pages/Cart';
import { SavedLists } from './pages/SavedLists';
import { SavedListDetail } from './pages/SavedListDetail';
import { Settings } from './pages/Settings';
import { SettingsProfile } from './pages/SettingsProfile';
import { SettingsNotifications } from './pages/SettingsNotifications';
import { SettingsPrivacy } from './pages/SettingsPrivacy';
import { SettingsHelp } from './pages/SettingsHelp';
import { SettingsAbout } from './pages/SettingsAbout';
import { History } from './pages/History';
import { Compare } from './pages/Compare';
import { WhereToShop } from './pages/WhereToShop';
import { BottomNav } from './components/BottomNav';
import { SaveAsListModal } from './components/SaveAsListModal';
import type { Screen, Product, SavedList } from './types';
import { supabase, getCartItems, addCartItem, updateCartItem, deleteCartItem, clearCart, addGlobalPrice, savePurchaseHistory } from './services/supabase';
import type { User } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showScanner, setShowScanner] = useState(false);
  const [showSaveAsListModal, setShowSaveAsListModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedList, setSelectedList] = useState<SavedList | null>(null);
  const [pendingPurchaseProducts, setPendingPurchaseProducts] = useState<Product[]>([]);
  const [compareContext, setCompareContext] = useState<'whereToShop' | 'default'>('default');
  const [compareList, setCompareList] = useState<SavedList | null>(null);
  
  const lastScanTimeRef = useRef<Map<string, number>>(new Map());

  const loadCart = useCallback(async (userId: string) => {
    try {
      const items = await getCartItems(userId);
      const loadedProducts: Product[] = items.map(item => ({
        id: item.id || '',
        name: item.name,
        quantity: item.quantity || 1,
        precoAvulso: parseFloat(String(item.preco_avulso)) || 0,
        precoCartao: parseFloat(String(item.preco_cartao)) || 0,
        precoAtacado: parseFloat(String(item.preco_atacado)) || 0,
        barcode: item.barcode,
        timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now()
      }));
      setProducts(loadedProducts);
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
      toast.error('Erro ao carregar carrinho');
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setShowResetPassword(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCart(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
      }

      if (event === 'SIGNED_IN' && session?.user) {
        loadCart(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadCart]);

  const handleProductScanned = async (product: Product) => {
    if (!user) {
      toast.error('Faça login para adicionar produtos');
      return;
    }

    const productKey = product.name.toLowerCase().substring(0, 20);
    const lastScan = lastScanTimeRef.current.get(productKey);
    const now = Date.now();

    if (lastScan && (now - lastScan) < 5000) {
      toast.info('Item já adicionado');
      return;
    }

    lastScanTimeRef.current.set(productKey, now);

    const existingIndex = products.findIndex(p => 
      p.name.toLowerCase().substring(0, 15) === product.name.toLowerCase().substring(0, 15)
    );

    if (existingIndex >= 0) {
      const existing = products[existingIndex];
      const newQuantity = existing.quantity + 1;
      
      const success = await updateCartItem(existing.id, { quantity: newQuantity });
      
      if (success) {
        setProducts(prev => {
          const updated = [...prev];
          updated[existingIndex] = { ...existing, quantity: newQuantity };
          return updated;
        });
        toast.info('Quantidade atualizada');
      }
    } else {
      const cartItem = {
        user_id: user.id,
        name: product.name,
        quantity: product.quantity,
        preco_avulso: product.precoAvulso || 0,
        preco_cartao: product.precoCartao || 0,
        preco_atacado: product.precoAtacado || 0,
        barcode: product.barcode,
        source: 'ocr'
      };

      const saved = await addCartItem(cartItem);
      
      if (saved) {
        const newProduct: Product = {
          ...product,
          id: saved.id || product.id
        };
        setProducts(prev => [...prev, newProduct]);

        addGlobalPrice({
          product_name: product.name,
          barcode: product.barcode,
          price: product.precoAvulso,
          price_type: 'varejo',
          detected_at: new Date().toISOString(),
          user_id: user.id
        });
      } else {
        toast.error('Erro ao salvar produto');
      }
    }
  };

  const handleUpdateProducts = async (newProducts: Product[]) => {
    if (!user) return;

    // Captura estado atual ANTES de atualizar
    const currentProducts = [...products];
    const newIds = new Set(newProducts.map(p => p.id));

    // Atualiza estado imediatamente para UI responsiva
    setProducts(newProducts);

    // Deleta itens removidos (usando estado capturado)
    for (const oldProduct of currentProducts) {
      if (!newIds.has(oldProduct.id)) {
        deleteCartItem(oldProduct.id).catch(err => console.error('Erro ao deletar:', err));
      }
    }

    // Atualiza quantidades modificadas (usando estado capturado)
    for (const newProduct of newProducts) {
      const oldProduct = currentProducts.find(p => p.id === newProduct.id);
      if (oldProduct && oldProduct.quantity !== newProduct.quantity) {
        updateCartItem(newProduct.id, { quantity: newProduct.quantity }).catch(err => console.error('Erro ao atualizar:', err));
      }
    }
  };

  const handleFinalizePurchase = async () => {
    if (products.length === 0) return;
    setPendingPurchaseProducts([...products]);
    
    if (user) {
      const items = products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        price: p.precoAvulso || 0,
        preco_cartao: p.precoCartao || 0,
        preco_atacado: p.precoAtacado || 0
      }));
      const total = products.reduce((sum, p) => sum + ((p.precoAvulso || 0) * p.quantity), 0);
      
      const saved = await savePurchaseHistory({
        user_id: user.id,
        items,
        total,
        item_count: products.length
      });
      
      if (saved) {
        await clearCart(user.id);
        setProducts([]);
        setShowSaveAsListModal(true);
      } else {
        toast.error('Erro ao salvar histórico. Crie a tabela no Supabase.');
        setPendingPurchaseProducts([]);
        return;
      }
    } else {
      setProducts([]);
      setShowSaveAsListModal(true);
    }
  };

  const handleSaveAsList = (_listName: string) => {
    if (pendingPurchaseProducts.length === 0) return;
    toast.info('Salvar lista em desenvolvimento');
    setPendingPurchaseProducts([]);
    setShowSaveAsListModal(false);
    setCurrentScreen('history');
  };

  const handleDeclineSaveAsList = () => {
    setPendingPurchaseProducts([]);
    setShowSaveAsListModal(false);
    setCurrentScreen('history');
    toast.success('Compra finalizada');
  };

  const handleSelectListForComparison = (list: SavedList) => {
    setCompareList(list);
  };

  const handleNavigate = (screen: Screen) => {
    if (screen === 'compare') {
      setCompareContext(currentScreen === 'whereToShop' ? 'whereToShop' : 'default');
      if (currentScreen !== 'whereToShop') setCompareList(null);
    } else {
      if (currentScreen === 'compare' && screen !== 'whereToShop') {
        setCompareList(null);
      }
    }
    setCurrentScreen(screen);
  };

  const handleUpdateList = (list: SavedList) => {
    setSelectedList(list);
    toast.info('Atualização de lista em desenvolvimento');
  };

  const handleUseList = async (list: SavedList) => {
    if (!user) return;

    for (const item of list.items) {
      await addCartItem({
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        preco_avulso: 0,
        preco_cartao: 0,
        preco_atacado: 0,
        source: 'list'
      });
    }
    
    await loadCart(user.id);
    toast.success('Lista carregada no carrinho');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProducts([]);
      setCurrentScreen('home');
      toast.success('Sessão encerrada com sucesso');
    } catch (error) {
      toast.error('Erro ao sair. Tente novamente.');
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

  if (showResetPassword) {
    return (
      <div className="min-h-screen">
        <ResetPassword onComplete={() => {
          setShowResetPassword(false);
          setCurrentScreen('home');
        }} />
        <Toaster position="top-center" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Login onLogin={handleLogin} />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {currentScreen === 'home' && (
        <Home
          onNavigate={handleNavigate}
          onStartScanning={() => setShowScanner(true)}
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

      {currentScreen === 'savedLists' && (
        <SavedLists
          onNavigate={handleNavigate}
          onSelectList={setSelectedList}
          onUseList={handleUseList}
        />
      )}

      {currentScreen === 'savedListDetail' && selectedList && (
        <SavedListDetail
          list={selectedList}
          onNavigate={handleNavigate}
          onUpdateList={handleUpdateList}
        />
      )}

      {currentScreen === 'settings' && <Settings onNavigate={handleNavigate} onLogout={handleLogout} />}

      {currentScreen === 'settingsProfile' && <SettingsProfile onNavigate={handleNavigate} />}

      {currentScreen === 'settingsNotifications' && <SettingsNotifications onNavigate={handleNavigate} />}

      {currentScreen === 'settingsPrivacy' && <SettingsPrivacy onNavigate={handleNavigate} />}

      {currentScreen === 'settingsHelp' && <SettingsHelp onNavigate={handleNavigate} />}

      {currentScreen === 'settingsAbout' && <SettingsAbout onNavigate={handleNavigate} />}

      {currentScreen === 'history' && <History />}

      {currentScreen === 'compare' && (
        <Compare 
          products={products}
          savedList={compareList}
          onNavigate={handleNavigate}
          context={compareContext}
        />
      )}

      {currentScreen === 'whereToShop' && (
        <WhereToShop 
          onNavigate={handleNavigate}
          onSelectList={handleSelectListForComparison}
        />
      )}

      <AnimatePresence>
        {showScanner && (
          <Scanner
            onProductScanned={handleProductScanned}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>

      <SaveAsListModal
        isOpen={showSaveAsListModal}
        itemCount={pendingPurchaseProducts.length}
        onConfirm={handleSaveAsList}
        onDecline={handleDeclineSaveAsList}
      />

      <BottomNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        cartCount={products.length}
      />

      <Toaster position="top-center" />
    </div>
  );
}
