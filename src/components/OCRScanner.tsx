import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import Tesseract from 'tesseract.js';

export interface DetectedPrice {
  type: 'atacado' | 'varejo' | 'credito' | 'unidade' | 'promocional' | 'kg' | 'outro';
  value: number;
  label: string;
}

export interface ExtractedProduct {
  id: string;
  name: string;
  unit?: string;
  prices: DetectedPrice[];
  mainPrice: number;
  rawText: string;
  timestamp: number;
  scannedAt: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  items: ExtractedItem[];
  products: ExtractedProduct[];
}

export interface ExtractedItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

type ScanStatus = 'starting' | 'scanning' | 'analyzing' | 'detected' | 'error' | 'added';

interface PendingProduct {
  product: ExtractedProduct;
  countdown: number;
  selectedPrice: number;
}

interface OCRScannerProps {
  onScanComplete: (result: OCRResult) => void;
  onProductDetected?: (product: ExtractedProduct) => void;
  onProductAdded?: (product: ExtractedProduct) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  scannedProducts?: ExtractedProduct[];
}

export function OCRScanner({ 
  onScanComplete, 
  onProductDetected, 
  onProductAdded,
  onError, 
  onClose,
  scannedProducts = []
}: OCRScannerProps) {
  const [status, setStatus] = useState<ScanStatus>('starting');
  const [pendingProduct, setPendingProduct] = useState<PendingProduct | null>(null);
  const [addedProducts, setAddedProducts] = useState<ExtractedProduct[]>([]);
  const [lastProcessedText, setLastProcessedText] = useState('');
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  const preprocessImage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const contrast = 1.5;
      const adjusted = ((gray - 128) * contrast) + 128;
      const threshold = adjusted > 130 ? 255 : adjusted < 70 ? 0 : adjusted;
      
      data[i] = threshold;
      data[i + 1] = threshold;
      data[i + 2] = threshold;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const isValidPriceText = (text: string): boolean => {
    if (!text || text.length < 5 || text.length > 1500) return false;
    
    const hasRealSign = /R\s*\$|RS\s*\$|R\$|\$\s*\d/i.test(text);
    const hasDecimalPrice = /\d{1,4}[,\.]\d{2}/i.test(text);
    
    return hasRealSign || hasDecimalPrice;
  };

  const isDuplicate = (product: ExtractedProduct): boolean => {
    const allProducts = [...scannedProducts, ...addedProducts];
    const now = Date.now();
    return allProducts.some(p => {
      const timeDiff = now - p.timestamp;
      const sameName = p.name.toLowerCase().substring(0, 10) === product.name.toLowerCase().substring(0, 10);
      const samePrice = Math.abs(p.mainPrice - product.mainPrice) < 0.10;
      if (timeDiff < 5000) {
        return sameName && samePrice;
      }
      return sameName && samePrice;
    });
  };


  const extractProductInfo = useCallback((text: string): ExtractedProduct | null => {
    if (!isValidPriceText(text)) return null;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const fullText = lines.join(' ').toUpperCase();

    let productName = '';
    
    const productKeywords = [
      'CAFE', 'CAFÉ', 'ARROZ', 'FEIJAO', 'FEIJÃO', 'AÇUCAR', 'ACUCAR',
      'OLEO', 'ÓLEO', 'LEITE', 'CARNE', 'FRANGO', 'TRADICIONAL', 'EXTRA FORTE',
      'POUCH', 'ALMOF', 'CORACOES', 'CORAÇÕES', 'PILAO', 'PILÃO', 'MELITTA',
      'SABAO', 'SABÃO', 'DETERGENTE', 'MACARRAO', 'MACARRÃO', 'BISCOITO',
      'BOLACHA', 'REFRIGERANTE', 'SUCO', 'AGUA', 'ÁGUA', 'INTEGRAL',
      'DESNATADO', 'FARINHA', 'SAL', 'MARGARINA', 'MANTEIGA', 'QUEIJO',
      'PRESUNTO', 'MORTADELA', 'SALSICHA', 'LINGUICA', 'BACON'
    ];

    for (const line of lines) {
      const upperLine = line.toUpperCase();
      if (productKeywords.some(kw => upperLine.includes(kw))) {
        productName = line.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, ' ').trim();
        break;
      }
    }

    if (!productName) {
      const firstValidLine = lines.find(l => 
        l.length > 4 && 
        !/^[R\$\d\s,\.]+$/.test(l) &&
        !/^(PRECO|PREÇO|ATACADO|VAREJO|CRED|PASSAI|CX\d|AM\d|FD\d|LJ\s*\d)/i.test(l)
      );
      if (firstValidLine) {
        productName = firstValidLine.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, ' ').trim();
      }
    }

    if (!productName || productName.length < 3) {
      productName = 'Produto não identificado';
    }

    const prices: DetectedPrice[] = [];
    const addedPrices = new Set<string>();

    const addPrice = (type: DetectedPrice['type'], value: number, label: string) => {
      const key = `${type}-${value.toFixed(2)}`;
      if (value > 0.50 && value < 1000 && !addedPrices.has(key)) {
        addedPrices.add(key);
        prices.push({ type, value, label });
      }
    };

    const atacadoPatterns = [
      /ATACADO[^\d]{0,15}R?\$?\s*(\d{1,3})[,.](\d{2})/gi,
      /(\d{1,3})[,.](\d{2})[^\d]{0,10}ATACADO/gi
    ];
    for (const pattern of atacadoPatterns) {
      const matches = fullText.matchAll(pattern);
      for (const match of matches) {
        const price = parseFloat(`${match[1]}.${match[2]}`);
        addPrice('atacado', price, 'Atacado');
      }
    }

    const varejoPatterns = [
      /VAREJO[^\d]{0,15}R?\$?\s*(\d{1,3})[,.](\d{2})/gi,
      /(\d{1,3})[,.](\d{2})[^\d]{0,10}VAREJO/gi,
      /AVULSO[^\d]{0,15}R?\$?\s*(\d{1,3})[,.](\d{2})/gi
    ];
    for (const pattern of varejoPatterns) {
      const matches = fullText.matchAll(pattern);
      for (const match of matches) {
        const price = parseFloat(`${match[1]}.${match[2]}`);
        addPrice('varejo', price, 'Varejo');
      }
    }

    const creditoPatterns = [
      /(PASSAI|CRED|CREDI|CARTAO|CARTÃO)[^\d]{0,15}R?\$?\s*(\d{1,3})[,.](\d{2})/gi
    ];
    for (const pattern of creditoPatterns) {
      const matches = fullText.matchAll(pattern);
      for (const match of matches) {
        const price = parseFloat(`${match[2]}.${match[3]}`);
        addPrice('credito', price, 'Crediário');
      }
    }

    const mainPricePatterns = [
      /R\s*\$\s*(\d{1,3})[,.](\d{2})/gi,
      /RS\s*(\d{1,3})[,.](\d{2})/gi
    ];
    if (prices.length === 0) {
      for (const pattern of mainPricePatterns) {
        const matches = fullText.matchAll(pattern);
        for (const match of matches) {
          const price = parseFloat(`${match[1]}.${match[2]}`);
          addPrice('varejo', price, 'Preço');
        }
      }
    }

    if (prices.length === 0) {
      const decimalPattern = /(\d{1,3})[,](\d{2})(?!\d)/g;
      const matches = fullText.matchAll(decimalPattern);
      let count = 0;
      for (const match of matches) {
        if (count >= 2) break;
        const price = parseFloat(`${match[1]}.${match[2]}`);
        if (price >= 1.00) {
          addPrice('outro', price, 'Preço');
          count++;
        }
      }
    }

    if (prices.length === 0) return null;

    const priorityOrder = ['varejo', 'atacado', 'credito', 'unidade', 'kg', 'outro'];
    prices.sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a.type);
      const bIdx = priorityOrder.indexOf(b.type);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.value - b.value;
    });

    const mainPrice = prices[0].value;

    const unitMatch = fullText.match(/(\d+)\s*(G|KG|ML|L|UN)\b/i);
    const unit = unitMatch ? `${unitMatch[1]}${unitMatch[2].toLowerCase()}` : undefined;

    const now = new Date();

    return {
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: productName.substring(0, 60),
      unit,
      prices,
      mainPrice,
      rawText: text.substring(0, 300),
      timestamp: Date.now(),
      scannedAt: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    };
  }, []);

  const processFrame = useCallback(async () => {
    if (isProcessingRef.current || !videoRef.current || !canvasRef.current || !cropCanvasRef.current || !workerRef.current) {
      return;
    }

    if (pendingProduct) return;

    const now = Date.now();
    if (now - lastDetectionTime < 2000) return;

    isProcessingRef.current = true;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const cropCanvas = cropCanvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        isProcessingRef.current = false;
        return;
      }
      
      ctx.drawImage(video, 0, 0);

      const frameWidth = video.videoWidth * 0.75;
      const frameHeight = video.videoHeight * 0.55;
      const frameX = (video.videoWidth - frameWidth) / 2;
      const frameY = (video.videoHeight - frameHeight) / 2;

      cropCanvas.width = frameWidth;
      cropCanvas.height = frameHeight;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) {
        isProcessingRef.current = false;
        return;
      }

      cropCtx.drawImage(
        canvas,
        frameX, frameY, frameWidth, frameHeight,
        0, 0, frameWidth, frameHeight
      );

      preprocessImage(cropCtx, frameWidth, frameHeight);
      
      const imageData = cropCanvas.toDataURL('image/jpeg', 0.8);

      setStatus('analyzing');

      const result = await workerRef.current.recognize(imageData);
      const text = result.data.text;

      if (text.length > 8 && text !== lastProcessedText) {
        setLastProcessedText(text);
        
        const product = extractProductInfo(text);
        
        if (product && product.prices.length > 0) {
          if (isDuplicate(product)) {
            setStatus('scanning');
          } else {
            setStatus('detected');
            setLastDetectionTime(Date.now());
            
            setPendingProduct({ 
              product, 
              countdown: 3,
              selectedPrice: product.mainPrice
            });
            onProductDetected?.(product);
          }
        } else {
          setStatus('scanning');
        }
      } else {
        setStatus('scanning');
      }
    } catch (err) {
      console.error('Erro no OCR:', err);
      setStatus('scanning');
    } finally {
      isProcessingRef.current = false;
    }
  }, [lastProcessedText, lastDetectionTime, pendingProduct, extractProductInfo, onProductDetected, scannedProducts, addedProducts]);

  useEffect(() => {
    if (!pendingProduct) return;

    if (pendingProduct.countdown <= 0) {
      confirmAdd(pendingProduct.selectedPrice);
      return;
    }

    countdownIntervalRef.current = setTimeout(() => {
      setPendingProduct(prev => prev ? { ...prev, countdown: prev.countdown - 1 } : null);
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearTimeout(countdownIntervalRef.current);
      }
    };
  }, [pendingProduct]);

  const confirmAdd = (selectedPrice?: number) => {
    if (!pendingProduct) return;

    const product = {
      ...pendingProduct.product,
      mainPrice: selectedPrice || pendingProduct.selectedPrice
    };
    
    setAddedProducts(prev => [...prev, product]);
    onProductAdded?.(product);

    const items: ExtractedItem[] = [{
      name: product.name,
      price: product.mainPrice,
      quantity: 1,
      unit: product.unit || 'un'
    }];

    onScanComplete({
      text: product.rawText,
      confidence: 90,
      items,
      products: [product]
    });

    setStatus('added');
    setPendingProduct(null);

    setTimeout(() => {
      setStatus('scanning');
    }, 2000);
  };

  const cancelAdd = () => {
    setPendingProduct(null);
    setStatus('scanning');
  };

  const selectPrice = (price: number) => {
    if (pendingProduct) {
      setPendingProduct({ ...pendingProduct, selectedPrice: price });
    }
  };

  const retryCamera = () => {
    setCameraError(null);
    setStatus('starting');
    startScanning();
  };

  const startScanning = useCallback(async () => {
    try {
      setStatus('starting');
      setCameraError(null);

      workerRef.current = await Tesseract.createWorker('por');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 640, max: 800 },
          height: { ideal: 480, max: 600 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setStatus('scanning');
        scanIntervalRef.current = setInterval(processFrame, 700);
      }
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err);
      setStatus('error');
      
      if (err.name === 'NotAllowedError') {
        setCameraError('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Nenhuma câmera encontrada no dispositivo.');
      } else if (err.name === 'NotSupportedError') {
        setCameraError('Este navegador não suporta acesso à câmera. Use HTTPS.');
      } else {
        setCameraError('Erro ao acessar câmera. Verifique as permissões.');
      }
      
      onError?.('Erro ao acessar câmera');
    }
  }, [processFrame, onError]);

  const stopScanning = useCallback(async () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (countdownIntervalRef.current) {
      clearTimeout(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startScanning();
    return () => { stopScanning(); };
  }, []);

  const handleClose = async () => {
    await stopScanning();
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={cropCanvasRef} className="hidden" />
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      <div className="absolute top-4 right-4 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </motion.button>
      </div>
      
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div 
          className="relative"
          style={{
            width: '75%',
            height: '55%',
          }}
        >
          <div className="absolute -top-1 -left-1 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
          <div className="absolute -top-1 -right-1 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
          <div className="absolute -bottom-1 -left-1 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
          <div className="absolute -bottom-1 -right-1 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />

          {status === 'scanning' && (
            <motion.div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              animate={{
                top: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'detected' && pendingProduct && (
          <motion.div
            key="detected"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center p-8 z-30"
          >
            <div className="bg-emerald-500 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Produto Detectado!
              </h2>
              <p className="text-white/90 text-lg mb-4">
                {pendingProduct.product.name}
              </p>

              {pendingProduct.product.prices.length > 1 ? (
                <div className="space-y-2 mb-4">
                  <p className="text-white/80 text-sm">Selecione o preço:</p>
                  {pendingProduct.product.prices.map((price, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectPrice(price.value)}
                      className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                        pendingProduct.selectedPrice === price.value
                          ? 'bg-white text-emerald-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {price.label}: R$ {price.value.toFixed(2)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-3xl font-bold text-white mb-4">
                  R$ {pendingProduct.selectedPrice.toFixed(2)}
                </p>
              )}

              <p className="text-white/80 text-sm mb-4">
                Adicionando em {pendingProduct.countdown}...
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelAdd}
                  className="flex-1 py-3 bg-white/20 text-white rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => confirmAdd(pendingProduct.selectedPrice)}
                  className="flex-1 py-3 bg-white text-emerald-600 rounded-xl font-semibold"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'added' && (
          <motion.div
            key="added"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center p-8 z-30"
          >
            <div className="bg-emerald-500 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold text-white">
                Adicionado ao carrinho!
              </h2>
            </div>
          </motion.div>
        )}

        {status === 'error' && cameraError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center p-8 z-30"
          >
            <div className="bg-red-500 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
              <AlertCircle className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Erro na Leitura
              </h2>
              <p className="text-white/90 text-sm mb-4">
                {cameraError}
              </p>
              <button
                onClick={retryCamera}
                className="py-3 px-6 bg-white/20 text-white rounded-xl font-semibold border-2 border-white"
              >
                Tentar Novamente
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-12">
        <div className="flex items-center gap-3 mb-2">
          {status === 'scanning' || status === 'analyzing' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : status === 'detected' || status === 'added' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          
          <span className="text-white font-semibold text-lg">
            {status === 'starting' && 'Iniciando câmera...'}
            {status === 'scanning' && 'Escaneando preços...'}
            {status === 'analyzing' && 'Analisando etiqueta...'}
            {status === 'detected' && 'Produto encontrado'}
            {status === 'added' && `${addedProducts[addedProducts.length - 1]?.name} adicionado`}
            {status === 'error' && 'Erro na detecção'}
          </span>
        </div>
        
        <p className="text-white/60 text-sm mb-1">
          Aponte para etiquetas de preço
        </p>
        
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Camera className="w-4 h-4" />
          <span>OCR automático ativo</span>
        </div>
      </div>
    </div>
  );
}
