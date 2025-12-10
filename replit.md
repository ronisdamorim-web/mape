# Mape App

## Overview
Mape é um aplicativo de compras inteligente construído com React, Vite e Supabase. O app ajuda usuários a fazer decisões de compra inteligentes comparando preços e gerenciando listas de compras. A interface está em português (BR).

## Status: Produção (Dezembro 10, 2025)
O projeto está pronto para uso real:
- Nome atualizado para "Mape"
- Autenticação real com Supabase Auth
- Login por e-mail/senha funcionando
- Cadastro e recuperação de senha
- Rotas protegidas
- OCR 100% local com Tesseract.js (pré-processamento avançado)
- Persistência real com Supabase (tabelas cart_items, purchase_history)
- Sem código fake ou mock

## Estrutura do Projeto

```
src/
├── services/
│   └── supabase.ts          # Cliente Supabase centralizado
├── pages/                    # Telas/Páginas da aplicação
│   ├── Login.tsx             # Login real com Supabase Auth
│   ├── Home.tsx
│   ├── Cart.tsx
│   ├── Compare.tsx
│   ├── ComparisonDetails.tsx
│   ├── History.tsx
│   ├── SavedLists.tsx
│   ├── SavedListDetail.tsx
│   ├── Scanner.tsx           # Scanner OCR
│   ├── Settings.tsx
│   ├── SettingsProfile.tsx
│   ├── SettingsNotifications.tsx
│   ├── SettingsPrivacy.tsx
│   ├── SettingsHelp.tsx
│   ├── SettingsAbout.tsx
│   ├── WhereToShop.tsx
│   └── ShoppingList.tsx
├── components/
│   ├── ui/                   # Componentes Radix UI
│   ├── figma/                # Componentes importados do Figma
│   ├── OCRScanner.tsx        # Componente OCR com Tesseract.js
│   ├── BottomNav.tsx
│   ├── SaveAsListModal.tsx
│   └── ComparisonInfoModal.tsx
├── utils/
│   └── calculations.ts
├── types/
│   └── index.ts
├── styles/
│   └── globals.css
├── assets/
└── App.tsx                   # Gerenciamento de auth e rotas
```

## Stack Tecnológico
- **Frontend**: React 18.3.1 + Vite 6.3.5
- **Styling**: Tailwind CSS v4.1.3
- **UI**: Radix UI + Lucide Icons
- **Animações**: Motion/React
- **Backend**: Supabase (PostgreSQL + Auth)
- **OCR**: Tesseract.js
- **Linguagem**: TypeScript

## Autenticação

### Supabase Auth
Implementado em `src/pages/Login.tsx`:
- Login por e-mail/senha
- Cadastro de novo usuário
- Recuperação de senha por e-mail
- Validação de formulários
- Feedback de erros em português
- Loading states

### Proteção de Rotas
Em `src/App.tsx`:
- Verifica sessão do Supabase
- Redireciona para login se não autenticado
- Mantém sessão entre recarregamentos

## OCR com Tesseract.js
Implementado em `src/components/OCRScanner.tsx`:
- 100% local (sem APIs externas)
- Captura via câmera traseira
- Pré-processamento avançado:
  - Box blur para redução de ruído
  - Normalização de contraste adaptativa
  - Thresholding binário
- Controles inteligentes:
  - Verificação de conteúdo visível (edge detection)
  - Estabilidade de frame (2 frames estáveis antes de processar)
  - Back-off progressivo quando sem etiqueta (1.2s → 3s)
  - Prevenção de leituras duplicadas
- Extração de preços (R$ XX,XX)
- Rastreamento completo de timeouts para limpeza

## Desenvolvimento

### Rodar Localmente
```bash
npm run dev
```
Servidor em `0.0.0.0:5000`

### Build Produção
```bash
npm run build
```

## Configuração

### Vite (vite.config.ts)
- Host: `0.0.0.0`
- Port: `5000`
- HMR: ativo

### Supabase
Centralizado em `src/services/supabase.ts`:
```typescript
export const supabase = createClient(url, key);
```

## Notas
- Interface 100% em português (BR)
- Autenticação real funcionando
- Sem dados simulados
- Pronto para produção
