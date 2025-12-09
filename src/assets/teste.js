import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hfkmuunnszclcipmciid.supabase.co';
const supabaseKey = 'sb_publishable_Yxkc_l5U8vg28iyLK6yA1A_UqgOe5HU';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function adicionarProduto(name, email) {
  const { data, error } = await supabase
    .from('produtos')
    .insert([{ name, email }]);

  if (error) {
    console.error('Erro ao inserir produto:', error);CTRL + C

    return null;
  }

  return data;
}
