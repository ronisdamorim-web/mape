import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Camera, Scan } from 'lucide-react';
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

type ScanStatus = 'starting' | 'ready' | 'scanning' | 'detected' | 'added' | 'error';

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
  const [detectedPrice, setDetectedPrice] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('Iniciando câmera...');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  void scannedProducts;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const priceTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastPriceRef = useRef<string>('');
  const lastDetectionTimeRef = useRef<number>(0);
  const recentPricesRef = useRef<Set<string>>(new Set());
  const lastFrameDataRef = useRef<string>('');
  const stableFrameCountRef = useRef<number>(0);
  const detectionTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const emptyFrameCountRef = useRef<number>(0);
  const backoffDelayRef = useRef<number>(1200);

  const simpleBoxBlur = (data: Uint8ClampedArray, width: number, height: number) => {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          const sum = 
            copy[((y-1) * width + x-1) * 4 + c] + copy[((y-1) * width + x) * 4 + c] + copy[((y-1) * width + x+1) * 4 + c] +
            copy[(y * width + x-1) * 4 + c] + copy[(y * width + x) * 4 + c] + copy[(y * width + x+1) * 4 + c] +
            copy[((y+1) * width + x-1) * 4 + c] + copy[((y+1) * width + x) * 4 + c] + copy[((y+1) * width + x+1) * 4 + c];
          data[i + c] = Math.floor(sum / 9);
        }
      }
    }
  };

  const advancedPreprocess = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    simpleBoxBlur(data, width, height);

    let minBrightness = 255;
    let maxBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }

    const range = maxBrightness - minBrightness || 1;
    const contrast = 2.0;
    const brightness = 10;

    for (let i = 0; i < data.length; i += 4) {
      let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      gray = ((gray - minBrightness) / range) * 255;
      gray = ((gray - 128) * contrast) + 128 + brightness;
      gray = Math.max(0, Math.min(255, gray));

      const threshold = gray > 140 ? 255 : 0;
      
      data[i] = threshold;
      data[i + 1] = threshold;
      data[i + 2] = threshold;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const hasVisibleContent = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let edgeCount = 0;
    const step = 4;
    
    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const rightI = (y * width + x + step) * 4;
        const rightBrightness = (data[rightI] + data[rightI + 1] + data[rightI + 2]) / 3;
        
        if (Math.abs(brightness - rightBrightness) > 40) {
          edgeCount++;
        }
      }
    }
    
    const totalSamples = Math.floor(width / step) * Math.floor(height / step);
    const edgeRatio = edgeCount / totalSamples;
    
    return edgeRatio > 0.05;
  };

  const extractPriceOnly = (text: string): number | null => {
    if (!text || text.length < 3) return null;

    const cleanText = text.replace(/[oO]/g, '0').replace(/[lI]/g, '1').replace(/\s+/g, ' ');

    const pricePatterns = [
      /R\s*\$\s*(\d{1,3})[,.](\d{2})/gi,
      /(\d{1,3})[,](\d{2})(?!\d)/g,
      /(\d{1,2})[.](\d{2})(?!\d)/g,
    ];

    for (const pattern of pricePatterns) {
      const matches = [...cleanText.matchAll(pattern)];
      for (const match of matches) {
        const intPart = parseInt(match[1], 10);
        const decPart = parseInt(match[2], 10);
        const price = intPart + decPart / 100;
        
        if (price >= 0.50 && price <= 999.99) {
          return price;
        }
      }
    }

    return null;
  };

  const isPriceDuplicate = (price: number): boolean => {
    const priceKey = price.toFixed(2);
    
    if (priceKey === lastPriceRef.current) {
      return true;
    }

    if (recentPricesRef.current.has(priceKey)) {
      return true;
    }

    return false;
  };

  const registerPrice = (price: number) => {
    const priceKey = price.toFixed(2);
    lastPriceRef.current = priceKey;
    recentPricesRef.current.add(priceKey);

    const timeoutId = setTimeout(() => {
      recentPricesRef.current.delete(priceKey);
      priceTimeoutsRef.current.delete(timeoutId);
    }, 10000);
    priceTimeoutsRef.current.add(timeoutId);
  };

  const checkFrameStability = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
    const sampleSize = 100;
    const stepX = Math.floor(width / 10);
    const stepY = Math.floor(height / 10);
    let hash = '';
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < sampleSize && i * stepX * stepY * 4 < data.length; i++) {
      const idx = (Math.floor(i / 10) * stepY * width + (i % 10) * stepX) * 4;
      if (idx < data.length) {
        hash += String.fromCharCode(Math.floor(data[idx] / 25));
      }
    }
    
    if (hash === lastFrameDataRef.current) {
      stableFrameCountRef.current++;
    } else {
      stableFrameCountRef.current = 0;
      lastFrameDataRef.current = hash;
    }
    
    return stableFrameCountRef.current >= 2;
  };

  const processFrame = useCallback(async () => {
    if (!isMountedRef.current) return;
    if (isProcessingRef.current) return;
    if (!videoRef.current || !canvasRef.current || !workerRef.current) return;
    if (status === 'detected' || status === 'added') return;

    const now = Date.now();
    if (now - lastDetectionTimeRef.current < 2500) {
      scheduleNextScan();
      return;
    }

    isProcessingRef.current = true;
    setStatus('scanning');
    setStatusMessage('Analisando...');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const cropWidth = Math.floor(video.videoWidth * 0.6);
      const cropHeight = Math.floor(video.videoHeight * 0.35);
      const cropX = Math.floor((video.videoWidth - cropWidth) / 2);
      const cropY = Math.floor((video.videoHeight - cropHeight) / 2);

      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        isProcessingRef.current = false;
        scheduleNextScan();
        return;
      }

      ctx.drawImage(
        video,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      const hasContent = hasVisibleContent(ctx, cropWidth, cropHeight);
      if (!hasContent) {
        emptyFrameCountRef.current++;
        backoffDelayRef.current = Math.min(3000, 1200 + emptyFrameCountRef.current * 300);
        isProcessingRef.current = false;
        setStatus('ready');
        setStatusMessage('Aponte para a etiqueta');
        scheduleNextScan();
        return;
      }

      const isStable = checkFrameStability(ctx, cropWidth, cropHeight);
      if (!isStable) {
        isProcessingRef.current = false;
        setStatus('ready');
        setStatusMessage('Estabilize a câmera...');
        scheduleNextScan();
        return;
      }

      emptyFrameCountRef.current = 0;
      backoffDelayRef.current = 1200;

      advancedPreprocess(ctx, cropWidth, cropHeight);

      const imageData = canvas.toDataURL('image/png');

      const result = await workerRef.current.recognize(imageData);
      const text = result.data.text;

      if (!isMountedRef.current) return;

      const price = extractPriceOnly(text);

      if (price !== null && !isPriceDuplicate(price)) {
        lastDetectionTimeRef.current = Date.now();
        registerPrice(price);
        
        setDetectedPrice(price);
        setStatus('detected');
        setStatusMessage(`R$ ${price.toFixed(2)}`);

        const product: ExtractedProduct = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: 'Produto escaneado',
          prices: [{ type: 'varejo', value: price, label: 'Preço' }],
          mainPrice: price,
          rawText: text.substring(0, 100),
          timestamp: Date.now(),
          scannedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        onProductDetected?.(product);

        const addTimeout = setTimeout(() => {
          if (!isMountedRef.current) return;
          detectionTimeoutsRef.current.delete(addTimeout);
          
          onProductAdded?.(product);
          onScanComplete({
            text: product.rawText,
            confidence: 90,
            items: [{ name: product.name, price: product.mainPrice, quantity: 1, unit: 'un' }],
            products: [product]
          });

          setStatus('added');
          setStatusMessage('Adicionado!');

          const resetTimeout = setTimeout(() => {
            if (!isMountedRef.current) return;
            detectionTimeoutsRef.current.delete(resetTimeout);
            setDetectedPrice(null);
            setStatus('ready');
            setStatusMessage('Aponte para a etiqueta');
            scheduleNextScan();
          }, 1500);
          detectionTimeoutsRef.current.add(resetTimeout);
        }, 800);
        detectionTimeoutsRef.current.add(addTimeout);

      } else {
        setStatus('ready');
        setStatusMessage('Aponte para a etiqueta');
        scheduleNextScan();
      }

    } catch (err) {
      console.error('Erro no OCR:', err);
      if (isMountedRef.current) {
        setStatus('ready');
        setStatusMessage('Aponte para a etiqueta');
        scheduleNextScan();
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [status, onProductDetected, onProductAdded, onScanComplete]);

  const scheduleNextScan = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    scanTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        processFrame();
      }
    }, backoffDelayRef.current);
  }, [processFrame]);

  const startScanning = useCallback(async () => {
    try {
      setStatus('starting');
      setStatusMessage('Iniciando câmera...');
      setCameraError(null);

      workerRef.current = await Tesseract.createWorker('por');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 640, max: 720 },
          height: { ideal: 480, max: 540 }
        }
      });
      
      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setStatus('ready');
        setStatusMessage('Aponte para a etiqueta');
        scheduleNextScan();
      }
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err);
      setStatus('error');
      
      if (err.name === 'NotAllowedError') {
        setCameraError('Permissão de câmera negada. Permita o acesso nas configurações.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Nenhuma câmera encontrada.');
      } else {
        setCameraError('Erro ao acessar câmera.');
      }
      
      onError?.('Erro ao acessar câmera');
    }
  }, [scheduleNextScan, onError]);

  const stopScanning = useCallback(async () => {
    isMountedRef.current = false;
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    priceTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    priceTimeoutsRef.current.clear();
    detectionTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    detectionTimeoutsRef.current.clear();
    recentPricesRef.current.clear();
    lastPriceRef.current = '';
    lastFrameDataRef.current = '';
    stableFrameCountRef.current = 0;
    emptyFrameCountRef.current = 0;
    backoffDelayRef.current = 1200;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
      } catch {}
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    startScanning();
    
    return () => {
      isMountedRef.current = false;
      stopScanning();
    };
  }, []);

  const handleClose = async () => {
    await stopScanning();
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div 
          className="relative border-2 border-dashed rounded-2xl"
          style={{
            width: '70%',
            height: '40%',
            borderColor: status === 'detected' || status === 'added' ? '#10B981' : '#3B82F6',
            backgroundColor: status === 'detected' || status === 'added' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            transition: 'all 0.3s ease'
          }}
        >
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

          {status === 'scanning' && (
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-blue-500"
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </div>

      <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
        <div className={`px-4 py-2 rounded-full backdrop-blur-sm ${
          status === 'detected' || status === 'added' 
            ? 'bg-emerald-500/90' 
            : status === 'scanning' 
              ? 'bg-blue-500/80' 
              : 'bg-black/50'
        }`}>
          <div className="flex items-center gap-2">
            {status === 'scanning' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Scan className="w-4 h-4 text-white" />
              </motion.div>
            )}
            {(status === 'detected' || status === 'added') && (
              <CheckCircle className="w-4 h-4 text-white" />
            )}
            {status === 'ready' && (
              <Camera className="w-4 h-4 text-white" />
            )}
            <span className="text-white text-sm font-medium">{statusMessage}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {detectedPrice !== null && (status === 'detected' || status === 'added') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="bg-emerald-500 rounded-2xl px-8 py-6 shadow-2xl">
              <p className="text-white/80 text-sm text-center mb-1">Preço detectado</p>
              <p className="text-white text-4xl font-bold text-center">
                R$ {detectedPrice.toFixed(2)}
              </p>
              {status === 'added' && (
                <p className="text-white/90 text-sm text-center mt-2">
                  ✓ Adicionado ao carrinho
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'error' && cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30 p-8">
          <div className="bg-red-500 rounded-2xl p-6 text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-white mx-auto mb-3" />
            <p className="text-white font-medium mb-4">{cameraError}</p>
            <button
              onClick={() => { setCameraError(null); startScanning(); }}
              className="px-6 py-2 bg-white/20 text-white rounded-xl"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-[100]">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleClose}
          className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
          style={{ pointerEvents: 'auto' }}
        >
          <X className="w-5 h-5 text-gray-800" />
          <span className="text-gray-800 font-semibold">Fechar Scanner</span>
        </motion.button>
      </div>
    </div>
  );
}
