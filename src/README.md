# 🛒 Mape - Aplicativo de Compras Inteligente

## 📱 Arquitetura do App (Simplificada)

O Mape foi completamente reconstruído seguindo os princípios **"Don't Make Me Think"** e as **Heurísticas de Nielsen**, com foco em simplicidade, clareza e fluxo lógico de uso.

---

## 🎯 4 Menus Principais

### 1. **Início (Home)**
- Botão grande destaque: **"Iniciar Escaneamento"** (OCR)
- Ações rápidas abaixo:
  - **Comparar Mercados**
  - **Histórico de Compras**
- Status do carrinho atual (se houver itens)

### 2. **Carrinho**
- Lista de itens capturados via OCR
- Controles de quantidade (+/-)
- **Swipe to delete** (arraste para remover)
- Confirmação antes de deletar
- Total da compra sempre visível no rodapé
- Botão **"Fechar Compra"** → Salva automaticamente no histórico

### 3. **Listas**
- Listas de compras recorrentes
- Criar nova lista
- Adicionar/remover itens manualmente
- **Botão "Usar esta lista"** → Envia todos os itens direto pro carrinho
- Excluir lista

### 4. **Configurações**
- Perfil do usuário
- Notificações
- Privacidade
- Ajuda
- Sobre / Versão
- Sair da conta

---

## 🔥 Fluxo Completo do App

### **1. INÍCIO → ESCANEAR → CARRINHO**
```
Usuário abre o app
  ↓
Clica em "Iniciar Escaneamento"
  ↓
Scanner OCR automático detecta preços
  ↓
Produto adicionado ao carrinho
  ↓
Feedback visual de sucesso
  ↓
Continua escaneando automaticamente
```

### **2. CARRINHO → FECHAR COMPRA**
```
Visualizar todos os itens
  ↓
Editar quantidades
  ↓
Remover itens (swipe ou botão)
  ↓
Ver total em tempo real
  ↓
Clicar em "Fechar Compra"
  ↓
Salva automaticamente no Histórico
  ↓
Cria automaticamente uma Lista Salva
```

### **3. HISTÓRICO**
```
Ver compras passadas
  ↓
Data, hora e valor total
  ↓
Comparação com compra anterior
  ↓
Indicador visual: "compensa / não compensa"
```

### **4. COMPARAR MERCADOS**
```
Mostrar mercados próximos
  ↓
Preço estimado do carrinho
  ↓
Economia potencial
  ↓
Ranking da comunidade integrado
  ↓
Precisão e contribuições
  ↓
Ver rota / Ver detalhes
```

### **5. LISTAS SALVAS**
```
Criar lista de produtos recorrentes
  ↓
Adicionar itens manualmente
  ↓
Clicar em "Usar Lista"
  ↓
Todos os itens vão para o carrinho
  ↓
Usuário pode editar e fechar compra
```

---

## ✅ O que foi REMOVIDO (simplificação)

- ❌ **Favoritos** (menu separado) - Não faz sentido no fluxo principal
- ❌ **Rede Colaborativa** (menu separado) - Agora integrado em "Comparar Mercados"
- ❌ **Cards decorativos sem propósito**
- ❌ **Botões duplicados em locais aleatórios**
- ❌ **Telas sem função clara**

---

## 🎨 Design System Aplicado

### **Cores Principais**
- **Primary:** #0066FF (Azul profissional)
- **Success:** #10B981 (Verde)
- **Error:** #EF4444 (Vermelho)
- **Warning:** #F59E0B (Amarelo)
- **Background:** #F9FAFB (Cinza claro neutro)
- **Text Primary:** #111827 (Preto suave)
- **Text Secondary:** #6B7280 (Cinza médio)

