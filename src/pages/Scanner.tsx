import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { MapPin, AlertCircle, CheckCircle, List } from 'lucide-react';
import { OCRScanner, OCRResult, ExtractedProduct } from '../components/OCRScanner';
import { requestGeolocation } from '../utils/geolocation';
import type { LocationStatus } from '../utils/geolocation';
import { createScanSession, updateScanSession, supabase, getSavedLists, addSavedListItem, type SavedListDB, isSupabaseConfigured } from '../services/supabase';
import type { Product } from '../types';

interface ScannerProps {
  onProductScanned: (product: Product) => void;
  onClose: () => void;
}

export function Scanner({ onProductScanned, onClose }: ScannerProps) {
  const [scannedProducts, setScannedProducts] = useState<ExtractedProduct[]>([]);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('requesting');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [marketName, setMarketName] = useState<string>('');
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [scanSessionId, setScanSessionId] = useState<string | null>(null);
  const [showLocationInputs, setShowLocationInputs] = useState(false);

  // Capturar localização ao abrir o scanner
  useEffect(() => {
    let isMounted = true;

    const captureLocation = async () => {
      try {
        setLocationStatus('requesting');
        const location = await requestGeolocation();

        if (!isMounted) return;

        setLocationLat(location.lat);
        setLocationLng(location.lng);
        setLocationStatus(location.status);

        // Se negado ou erro, mostrar inputs manuais
        if (location.status === 'denied' || location.status === 'error') {
          setShowLocationInputs(true);
        }

        // Atualizar estado de localização
        if (isMounted) {
          setLocationStatus(location.status === 'captured' ? 'captured' : location.status === 'denied' ? 'denied' : 'error');
          if (location.lat && location.lng) {
            setLocationLat(location.lat);
            setLocationLng(location.lng);
          }
        }

        // Criar sessão de scan no Supabase (tenta, mas não trava se falhar)
        if (isSupabaseConfigured()) {
          try {
            const session = await createScanSession({
              user_id: null, // Será preenchido quando houver auth
              market_name: null,
              location_lat: location.lat,
              location_lng: location.lng,
              location_label: location.label,
              raw_text: null,
              status: 'draft'
            });

            if (isMounted && session?.id) {
              setScanSessionId(session.id);
            }
          } catch (error) {
            console.warn('Erro ao criar sessão de scan:', error);
            // Continua normalmente mesmo se falhar
          }
        }
      } catch (error) {
        console.error('Erro ao capturar localização:', error);
        if (isMounted) {
          setLocationStatus('error');
          setShowLocationInputs(true);
        }
      }
    };

    captureLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // Salvar dados manuais quando preenchidos
  const handleSaveManualLocation = async () => {
    const market = marketName.trim();
    const location = locationLabel.trim();
    
    if (!market && !location) {
      toast.error('Preencha pelo menos o nome do mercado ou a localização (bairro/cidade)');
      return;
    }

    // Validar tamanho dos campos
    if (market && market.length > 200) {
      toast.error('Nome do mercado muito longo (máximo 200 caracteres)');
      return;
    }
    
    if (location && location.length > 200) {
      toast.error('Localização muito longa (máximo 200 caracteres)');
      return;
    }

    // Atualizar estado local primeiro
    setMarketName(market || '');
    setLocationLabel(location || '');
    setLocationStatus('manual');
    setShowLocationInputs(false);

    // Tentar salvar no Supabase se estiver configurado e houver sessão
    if (!isSupabaseConfigured()) {
      toast.success('Localização registrada localmente');
      return;
    }

    try {
      const updateData: any = {
        market_name: market || null,
        location_label: location || null
      };

      if (scanSessionId) {
        const success = await updateScanSession(scanSessionId, updateData);
        if (success) {
          toast.success('Localização salva com sucesso');
        } else {
          toast.warning('Localização registrada localmente (erro ao salvar no servidor)');
        }
      } else {
        toast.success('Localização registrada localmente');
      }
    } catch (error) {
      console.error('Erro ao salvar localização manual:', error);
      // Mesmo com erro, atualiza o estado local para não bloquear o usuário
      setLocationStatus('manual');
      setShowLocationInputs(false);
      toast.warning('Localização registrada localmente (erro ao salvar no servidor)');
    }
  };

  const handleScanComplete = (result: OCRResult) => {
    console.log('Scan complete:', result);
    // Atualizar sessão com raw_text quando houver resultado
    if (scanSessionId && result.text && isSupabaseConfigured()) {
      updateScanSession(scanSessionId, { raw_text: result.text }).catch(err => {
        console.warn('Erro ao atualizar sessão de scan no Supabase:', err);
        // Não mostrar erro para usuário, é apenas metadata
      });
    }
  };

  const handleProductDetected = (product: ExtractedProduct) => {
    console.log('Produto detectado:', product.mainPrice);
  };

  const [pendingProduct, setPendingProduct] = useState<ExtractedProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState({ name: '', price: '', rawText: '' });
  const [availableLists, setAvailableLists] = useState<SavedListDB[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [loadingLists, setLoadingLists] = useState(false);

  const handleProductAdded = async (product: ExtractedProduct) => {
    // Mostrar preview/edição antes de adicionar
    setPendingProduct(product);
    setEditingProduct({
      name: product.name,
      price: product.mainPrice.toString(),
      rawText: product.rawText
    });
    
    // Carregar listas disponíveis do usuário
    await loadUserLists();
  };

  const loadUserLists = async () => {
    try {
      setLoadingLists(true);
      
      if (!isSupabaseConfigured()) {
        setAvailableLists([]);
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError);
        return;
      }

      if (session?.user) {
        const lists = await getSavedLists(session.user.id);
        setAvailableLists(lists || []);
      }
      // Se não houver sessão, simplesmente não carrega listas (modo offline)
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      // Não mostrar erro para usuário, apenas continuar sem opção de lista
    } finally {
      setLoadingLists(false);
    }
  };

  const handleConfirmProduct = async () => {
    if (!pendingProduct) {
      toast.error('Erro: produto não encontrado');
      return;
    }

    // Validações
    const name = editingProduct.name.trim();
    if (!name) {
      toast.error('Digite o nome do produto');
      return;
    }

    const precoAvulso = parseFloat(editingProduct.price);
    if (isNaN(precoAvulso) || precoAvulso <= 0) {
      toast.error('Digite um preço válido maior que zero');
      return;
    }

    const atacadoPrice = pendingProduct.prices.find(p => p.type === 'atacado');
    const creditoPrice = pendingProduct.prices.find(p => p.type === 'credito');

    const precoAtacado = atacadoPrice?.value || 0;
    const precoCartao = creditoPrice?.value || 0;

    setScannedProducts(prev => [...prev, pendingProduct]);

    const newProduct: Product = {
      id: `ocr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      precoAvulso: precoAvulso,
      precoCartao: precoCartao,
      precoAtacado: precoAtacado,
      quantity: 1,
      timestamp: pendingProduct.timestamp
    };

    // Se uma lista foi selecionada, adicionar item à lista
    if (selectedListId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const added = await addSavedListItem({
            list_id: selectedListId,
            name: name,
            quantity: 1,
            last_price: precoAvulso,
            category: null
          });
          
          if (added) {
            toast.success('Produto adicionado ao carrinho e à lista');
          } else {
            toast.warning('Produto adicionado ao carrinho, mas houve erro ao salvar na lista');
          }
        } else {
          toast.warning('Produto adicionado ao carrinho. Faça login para salvar em listas');
        }
      } catch (error) {
        console.error('Erro ao adicionar à lista:', error);
        toast.warning('Produto adicionado ao carrinho, mas houve erro ao salvar na lista');
      }
    } else {
      toast.success(`Produto adicionado ao carrinho: R$ ${precoAvulso.toFixed(2)}`, {
        duration: 2000
      });
    }

    onProductScanned(newProduct);
    setPendingProduct(null);
    setEditingProduct({ name: '', price: '', rawText: '' });
    setSelectedListId(null);
  };

  const handleCancelProduct = () => {
    setPendingProduct(null);
    setEditingProduct({ name: '', price: '', rawText: '' });
    setSelectedListId(null);
  };

  const handleError = (error: string) => {
    console.error('Erro no scanner:', error);
    
    // Mensagens mais específicas para o usuário
    if (error.includes('camera') || error.includes('permission')) {
      toast.error('Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador.');
    } else if (error.includes('not found') || error.includes('devices')) {
      toast.error('Nenhuma câmera encontrada. Verifique se seu dispositivo possui câmera.');
    } else {
      toast.error(`Erro no scanner: ${error}`);
    }
  };

  const handleClose = () => {
    if (scannedProducts.length > 0) {
      toast.success(`${scannedProducts.length} produto(s) escaneado(s)`, {
        description: `Total: R$ ${scannedProducts.reduce((sum, p) => sum + p.mainPrice, 0).toFixed(2)}`
      });
    }
    onClose();
  };

  const getStatusLabel = () => {
    switch (locationStatus) {
      case 'captured':
        return 'Localização capturada';
      case 'manual':
        return 'Localização manual';
      case 'denied':
        return 'Localização negada';
      case 'requesting':
        return 'Obtendo localização...';
      case 'error':
        return 'Erro ao obter localização';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = () => {
    switch (locationStatus) {
      case 'captured':
      case 'manual':
        return <CheckCircle className="w-4 h-4 text-[#10B981]" />;
      case 'denied':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#EF4444]" />;
      default:
        return <MapPin className="w-4 h-4 text-[#6B7280] animate-pulse" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[1050]"
    >
      {/* Status de Localização - Overlay no topo */}
      <div className="absolute top-0 left-0 right-0 z-[1060] bg-black/80 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-white text-sm font-medium">{getStatusLabel()}</span>
            </div>
            {(locationStatus === 'denied' || locationStatus === 'error') && (
              <button
                onClick={() => setShowLocationInputs(!showLocationInputs)}
                className="text-[#0066FF] text-xs font-semibold hover:underline"
              >
                {showLocationInputs ? 'Ocultar' : 'Informar manualmente'}
              </button>
            )}
          </div>

          {/* Inputs manuais */}
          {showLocationInputs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 mt-2 bg-black/50 rounded-lg p-3"
            >
              <input
                type="text"
                placeholder="Nome do mercado (ex: Supermercado X)"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
              <input
                type="text"
                placeholder="Bairro/Cidade (ex: Centro, São Paulo)"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
              <button
                onClick={handleSaveManualLocation}
                className="w-full bg-[#0066FF] text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#0052CC] transition-colors"
              >
                Salvar Localização
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* OCRScanner - mantido intacto */}
      <OCRScanner
        onScanComplete={handleScanComplete}
        onProductDetected={handleProductDetected}
        onProductAdded={handleProductAdded}
        onError={handleError}
        onClose={handleClose}
        scannedProducts={scannedProducts}
      />

      {/* Modal de Preview/Edição */}
      {pendingProduct && (
        <div className="absolute inset-0 bg-black/80 z-[1070] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-[#111827] font-bold text-xl mb-4">Revisar Produto Escaneado</h3>
            
            {/* Preview do texto original */}
            <div className="mb-4">
              <label className="text-sm text-[#6B7280] font-medium mb-2 block">
                Texto reconhecido pelo OCR:
              </label>
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 text-sm text-[#6B7280] max-h-32 overflow-y-auto">
                {editingProduct.rawText || 'Nenhum texto reconhecido'}
              </div>
            </div>

            {/* Edição do nome */}
            <div className="mb-4">
              <label className="text-sm text-[#111827] font-semibold mb-2 block">
                Nome do produto *
              </label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                placeholder="Nome do produto"
              />
            </div>

            {/* Edição do preço */}
            <div className="mb-4">
              <label className="text-sm text-[#111827] font-semibold mb-2 block">
                Preço *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Opção de salvar em lista */}
            <div className="mb-6">
              <label className="text-sm text-[#111827] font-semibold mb-2 block flex items-center gap-2">
                <List className="w-4 h-4" />
                Adicionar à lista (opcional)
              </label>
              {loadingLists ? (
                <div className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 bg-[#F9FAFB] text-center text-sm text-[#6B7280]">
                  Carregando listas...
                </div>
              ) : availableLists.length > 0 ? (
                <select
                  value={selectedListId || ''}
                  onChange={(e) => setSelectedListId(e.target.value || null)}
                  className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0066FF] bg-white"
                >
                  <option value="">Nenhuma lista selecionada</option>
                  {availableLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 bg-[#F9FAFB] text-sm text-[#6B7280]">
                  Você não possui listas. Crie uma lista em "Minhas Listas" para salvar produtos automaticamente.
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelProduct}
                className="flex-1 border border-[#E5E7EB] text-[#6B7280] rounded-lg px-4 py-3 font-semibold hover:bg-[#F9FAFB] transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={handleConfirmProduct}
                disabled={!editingProduct.name.trim() || !editingProduct.price}
                className="flex-1 bg-[#0066FF] text-white rounded-lg px-4 py-3 font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
