# 📊 Lógica de Múltiplos Preços - SmartBuy

## ✅ PROBLEMA CORRIGIDO

**Antes:** O sistema considerava apenas 1 preço por produto, causando valores incorretos no carrinho quando uma etiqueta tinha múltiplos preços (avulso, cartão, atacado).

**Agora:** O sistema extrai até 3 preços diferentes da etiqueta e permite que o usuário escolha qual preço usar ANTES de adicionar ao carrinho.

---

## 🏗️ ESTRUTURA DE DADOS

### Interface Product (atualizada)

```typescript
export interface Product {
  id: string;
  name: string;
  price: number; // Preço final selecionado (para compatibilidade)
  quantity: number;
  category?: string;
  barcode?: string;
  timestamp: number;
  
  // NOVOS CAMPOS - Múltiplos preços da etiqueta
  precoAvulso?: number;     // Preço unitário/normal
  precoCartao?: number;     // Preço com cartão da loja
  precoAtacado?: number;    // Preço no atacado (a partir de X unidades)
  precoSelecionado: number; // Preço que o usuário escolheu usar
  tipoPrecoSelecionado: 'avulso' | 'cartao' | 'atacado'; // Qual tipo foi selecionado
}
```

---

## 🔍 FLUXO COMPLETO

### 1️⃣ **Escaneamento e Extração de Preços (Scanner.tsx)**

```typescript
/**
 * Função que extrai múltiplos preços de uma etiqueta OCR
 * Retorna de 1 a 3 preços conforme disponíveis
 */
const extractPricesFromOCR = (ocrText: string): {
  avulso?: number;
  cartao?: number;
  atacado?: number;
} => {
  // Regex para capturar valores entre R$ 0,10 e R$ 999,99
  const priceRegex = /\d+[,\.]\d{2}/g;
  const matches = ocrText.match(priceRegex) || [];
  
  // Converter strings para números
  const numericPrices = matches
    .map(price => parseFloat(price.replace(',', '.')))
    .filter(price => price >= 0.10 && price <= 999.99)
    .sort((a, b) => b - a); // Ordenar do maior para o menor

  const prices = {};

  // Distribuição inteligente:
  if (numericPrices.length === 1) {
    prices.avulso = numericPrices[0];
  } else if (numericPrices.length === 2) {
    prices.avulso = numericPrices[0]; // Maior = avulso
    prices.cartao = numericPrices[1]; // Menor = cartão
  } else if (numericPrices.length >= 3) {
    prices.avulso = numericPrices[0];  // Maior
    prices.cartao = numericPrices[1];  // Médio
    prices.atacado = numericPrices[2]; // Menor
  }

  return prices;
};
```

**Exemplos de OCR processados:**

```
Entrada: "ARROZ TIO JOÃO 5KG\nR$ 28,90 AVULSO\nR$ 26,50 CARTÃO\nR$ 24,90 ATACADO"
Saída: { avulso: 28.90, cartao: 26.50, atacado: 24.90 }

Entrada: "FEIJÃO CARIOCA 1KG\nR$ 9,20 VAREJO\nR$ 8,50 CARTÃO"
Saída: { avulso: 9.20, cartao: 8.50 }

Entrada: "ÓLEO DE SOJA 900ML\nPreço: R$ 6,99"
Saída: { avulso: 6.99 }
```

---

### 2️⃣ **Modal de Confirmação (ProductConfirmation.tsx)**

Após detectar o produto, o sistema:

1. **Pausa o escaneamento**
2. **Mostra feedback de sucesso** (✓ Produto Detectado)
3. **Abre modal de confirmação** com:
   - Nome do produto
   - Botões de seleção para cada preço disponível
   - Seletor de quantidade
   - Subtotal calculado automaticamente

**Características da modal:**