### **Componentes**
- **Cards:** Arredondamento 16-24px, sombra suave
- **Botões:** Altura mínima 48px (acessibilidade)
- **Bordas:** 2px sólidas (#E5E7EB)
- **Espaçamento:** Escala consistente (4, 8, 12, 16, 20, 24px)
- **Ícones:** Lucide React, 20-24px

### **Microinterações**
- **Scale animations:** 0.92-1.01 ao clicar
- **Transitions:** 0.15s-0.3s
- **Swipe to delete:** Gesture nativo fluido
- **Toast notifications:** Centralizados, 2.5s duração

---

## 🚀 Funcionalidades Essenciais

### ✅ **OCR Automático**
- Escaneamento contínuo sem clicar
- Detecção em tempo real
- Feedback visual imediato
- Tratamento de erros com retry

### ✅ **Carrinho Inteligente**
- Total sempre visível no rodapé fixo
- Swipe to delete nativo
- Confirmação antes de remover
- Controles de quantidade intuitivos

### ✅ **Listas Salvas Reutilizáveis**
- Criar listas personalizadas
- Adicionar itens manualmente
- **"Usar Lista"** → Envia itens para o carrinho
- Ideal para compras recorrentes

### ✅ **Comparar Mercados + Comunidade**
- Mercados próximos com preços estimados
- Economia potencial
- **Ranking da comunidade integrado**
- Precisão e contribuições visíveis
- Ver rota para cada mercado

### ✅ **Histórico com Comparação**
- Todas as compras finalizadas
- Comparação automática com compra anterior
- Indicador visual: aumentou/diminuiu
- Percentual de variação

---

## 🧠 Heurísticas de Nielsen Aplicadas

1. **Visibilidade do status do sistema**
   - Total sempre visível
   - Loading states claros
   - Feedback imediato em todas as ações

2. **Controle e liberdade do usuário**
   - Swipe to delete com confirmação
   - Editar quantidades facilmente
   - Cancelar ações destrutivas

3. **Consistência e padrões**
   - Design system unificado
   - Cores, tipografia e componentes consistentes

4. **Prevenção de erros**
   - Confirmações antes de deletar
   - Validações de formulários
   - Mensagens de erro claras

5. **Reconhecimento ao invés de memorização**
   - Ícones universais e claros
   - Labels descritivos
   - Fluxo intuitivo

6. **Flexibilidade e eficiência de uso**
   - OCR automático (sem cliques)
   - Gestos nativos (swipe)
   - Ações rápidas na home

7. **Design minimalista e estético**
   - Interface limpa
   - Hierarquia visual clara
   - Sem elementos desnecessários

8. **Ajuda aos usuários a reconhecer, diagnosticar e recuperar de erros**
   - Mensagens de erro claras
   - Sugestões de ação (retry)
   - Feedback visual

---

## 📂 Estrutura de Componentes

```
/components
  ├── Home.tsx              # Tela inicial com scan e ações rápidas
  ├── Scanner.tsx           # OCR automático
  ├── Cart.tsx              # Carrinho com swipe to delete
  ├── SavedLists.tsx        # Gerenciar listas (com "Usar Lista")
  ├── SavedListDetail.tsx   # Detalhes da lista
  ├── Compare.tsx           # Mercados + Ranking da comunidade
  ├── History.tsx           # Histórico com comparação
  ├── Settings.tsx          # Configurações
  └── BottomNav.tsx         # Navegação (4 menus)

/types
  └── index.ts              # TypeScript interfaces

/styles
  └── globals.css           # Design system global
```

---

## 🎯 Diferenciais do Mape

- ✅ **OCR totalmente automático** (sem necessidade de clicar)
- ✅ **Swipe to delete nativo** (UX fluida)
- ✅ **Sistema de listas reutilizáveis** (compras recorrentes)
- ✅ **Ranking colaborativo integrado** (sem menu separado)
- ✅ **Comparação automática no histórico** (economia vs última compra)
- ✅ **Total sempre visível** (sem surpresas)
- ✅ **4 menus principais** (simplicidade extrema)
- ✅ **Design profissional** (limpo e moderno)
- ✅ **Mobile-first** (otimizado para celular)

---

## 🔧 Tecnologias

- **React** + Hooks
- **TypeScript** (Type safety)
- **Motion/React** (Animações fluidas)
- **Lucide React** (Ícones modernos)
- **Sonner** (Toast notifications)
- **LocalStorage** (Persistência de dados)

---

## 📈 Próximas Melhorias (Supabase)

- Sincronização entre dispositivos
- Backup na nuvem
- Compartilhamento de listas com família
- Dados colaborativos em tempo real
- Notificações push
- Histórico ilimitado

---

**Mape** - Compre inteligente, economize sempre 💙
