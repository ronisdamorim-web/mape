import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificação robusta de configuração
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey && 
         supabaseUrl !== 'https://placeholder.supabase.co' &&
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.startsWith('https://');
};

// Criar cliente Supabase
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase credentials are missing or invalid. O app funcionará, mas sem persistência no Supabase. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local');
}

export const supabase = createClient(finalUrl, finalKey);

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

export interface ScanSession {
  id?: string;
  user_id?: string | null;
  market_name?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  location_label?: string | null;
  raw_text?: string | null;
  status: 'draft' | 'confirmed';
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

// Funções para Scan Sessions
export async function createScanSession(session: ScanSession): Promise<ScanSession | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('scan_sessions')
      .insert([session])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão de scan:', error.message, error.code);
      // Se a tabela não existir, retorna null sem travar
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('Tabela scan_sessions não existe no Supabase. Execute o SQL do schema.');
        return null;
      }
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Erro inesperado ao criar sessão de scan:', error);
    return null;
  }
}

export async function updateScanSession(id: string, updates: Partial<ScanSession>): Promise<boolean> {
  if (!id) {
    console.error('ID da sessão não fornecido');
    return false;
  }

  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase
      .from('scan_sessions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar sessão de scan:', error.message, error.code);
      // Se a tabela não existir, retorna false sem travar
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('Tabela scan_sessions não existe no Supabase.');
        return false;
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao atualizar sessão de scan:', error);
    return false;
  }
}

// Funções para Listas Salvas
export async function getSavedLists(userId: string): Promise<SavedListDB[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('saved_lists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar listas:', error.message, error.code);
      
      // Tabela não existe - retornar array vazio silenciosamente
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return [];
      }
      
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar listas:', error);
    return [];
  }
}

export async function createSavedList(list: SavedListDB): Promise<SavedListDB | null> {
  try {
    if (!isSupabaseConfigured()) {
      console.error('Supabase não configurado');
      return null;
    }

    // Verificar sessão antes de inserir
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Sessão atual no createSavedList:', {
      hasSession: !!session,
      userId: session?.user?.id,
      listUserId: list.user_id
    });

    // Garantir que o user_id da lista corresponde à sessão
    if (session?.user?.id && list.user_id !== session.user.id) {
      console.warn('Aviso: user_id da lista não corresponde à sessão. Usando user_id da sessão.');
      list.user_id = session.user.id;
    }

    console.log('Inserindo lista no Supabase:', list);

    const { data, error } = await supabase
      .from('saved_lists')
      .insert([list])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar lista no Supabase:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Tratar erro específico de tabela não existe
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        const err = new Error('TABELA_NAO_EXISTE');
        (err as any).code = error.code;
        (err as any).details = error.details;
        throw err;
      }
      
      // Tratar erro de autenticação
      if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('JWT expired')) {
        const err = new Error('AUTENTICACAO_INVALIDA');
        (err as any).code = error.code;
        throw err;
      }

      // Tratar erro de permissão (RLS)
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
        const err = new Error('SEM_PERMISSAO');
        (err as any).code = error.code;
        (err as any).details = error.details;
        throw err;
      }
      
      // Outros erros
      const err = new Error(error.message || 'ERRO_DESCONHECIDO');
      (err as any).code = error.code;
      (err as any).details = error.details;
      (err as any).hint = error.hint;
      throw err;
    }

    return data || null;
  } catch (error: any) {
    console.error('Erro inesperado ao criar lista:', error);
    // Re-lançar erros específicos
    if (error.message === 'TABELA_NAO_EXISTE' || error.message === 'AUTENTICACAO_INVALIDA' || error.message === 'SEM_PERMISSAO') {
      throw error;
    }
    return null;
  }
}

export async function updateSavedList(id: string, updates: Partial<SavedListDB>): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('saved_lists')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar lista:', error.message, error.code);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao atualizar lista:', error);
    return false;
  }
}

export async function deleteSavedList(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    // Deletar itens primeiro (deve ser cascade, mas garantindo)
    await supabase
      .from('saved_list_items')
      .delete()
      .eq('list_id', id);

    const { error } = await supabase
      .from('saved_lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar lista:', error.message, error.code);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao deletar lista:', error);
    return false;
  }
}

// Funções para Itens de Lista
export async function getSavedListItems(listId: string): Promise<SavedListItemDB[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('saved_list_items')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens da lista:', error.message, error.code);
      // Se tabela não existe, retornar array vazio silenciosamente
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return [];
      }
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar itens da lista:', error);
    return [];
  }
}

export async function addSavedListItem(item: SavedListItemDB): Promise<SavedListItemDB | null> {
  if (!item.list_id || !item.name) {
    console.error('Dados inválidos para adicionar item à lista');
    return null;
  }

  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('saved_list_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar item à lista:', error.message, error.code);
      // Se a tabela não existir, retorna null sem travar
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('Tabela saved_list_items não existe no Supabase. Execute o SQL do schema.');
        return null;
      }
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Erro inesperado ao adicionar item à lista:', error);
    return null;
  }
}

export async function updateSavedListItem(id: string, updates: Partial<SavedListItemDB>): Promise<boolean> {
  if (!id) {
    console.error('ID do item não fornecido');
    return false;
  }

  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase
      .from('saved_list_items')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar item:', error.message, error.code);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao atualizar item:', error);
    return false;
  }
}

export async function deleteSavedListItem(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase
      .from('saved_list_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar item:', error.message, error.code);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao deletar item:', error);
    return false;
  }
}
