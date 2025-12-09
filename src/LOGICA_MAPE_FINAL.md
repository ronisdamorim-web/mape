# 📱 SmartBuy - Lógica Completa e Definitiva

## ✅ IMPLEMENTAÇÃO FINAL CONFORME ESPECIFICAÇÕES

Este documento detalha a lógica 100% implementada do SmartBuy seguindo as regras fornecidas.

---

## 📊 1. ESTRUTURA DE DADOS

### Product (Interface Principal)

```typescript
export interface Product {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  barcode?: string;
  timestamp: number;
  
  // SEMPRE 3 preços (0 se não existir na etiqueta)
  precoAvulso: number;    // Preço unitário/normal
  precoCartao: number;    // Preço com cartão fidelidade
  precoAtacado: number;   // Preço com compra mínima
}
```

**Regras:**
- ✅ SEMPRE tem os 3 campos de preço
- ✅ Se a etiqueta não tem um preço específico, o valor é `0`
- ✅ Não há campo `precoSelecionado` - o sistema mantém os 3 simultaneamente

---

## 🔍 2. LEITURA DE ETIQUETAS (OCR)

### Função: `extractPricesFromOCR(ocrText: string)`

**Localização:** `/utils/calculations.ts`

```typescript
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

  const prices = {
    precoAvulso: 0,
    precoCartao: 0,
    precoAtacado: 0,
  };

  if (numericPrices.length === 1) {
    // Apenas 1 preço → Avulso
    prices.precoAvulso = numericPrices[0];
  } else if (numericPrices.length === 2) {
    // 2 preços → Avulso + Cartão
    prices.precoAvulso = numericPrices[0]; // Maior
    prices.precoCartao = numericPrices[1]; // Menor
  } else if (numericPrices.length >= 3) {
    // 3+ preços → Todos
    prices.precoAvulso = numericPrices[0]; // Maior
    prices.precoCartao = numericPrices[1]; // Médio
    prices.precoAtacado = numericPrices[2]; // Menor
  }

  return prices;
}
```

### Fluxo no Scanner

**Arquivo:** `/components/Scanner.tsx`

```
1. OCR lê texto da etiqueta
   ↓
2. extractPricesFromOCR() extrai os 3 preços
   ↓
3. Cria objeto Product com os 3 preços
   ↓
4. Adiciona DIRETO ao carrinho (sem modal)
   ↓
5. Toast de sucesso
   ↓
6. Scanner volta a funcionar automaticamente
```

**SEM MODAL DE CONFIRMAÇÃO** - Produto adicionado automaticamente após detecção.

---

## 🛒 3. CARRINHO - 3 TOTAIS SIMULTÂNEOS

### Função: `calculateCartTotals(products: Product[])`

**Localização:** `/utils/calculations.ts`

```typescript
export interface CartTotals {
  totalAvulso: number;
  totalCartao: number;
  totalAtacado: number;
}

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
```

### Fórmulas de Cálculo

```
totalAvulso = Σ(precoAvulso × quantidade)
totalCartao = Σ(precoCartao × quantidade)
totalAtacado = Σ(precoAtacado × quantidade)
```

### Recálculo Automático

Os totais são recalculados automaticamente quando:
- ✅ Produto é adicionado
- ✅ Produto é removido
- ✅ Quantidade é alterada (+ ou -)

### Exibição no Carrinho

**Arquivo:** `/components/Cart.tsx`

```tsx
// No footer do carrinho
<div className="space-y-2.5">
  {/* Total Avulso */}
  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3">
    <Tag icon /> Avulso - R$ {totalAvulso.toFixed(2)}
  </div>

  {/* Total Cartão */}
  {totalCartao > 0 && (
    <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3">
      <CreditCard icon /> Cartão - R$ {totalCartao.toFixed(2)}
    </div>
  )}

  {/* Total Atacado */}
  {totalAtacado > 0 && (
    <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-3">
      <Package icon /> Atacado - R$ {totalAtacado.toFixed(2)}
    </div>
  )}
</div>
```

**Visual:**
- 🟩 **Verde** = Total Avulso (sempre visível)
- 🟦 **Azul** = Total Cartão (só aparece se > 0)
- 🟧 **Laranja** = Total Atacado (só aparece se > 0)

**Propósito:** Usuário compara esses valores com o cupom fiscal no caixa.

---

## 📋 4. COMPARAÇÃO DE MERCADOS

### Regra Principal

> **A comparação SEMPRE usa a lista atual do carrinho do usuário.**

### Lógica de Comparação

**Arquivo:** `/components/Compare.tsx`

```typescript
// Para cada mercado:
const totalMercado = products.reduce((sum, product) => {
  // Buscar preço do produto naquele mercado específico
  const precoNoMercado = getPriceInMarket(product.name, marketId);
  return sum + (precoNoMercado * product.quantity);
}, 0);
```

