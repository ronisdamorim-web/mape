import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CartItem {
  id?: string;
  user_id: string;
  name: string;
  quantity: number;
  preco_avulso: number;
  preco_cartao: number;
  preco_atacado: number;
  barcode?: string;
  weight?: string;
  source?: string;
  created_at?: string;
}

export interface GlobalPrice {
  id?: string;
  product_name: string;
  barcode?: string;
  price: number;
  market_name?: string;
  price_type: string;
  detected_at: string;
  user_id: string;
  region?: string;
}

export interface SavedListDB {
  id?: string;
  user_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedListItemDB {
  id?: string;
  list_id: string;
  name: string;
  quantity: number;
  last_price?: number;
  category?: string;
}

export interface PurchaseHistoryItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PurchaseHistory {
  id?: string;
  user_id: string;
  items: PurchaseHistoryItem[];
  total: number;
  item_count: number;
  created_at?: string;
}

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar carrinho:', error.message);
    return [];
  }

  return data || [];
}

export async function addCartItem(item: CartItem): Promise<CartItem | null> {
  const { data, error } = await supabase
    .from('cart_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar item:', error.message);
    return null;
  }

  return data;
}

export async function updateCartItem(id: string, updates: Partial<CartItem>): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar item:', error.message);
    return false;
  }

  return true;
}

export async function deleteCartItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar item:', error.message);
    return false;
  }

  return true;
}

export async function clearCart(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Erro ao limpar carrinho:', error.message);
    return false;
  }

  return true;
}

export async function addGlobalPrice(price: GlobalPrice): Promise<boolean> {
  const { error } = await supabase
    .from('global_prices')
    .insert([price]);

  if (error) {
    console.error('Erro ao adicionar preço global:', error.message);
    return false;
  }

  return true;
}

export async function getGlobalPrices(productName: string): Promise<GlobalPrice[]> {
  const { data, error } = await supabase
    .from('global_prices')
    .select('*')
    .ilike('product_name', `%${productName}%`)
    .order('detected_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Erro ao buscar preços globais:', error.message);
    return [];
  }

  return data || [];
}

export async function getPriceStats(productName: string): Promise<{
  minPrice: number | null;
  avgPrice: number | null;
  lastPrice: number | null;
  count: number;
}> {
  const prices = await getGlobalPrices(productName);
  
  if (prices.length === 0) {
    return { minPrice: null, avgPrice: null, lastPrice: null, count: 0 };
  }

  const priceValues = prices.map(p => p.price);
  const minPrice = Math.min(...priceValues);
  const avgPrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
  const lastPrice = prices[0].price;

  return { minPrice, avgPrice, lastPrice, count: prices.length };
}

export async function savePurchaseHistory(purchase: PurchaseHistory): Promise<boolean> {
  const { error } = await supabase
    .from('purchase_history')
    .insert([{
      user_id: purchase.user_id,
      items: purchase.items,
      total: purchase.total,
      item_count: purchase.item_count
    }]);

  if (error) {
    console.error('Erro ao salvar histórico:', error.message);
    return false;
  }

  return true;
}

export async function getPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
  const { data, error } = await supabase
    .from('purchase_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erro ao buscar histórico:', error.message);
    return [];
  }

  return data || [];
}
