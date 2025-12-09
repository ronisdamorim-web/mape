import type { Product } from '../types';

/**
 * Interface para os 3 totais do carrinho
 */
export interface CartTotals {
  totalAvulso: number;
  totalCartao: number;
  totalAtacado: number;
}

/**
 * Calcula os 3 totais do carrinho (Avulso, Cartão, Atacado)
 * 
 * Regra:
 * - totalAvulso = Σ(precoAvulso × quantidade)
 * - totalCartao = Σ(precoCartao × quantidade)
 * - totalAtacado = Σ(precoAtacado × quantidade)
 */
export function calculateCartTotals(products: Product[]): CartTotals {
  return products.reduce(
    (totals, product) => ({
      totalAvulso: totals.totalAvulso + (product.precoAvulso * product.quantity),
      totalCartao: totals.totalCartao + (product.precoCartao * product.quantity),
      totalAtacado: totals.totalAtacado + (product.precoAtacado * product.quantity),
    }),
    { totalAvulso: 0, totalCartao: 0, totalAtacado: 0 }
  );
}

/**
 * Extrai até 3 preços de um texto OCR
 * 
 * Regras:
 * - 1 valor encontrado → precoAvulso
 * - 2 valores encontrados → precoAvulso + precoCartao
 * - 3+ valores encontrados → precoAvulso + precoCartao + precoAtacado
 * 
 * @param ocrText - Texto bruto do OCR
 * @returns Objeto com os 3 preços (0 se não existir)
 */
export function extractPricesFromOCR(ocrText: string): {
  precoAvulso: number;
  precoCartao: number;
  precoAtacado: number;
} {
  // Regex para capturar valores entre R$ 0,10 e R$ 999,99
  const priceRegex = /\d+[,\.]\d{2}/g;
  const matches = ocrText.match(priceRegex) || [];
  
  // Converter strings para números e filtrar valores válidos
  const numericPrices = matches
    .map(price => parseFloat(price.replace(',', '.')))
    .filter(price => price >= 0.10 && price <= 999.99)
    .sort((a, b) => b - a); // Ordenar do maior para o menor

  // Distribuir preços conforme quantidade encontrada
  const prices = {
    precoAvulso: 0,
    precoCartao: 0,
    precoAtacado: 0,
  };

  if (numericPrices.length === 1) {
    // Apenas 1 preço → Avulso
    prices.precoAvulso = numericPrices[0];
    prices.precoCartao = 0;
    prices.precoAtacado = 0;
  } else if (numericPrices.length === 2) {
    // 2 preços → Avulso + Cartão
    prices.precoAvulso = numericPrices[0]; // Maior
    prices.precoCartao = numericPrices[1]; // Menor
    prices.precoAtacado = 0;
  } else if (numericPrices.length >= 3) {
    // 3+ preços → Todos
    prices.precoAvulso = numericPrices[0]; // Maior
    prices.precoCartao = numericPrices[1]; // Médio
    prices.precoAtacado = numericPrices[2]; // Menor
  }

  return prices;
}

/**
 * Formata valor para moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Calcula economia entre dois valores
 */
export function calculateSavings(cheaperPrice: number, expensivePrice: number): number {
  return Math.max(0, expensivePrice - cheaperPrice);
}