### Mock de Preços por Mercado

```typescript
const marketPrices = {
  'carrefour': {
    'Arroz Tio João 5kg': 26.90,
    'Feijão Carioca 1kg': 8.99,
    // ... demais produtos
  },
  'extra': {
    'Arroz Tio João 5kg': 28.50,
    'Feijão Carioca 1kg': 9.20,
    // ... demais produtos
  },
  // ... demais mercados
};
```

### Cálculo de Economia

```typescript
const mostExpensiveMarket = Math.max(...markets.map(m => m.totalPrice));
const savings = mostExpensiveMarket - market.totalPrice;
```

### Ordenação dos Resultados

```
1º → Mercado mais barato (tag verde "Melhor custo-benefício")
2º → Segundo mais barato
3º → Terceiro mais barato
...
```

### Card de Mercado

```tsx
<div className="bg-white rounded-2xl p-5">
  <h3>Carrefour Guarulhos</h3>
  <p>Com sua lista de 7 itens</p>
  <p className="text-3xl font-bold text-[#10B981]">R$ 82,40</p>
  <p>Economia: R$ 12,50 vs. mercado mais caro</p>
  <p>📍 2,5 km • ⏱️ ~8 min</p>
  <small>Baseado em 1.247 contribuições da comunidade</small>
</div>
```

### Fluxo de Uso

```
1. Usuário monta carrinho com produtos
   ↓
2. Clica em "Comparar Mercados"
   ↓
3. Sistema calcula total da MESMA lista em cada mercado
   ↓
4. Ordena do mais barato ao mais caro
   ↓
5. Exibe cards com totais, economia, distância
```

---

## 🎨 5. UX E DESIGN

### Princípios Fundamentais

✅ **Don't Make Me Think**
- Nada de modais desnecessários
- Nada de perguntas confusas
- Fluxo óbvio e direto

✅ **Automação Máxima**
- Scanner adiciona produto automaticamente
- Totais recalculados automaticamente
- Comparação usa lista atual automaticamente

✅ **Feedback Visual Claro**
- Toast de sucesso ao adicionar
- 3 totais com cores distintas
- Mercado mais barato destacado em verde

### Cores do Design System

```css
Azul Principal: #0066FF
Verde Sucesso: #10B981
Vermelho Erro: #EF4444
Laranja Atacado: #F97316
Cinza Texto: #111827
Cinza Secundário: #6B7280
Background: #F9FAFB
```

### Tipografia

```css
Font: Inter
Títulos: font-bold
Subtítulos: font-semibold
Corpo: font-normal
```

### Interações

```css
Botões: rounded-2xl, whileTap={{ scale: 0.98 }}
Cards: rounded-2xl, hover:scale-1.005
Ícones: 24px (w-6 h-6)
Bordas: 8px
Animações: 0.2s
```

---

## 📱 6. FLUXOS COMPLETOS

### Fluxo 1: Escanear e Adicionar Produto

```
1. Usuário clica em "Escanear" na Home
   ↓
2. Scanner abre (tela preta com frame azul)
   ↓
3. OCR detecta etiqueta (2,5s automático)
   ↓
4. extractPricesFromOCR() extrai até 3 preços
   ↓
5. Feedback verde "✓ Produto Detectado"
   ↓
6. Produto adicionado direto ao carrinho
   ↓
7. Toast "✓ Arroz Tio João adicionado"
   ↓
8. Scanner volta a escanear automaticamente
```

**Tempo total:** ~4 segundos por produto

### Fluxo 2: Ver Carrinho e Totais

```
1. Usuário navega para "Carrinho"
   ↓
2. Vê lista de produtos escaneados
   ↓
3. Pode ajustar quantidade (+ ou -)
   ↓
4. Pode remover itens (swipe left)
   ↓
5. Footer mostra os 3 totais:
   - 🟩 Total Avulso: R$ 125,40
   - 🟦 Total Cartão: R$ 118,20
   - 🟧 Total Atacado: R$ 112,80
   ↓
6. Usuário compara com cupom fiscal
```

### Fluxo 3: Comparar Mercados

```
1. Usuário tem 7 produtos no carrinho
   ↓
2. Clica em "Comparar Mercados"
   ↓
3. Sistema calcula total EM CADA MERCADO usando:
   - Mesma lista de 7 produtos
   - Preços daquele mercado específico
   ↓
4. Ordena resultados (mais barato → mais caro)
   ↓
5. Exibe:
   - Carrefour: R$ 82,40 (Melhor) 🟢
   - Extra: R$ 87,90
   - Pão de Açúcar: R$ 94,90
   ↓
6. Usuário escolhe onde comprar
```

### Fluxo 4: Fechar Compra

