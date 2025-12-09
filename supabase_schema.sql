-- ============================================
-- EXECUTE ESTE SQL NO SEU SUPABASE
-- Vá em: Supabase Dashboard > SQL Editor > New Query
-- Cole todo este conteúdo e clique em "Run"
-- ============================================

-- Tabela de itens do carrinho
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  preco_avulso DECIMAL(10,2) DEFAULT 0,
  preco_cartao DECIMAL(10,2) DEFAULT 0,
  preco_atacado DECIMAL(10,2) DEFAULT 0,
  barcode TEXT,
  weight TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preços globais
CREATE TABLE IF NOT EXISTS global_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  barcode TEXT,
  price DECIMAL(10,2) NOT NULL,
  market_name TEXT,
  price_type TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region TEXT
);

-- Tabela de listas salvas
CREATE TABLE IF NOT EXISTS saved_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens das listas salvas
CREATE TABLE IF NOT EXISTS saved_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES saved_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  last_price DECIMAL(10,2),
  category TEXT
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_list_items ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para cart_items
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para global_prices
CREATE POLICY "Users can view all global prices" ON global_prices
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own prices" ON global_prices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para saved_lists
CREATE POLICY "Users can view own lists" ON saved_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists" ON saved_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON saved_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON saved_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para saved_list_items
CREATE POLICY "Users can view items from own lists" ON saved_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM saved_lists 
      WHERE saved_lists.id = saved_list_items.list_id 
      AND saved_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to own lists" ON saved_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_lists 
      WHERE saved_lists.id = saved_list_items.list_id 
      AND saved_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items from own lists" ON saved_list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM saved_lists 
      WHERE saved_lists.id = saved_list_items.list_id 
      AND saved_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own lists" ON saved_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM saved_lists 
      WHERE saved_lists.id = saved_list_items.list_id 
      AND saved_lists.user_id = auth.uid()
    )
  );

-- Tabela de histórico de compras
CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  item_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchase history" ON purchase_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON purchase_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_global_prices_product_name ON global_prices(product_name);
CREATE INDEX IF NOT EXISTS idx_global_prices_barcode ON global_prices(barcode);
CREATE INDEX IF NOT EXISTS idx_saved_lists_user_id ON saved_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_list_items_list_id ON saved_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON purchase_history(user_id);
