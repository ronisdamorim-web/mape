import { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { OCRScanner, OCRResult, ExtractedProduct } from '../components/OCRScanner';
import type { Product } from '../types';

interface ScannerProps {
  onProductScanned: (product: Product) => void;
  onClose: () => void;
}

export function Scanner({ onProductScanned, onClose }: ScannerProps) {
  const [scannedProducts, setScannedProducts] = useState<ExtractedProduct[]>([]);

  const handleScanComplete = (result: OCRResult) => {
    console.log('Scan complete:', result);
  };

  const handleProductDetected = (product: ExtractedProduct) => {
    console.log('Produto detectado:', product.mainPrice);
  };

  const handleProductAdded = (product: ExtractedProduct) => {
    const atacadoPrice = product.prices.find(p => p.type === 'atacado');
    const varejoPrice = product.prices.find(p => p.type === 'varejo' || p.type === 'outro');
    const creditoPrice = product.prices.find(p => p.type === 'credito');

    const precoAvulso = varejoPrice?.value || product.mainPrice;
    const precoAtacado = atacadoPrice?.value || 0;
    const precoCartao = creditoPrice?.value || 0;

    setScannedProducts(prev => [...prev, product]);

    const newProduct: Product = {
      id: `ocr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      precoAvulso: precoAvulso,
      precoCartao: precoCartao,
      precoAtacado: precoAtacado,
      quantity: 1,
      timestamp: product.timestamp
    };

    onProductScanned(newProduct);

    toast.success(`R$ ${precoAvulso.toFixed(2)} adicionado`, {
      duration: 1500
    });
  };

  const handleError = (error: string) => {
    console.error('Erro no scanner:', error);
  };

  const handleClose = () => {
    if (scannedProducts.length > 0) {
      toast.success(`${scannedProducts.length} produto(s) escaneado(s)`, {
        description: `Total: R$ ${scannedProducts.reduce((sum, p) => sum + p.mainPrice, 0).toFixed(2)}`
      });
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[1050]"
    >
      <OCRScanner
        onScanComplete={handleScanComplete}
        onProductDetected={handleProductDetected}
        onProductAdded={handleProductAdded}
        onError={handleError}
        onClose={handleClose}
        scannedProducts={scannedProducts}
      />
    </motion.div>
  );
}