```
1. Usuário clica em "Fechar Compra"
   ↓
2. Modal "Salvar como Lista Recorrente?"
   ↓
3a. Se SIM:
    - Digita nome da lista
    - Lista salva SEM preços (preços mudam)
    - Pode reutilizar depois
   ↓
3b. Se NÃO:
    - Apenas finaliza compra
   ↓
4. Carrinho é limpo
   ↓
5. Compra salva no histórico
```

---

## 🧮 7. FUNÇÕES PRINCIPAIS

### /utils/calculations.ts

```typescript
// 1. Extrair preços do OCR
extractPricesFromOCR(ocrText: string): {
  precoAvulso, precoCartao, precoAtacado
}

// 2. Calcular 3 totais do carrinho
calculateCartTotals(products: Product[]): {
  totalAvulso, totalCartao, totalAtacado
}

// 3. Formatar moeda
formatCurrency(value: number): string
// Retorna: "R$ 125,40"

// 4. Calcular economia
calculateSavings(cheaper: number, expensive: number): number
// Retorna: diferença em R$
```

### /components/Scanner.tsx

```typescript
// 1. Scanner automático
performAutoScan(): void
// - Lê etiqueta
// - Extrai preços
// - Cria Product
// - Adiciona ao carrinho DIRETO

// 2. Retry em caso de erro
retryScanning(): void
```

### /components/Cart.tsx

```typescript
// 1. Atualizar quantidade
updateQuantity(id: string, delta: number): void
// - Incrementa ou decrementa
// - Mínimo de 1
// - Recalcula totais automaticamente

// 2. Deletar produto
deleteProduct(id: string): void
// - Remove do array
// - Recalcula totais automaticamente

// 3. Finalizar compra
onFinalizePurchase(): void
// - Salva no histórico
// - Abre modal de lista recorrente
// - Limpa carrinho
```

### /components/Compare.tsx

```typescript
// 1. Calcular total em cada mercado
calculateMarketTotal(products: Product[], marketId: string): number
// - Itera sobre produtos do carrinho
// - Busca preço de cada produto naquele mercado
// - Soma total

// 2. Ordenar mercados
sortMarketsByPrice(markets: MarketComparison[]): MarketComparison[]
// - Do mais barato ao mais caro
```

---

## 🔄 8. ESTADOS E VARIÁVEIS

### App.tsx (Estado Global)

```typescript
const [products, setProducts] = useState<Product[]>([]);
// Carrinho atual

const [currentScreen, setCurrentScreen] = useState<Screen>('home');
// Tela ativa

const [showScanner, setShowScanner] = useState(false);
// Scanner aberto/fechado

const [pendingPurchaseProducts, setPendingPurchaseProducts] = useState<Product[]>([]);
// Produtos antes de salvar como lista
```

### Cart.tsx (Estado Local)

```typescript
const [itemToDelete, setItemToDelete] = useState<string | null>(null);
// Item sendo confirmado para exclusão

const { totalAvulso, totalCartao, totalAtacado } = calculateCartTotals(products);
// 3 totais calculados dinamicamente
```

### Scanner.tsx (Estado Local)

```typescript
const [isScanning, setIsScanning] = useState(true);
// Está escaneando ou não

const [showSuccess, setShowSuccess] = useState(false);
// Feedback de sucesso

const [showError, setShowError] = useState(false);
// Feedback de erro

const [detectedProductName, setDetectedProductName] = useState<string>('');
// Nome do produto detectado
```

---

## 💾 9. PERSISTÊNCIA (LocalStorage)

### Chaves Utilizadas

```typescript
// Carrinho atual
'smartbuy_cart' → Product[]

// Histórico de compras
'smartbuy_history' → ShoppingList[]

// Listas recorrentes
'smartbuy_saved_lists' → SavedList[]
```

### Salvamento Automático

```typescript
// Carrinho salvo a cada mudança
useEffect(() => {
  localStorage.setItem('smartbuy_cart', JSON.stringify(products));
}, [products]);

// Carrinho carregado ao iniciar
useEffect(() => {
  const stored = localStorage.getItem('smartbuy_cart');
  if (stored) setProducts(JSON.parse(stored));
}, []);
```

---

## ✅ 10. CHECKLIST DE IMPLEMENTAÇÃO

### Estrutura de Dados
- [x] Product com 3 campos de preço
- [x] CartTotals interface
- [x] MarketComparison interface

### Funções Utilitárias
- [x] extractPricesFromOCR (1, 2 ou 3 preços)
- [x] calculateCartTotals (3 totais simultâneos)
- [x] formatCurrency
- [x] calculateSavings

### Scanner
- [x] Leitura automática de etiquetas
- [x] Extração de até 3 preços
- [x] Adição DIRETA ao carrinho (sem modal)
- [x] Feedback visual de sucesso/erro
- [x] Retry automático