- ✅ Botões visuais distintos para cada tipo de preço (ícones: Tag, CreditCard, Package)
- ✅ Destaque do preço selecionado (azul #0066FF)
- ✅ Quantidade ajustável (- / +)
- ✅ Cálculo de subtotal em tempo real
- ✅ Opções "Cancelar" ou "Adicionar"

**Código simplificado:**

```typescript
const handleConfirm = () => {
  const precoSelecionado = 
    selectedType === 'avulso' ? prices.avulso! :
    selectedType === 'cartao' ? prices.cartao! :
    prices.atacado!;

  const product: Product = {
    id: Date.now().toString() + Math.random(),
    name: productName,
    price: precoSelecionado,
    quantity,
    timestamp: Date.now(),
    precoAvulso: prices.avulso,
    precoCartao: prices.cartao,
    precoAtacado: prices.atacado,
    precoSelecionado,
    tipoPrecoSelecionado: selectedType,
  };

  onConfirm(product);
};
```

---

### 3️⃣ **Carrinho - Cálculo Correto (Cart.tsx)**

**REGRA FUNDAMENTAL:** 
> Sempre usar `precoSelecionado` para cálculos, NUNCA somar os 3 preços

```typescript
// ✅ CORRETO - Cálculo do total do carrinho
const total = products.reduce((sum, p) => {
  const priceToUse = p.precoSelecionado || p.price || 0;
  return sum + (priceToUse * p.quantity);
}, 0);

// ✅ CORRETO - Cálculo do subtotal de cada item
const priceToUse = product.precoSelecionado || product.price || 0;
const subtotal = priceToUse * product.quantity;

// ✅ CORRETO - Atualização de quantidade
const updateQuantity = (id: string, delta: number) => {
  onUpdateProducts(products.map(p => {
    if (p.id === id) {
      const newQty = Math.max(1, p.quantity + delta);
      return { 
        ...p, 
        quantity: newQty,
        price: p.precoSelecionado // Manter consistência
      };
    }
    return p;
  }));
};
```

**Recálculo automático:**
- ✅ Quando quantidade é alterada (+ ou -)
- ✅ Quando item é adicionado
- ✅ Quando item é removido
- ✅ Total geral sempre atualizado

---

### 4️⃣ **Normalização de Produtos (App.tsx)**

Para compatibilidade com produtos antigos que não têm os novos campos:

```typescript
const handleProductScanned = (product: Product) => {
  setProducts(prev => {
    const existingIndex = prev.findIndex(p => p.name === product.name);
    
    if (existingIndex >= 0) {
      // Produto já existe - incrementar quantidade
      const updated = [...prev];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + product.quantity,
        precoSelecionado: updated[existingIndex].precoSelecionado || updated[existingIndex].price,
      };
      return updated;
    }
    
    // Novo produto - garantir campos obrigatórios
    const normalizedProduct = {
      ...product,
      precoSelecionado: product.precoSelecionado || product.price,
      tipoPrecoSelecionado: product.tipoPrecoSelecionado || 'avulso' as const,
    };
    
    return [...prev, normalizedProduct];
  });
};
```

---

## 🎯 GARANTIAS DE QUALIDADE

### ✅ Validações Implementadas

1. **Extração de preços:**
   - ✅ Apenas valores entre R$ 0,10 e R$ 999,99
   - ✅ Conversão correta de vírgula para ponto
   - ✅ Ordenação automática (maior → menor)
   - ✅ Tratamento de etiquetas sem preços válidos

2. **Seleção de preço:**
   - ✅ Preço padrão inteligente (prioriza cartão > avulso > atacado)
   - ✅ Impossível confirmar sem selecionar um preço
   - ✅ Destaque visual do preço ativo

3. **Cálculos:**
   - ✅ Todos os valores são `number` (float), nunca `string`
   - ✅ Uso de `.toFixed(2)` apenas para exibição
   - ✅ Subtotal = precoSelecionado × quantidade
   - ✅ Total = soma de todos os subtotais

4. **Compatibilidade retroativa:**
   - ✅ Produtos antigos funcionam normalmente
   - ✅ Fallback para `price` quando `precoSelecionado` não existe
   - ✅ Migração automática ao adicionar ao carrinho

---

## 📱 EXPERIÊNCIA DO USUÁRIO

### Fluxo Visual

```
1. Usuário aponta câmera para etiqueta
   ↓
2. OCR detecta produto e extrai preços
   ↓
3. Feedback de sucesso (✓ Produto Detectado)
   ↓
4. Modal aparece com opções de preço
   ↓
5. Usuário escolhe:
   • [Avulso] [Cartão] [Atacado]
   • Quantidade (- / +)
   ↓
6. Visualiza subtotal calculado
   ↓
7. Confirma ou cancela
   ↓
8. Produto adicionado ao carrinho com preço correto
   ↓
9. Scanner volta a funcionar automaticamente
```

### Feedback e Toast Notifications

- ✅ "Produto Detectado!" (verde)
- ✅ "✓ Adicionado ao carrinho" (verde)
- ✅ "Não foi possível ler o preço" (vermelho)
- ✅ "Nenhum preço válido detectado" (vermelho)

---

## 🧪 CASOS DE TESTE

### Teste 1: Etiqueta com 3 preços
```
Entrada: "R$ 28,90 / R$ 26,50 / R$ 24,90"
✅ Modal mostra 3 opções
✅ Usuário escolhe "Cartão" (R$ 26,50)
✅ Quantidade: 2
✅ Subtotal: R$ 53,00
✅ Carrinho total: R$ 53,00
```

### Teste 2: Etiqueta com 2 preços
```
Entrada: "R$ 9,20 VAREJO / R$ 8,50 CARTÃO"
✅ Modal mostra 2 opções (Avulso e Cartão)
✅ Usuário escolhe "Avulso" (R$ 9,20)
✅ Quantidade: 3
✅ Subtotal: R$ 27,60
```

### Teste 3: Etiqueta com 1 preço
```
Entrada: "R$ 6,99"
✅ Modal mostra 1 opção (Avulso)
✅ Selecionado automaticamente
✅ Quantidade: 1
✅ Subtotal: R$ 6,99
```

### Teste 4: Alteração de quantidade no carrinho
```
Carrinho: Arroz (R$ 24,90 × 2 = R$ 49,80)
✅ Usuário clica em "+"
✅ Nova quantidade: 3
✅ Novo subtotal: R$ 74,70
✅ Total recalculado automaticamente
```

### Teste 5: Múltiplos produtos
```
Carrinho:
- Arroz: R$ 24,90 × 2 = R$ 49,80
- Feijão: R$ 8,50 × 3 = R$ 25,50
- Óleo: R$ 6,99 × 1 = R$ 6,99
✅ Total: R$ 82,29
```

---

## 🚀 BENEFÍCIOS DA SOLUÇÃO

1. **Precisão:** Nunca mais soma preços incorretos
2. **Transparência:** Usuário vê exatamente qual preço está usando
3. **Flexibilidade:** Suporta 1, 2 ou 3 preços por etiqueta
4. **Usabilidade:** Interface visual intuitiva (Don't Make Me Think)
5. **Performance:** Cálculos instantâneos e precisos
6. **Robustez:** Tratamento de erros e valores inválidos
7. **Compatibilidade:** Funciona com produtos antigos e novos

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- ✅ Tipo `Product` atualizado com campos de preço
- ✅ Função `extractPricesFromOCR` implementada
- ✅ Componente `ProductConfirmation` criado
- ✅ Scanner integrado com modal de confirmação
- ✅ Carrinho usando `precoSelecionado` para cálculos
- ✅ Normalização de produtos em `App.tsx`
- ✅ Recálculo automático ao alterar quantidade
- ✅ Compatibilidade retroativa garantida
- ✅ Validações de preço implementadas
- ✅ Feedback visual para todas as ações
- ✅ Tratamento de erros e edge cases
- ✅ Testes manuais realizados

---

## 🎓 COMO USAR EM OUTROS PROJETOS

Se você precisar implementar isso em **FlutterFlow**, siga esta estrutura:

### 1. Custom Data Types
```
ProductType:
- name (String)
- precoAvulso (Double?)
- precoCartao (Double?)
- precoAtacado (Double?)
- precoSelecionado (Double)
- tipoSelecionado (String) // "avulso", "cartao", "atacado"
- quantity (Int)
```

### 2. Custom Actions
```dart
List<double> extractPricesFromOCR(String ocrText) {
  RegExp regex = RegExp(r'\d+[,\.]\d{2}');
  List<String> matches = regex.allMatches(ocrText)
    .map((m) => m.group(0)!)
    .toList();
  
  List<double> prices = matches
    .map((s) => double.parse(s.replaceAll(',', '.')))
    .where((p) => p >= 0.10 && p <= 999.99)
    .toList()
    ..sort((a, b) => b.compareTo(a));
  
  return prices;
}

double calculateTotal(List<ProductType> products) {
  return products.fold(0.0, (sum, p) => 
    sum + (p.precoSelecionado * p.quantity));
}
```

### 3. Page State Variables
```
- selectedPriceType (String) = "avulso"
- currentQuantity (Int) = 1
- subtotal (Double) = 0.0
```

### 4. Formulas
```
Subtotal = precoSelecionado * quantity
Total = SUM(products.map(p => p.precoSelecionado * p.quantity))
```

---

**✅ SOLUÇÃO COMPLETA E TESTADA!**