### Carrinho
- [x] Exibição de produtos
- [x] Ajuste de quantidade (+ / -)
- [x] Remoção de itens (swipe to delete)
- [x] 3 totais simultâneos no footer
- [x] Cores distintas (verde, azul, laranja)
- [x] Recálculo automático
- [x] Botão "Fechar Compra"

### Comparação de Mercados
- [x] Usa lista atual do carrinho
- [x] Calcula total em cada mercado
- [x] Ordena do mais barato ao mais caro
- [x] Exibe economia vs. mais caro
- [x] Mostra distância e tempo estimado
- [x] Destaque no mais barato

### UX e Feedback
- [x] Toast notifications
- [x] Animações suaves (0.2s)
- [x] Design mobile-first
- [x] Cores do Design System (#0066FF, #10B981, etc.)
- [x] Ícones Lucide 24px
- [x] Bordas rounded-2xl (8px)
- [x] Don't Make Me Think aplicado

### Persistência
- [x] LocalStorage para carrinho
- [x] LocalStorage para histórico
- [x] LocalStorage para listas salvas
- [x] Salvamento automático

---

## 🚀 11. PRÓXIMOS PASSOS (SUPABASE)

Para transformar em app com sincronização:

### 1. Tabelas Supabase

```sql
-- Produtos no carrinho
CREATE TABLE cart_products (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  quantity INTEGER,
  preco_avulso DECIMAL(10,2),
  preco_cartao DECIMAL(10,2),
  preco_atacado DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Histórico de compras
CREATE TABLE shopping_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  products JSONB,
  total_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Listas recorrentes
CREATE TABLE saved_lists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  items JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Preços colaborativos por mercado
CREATE TABLE market_prices (
  id UUID PRIMARY KEY,
  market_id UUID,
  product_name TEXT,
  price DECIMAL(10,2),
  contributed_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Real-time Sync

```typescript
// Subscribe ao carrinho
supabase
  .from('cart_products')
  .on('*', payload => {
    setProducts(payload.new);
  })
  .subscribe();
```

### 3. Contribuição Colaborativa

```typescript
// Usuário contribui com preço
async function contributePrice(marketId, productName, price) {
  await supabase.from('market_prices').insert({
    market_id: marketId,
    product_name: productName,
    price: price,
    contributed_by: user.id,
  });
}
```

---

## 📊 12. EXEMPLO COMPLETO

### Situação Real

**Usuário:** Maria
**Local:** Supermercado Extra

**1. Maria escaneia produtos:**
```
Scanner detecta:
- Arroz Tio João 5kg
  OCR: "R$ 28,90 / R$ 26,50 CARTÃO / R$ 24,90 ATACADO"
  Resultado:
    precoAvulso: 28.90
    precoCartao: 26.50
    precoAtacado: 24.90

- Feijão Carioca 1kg
  OCR: "R$ 9,20 VAREJO / R$ 8,50 CARTÃO"
  Resultado:
    precoAvulso: 9.20
    precoCartao: 8.50
    precoAtacado: 0

- Óleo de Soja 900ml
  OCR: "R$ 6,99"
  Resultado:
    precoAvulso: 6.99
    precoCartao: 0
    precoAtacado: 0
```

**2. Carrinho de Maria:**
```
Produtos:
1. Arroz Tio João 5kg (2x)
2. Feijão Carioca 1kg (3x)
3. Óleo de Soja 900ml (1x)

Totais:
🟩 Total Avulso:   R$ 92,39
   (28,90×2 + 9,20×3 + 6,99×1)

🟦 Total Cartão:   R$ 85,49
   (26,50×2 + 8,50×3 + 0×1 + 6,99)

🟧 Total Atacado:  R$ 56,79
   (24,90×2 + 0×3 + 0×1)
```

**3. Maria compara mercados:**
```
Sistema calcula mesma lista em outros mercados:

Carrefour:  R$ 85,20 ✅ Melhor
Extra:      R$ 92,39 (atual)
PdA:        R$ 98,50

Economia possível: R$ 7,19 no Carrefour
```

**4. Maria decide:**
- Opção 1: Continuar no Extra (mais perto)
- Opção 2: Ir ao Carrefour (economizar R$ 7,19)

---

## 🎯 CONCLUSÃO

✅ **Sistema 100% implementado**
✅ **Lógica correta conforme especificações**
✅ **UX simples e direta (Don't Make Me Think)**
✅ **3 totais simultâneos funcionando**
✅ **Comparação usa lista atual**
✅ **Nenhum modal desnecessário**
✅ **Automação máxima**

**O SmartBuy está pronto para uso como MVP frontend!**

Para produção, integrar com Supabase para:
- Sincronização entre dispositivos
- Base colaborativa de preços
- Histórico persistente na nuvem
- Comparação com dados reais
