import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { List, AlertCircle, ArrowLeft, Plus, Edit2, Trash2, Package } from 'lucide-react';
import { supabase, getSavedLists, createSavedList, deleteSavedList, type SavedListDB, isSupabaseConfigured } from '../services/supabase';
import type { SavedList, Screen } from '../types';

interface SavedListsProps {
  onNavigate: (screen: Screen, listId?: string) => void;
  onSelectList: (list: SavedList) => void;
  onUseList: (list: SavedList) => void;
}

// Converter SavedListDB para SavedList
function convertDBListToLocal(dbList: SavedListDB, items: any[]): SavedList {
  return {
    id: dbList.id || '',
    name: dbList.name,
    items: items.map(item => ({
      id: item.id || '',
      name: item.name,
      quantity: item.quantity,
      lastPrice: item.last_price || 0,
      isNeeded: true,
      category: item.category
    })),
    createdAt: dbList.created_at ? new Date(dbList.created_at).getTime() : Date.now(),
    updatedAt: dbList.updated_at ? new Date(dbList.updated_at).getTime() : Date.now()
  };
}

export function SavedLists({ onNavigate, onSelectList }: SavedListsProps) {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        setLists([]);
        setLoading(false);
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError);
        toast.error('Erro ao verificar autenticação. Tente recarregar a página.');
        setLoading(false);
        return;
      }
      
      if (!session?.user) {
        // Não mostrar erro, apenas não carregar listas
        setLists([]);
        setLoading(false);
        return;
      }

      const dbLists = await getSavedLists(session.user.id);
      
      if (!dbLists || dbLists.length === 0) {
        setLists([]);
        setLoading(false);
        return;
      }
      
      // Para cada lista, buscar os itens
      const listsWithItems = await Promise.all(
        dbLists.map(async (dbList) => {
          try {
            const { data: items, error: itemsError } = await supabase
              .from('saved_list_items')
              .select('*')
              .eq('list_id', dbList.id);
            
            if (itemsError) {
              console.error(`Erro ao carregar itens da lista ${dbList.id}:`, itemsError);
              return convertDBListToLocal(dbList, []);
            }
          
            return convertDBListToLocal(dbList, items || []);
          } catch (error) {
            console.error(`Erro ao processar lista ${dbList.id}:`, error);
            return convertDBListToLocal(dbList, []);
          }
        })
      );

      setLists(listsWithItems);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      toast.error('Erro ao carregar listas. Verifique sua conexão e tente novamente.');
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    const listName = newListName.trim();
    if (!listName) {
      toast.error('Digite um nome para a lista');
      return;
    }

    if (listName.length > 100) {
      toast.error('Nome da lista muito longo (máximo 100 caracteres)');
      return;
    }

    try {
      setCreating(true);
      
      // Verificar se Supabase está configurado
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
        toast.error('Supabase não configurado. Verifique o arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
        return;
      }

      // Verificar autenticação
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Erro na sessão:', sessionError);
        toast.error('Erro ao verificar autenticação. Tente recarregar a página.');
        console.error('Detalhes do erro de sessão:', {
          message: sessionError.message,
          status: sessionError.status
        });
        return;
      }

      if (!session?.user) {
        toast.error('Faça login para criar listas.');
        console.warn('Tentativa de criar lista sem usuário autenticado');
        // Navegar para login após 1 segundo
        setTimeout(() => {
          onNavigate('login' as Screen);
        }, 1500);
        return;
      }

      // Verificar se o user_id é válido
      if (!session.user.id) {
        toast.error('Erro: ID do usuário inválido. Faça login novamente.');
        console.error('User ID inválido:', session.user);
        return;
      }

      console.log('Criando lista para usuário:', {
        userId: session.user.id,
        email: session.user.email,
        listName: listName
      });

      // Preparar dados da lista
      const listData = {
        user_id: session.user.id,
        name: listName
      };
      
      console.log('Dados que serão enviados para o Supabase:', listData);

      // Criar lista
      const newList = await createSavedList(listData);
      
      console.log('Resultado da criação da lista:', newList);

      if (newList && newList.id) {
        toast.success(`Lista "${listName}" criada com sucesso!`);
        setShowCreateModal(false);
        setNewListName('');
        await loadLists();
        // Navegar para edição da nova lista
        const newListLocal: SavedList = {
          id: newList.id,
          name: newList.name,
          items: [],
          createdAt: new Date(newList.created_at || new Date().toISOString()).getTime(),
          updatedAt: new Date(newList.updated_at || new Date().toISOString()).getTime()
        };
        onSelectList(newListLocal);
        onNavigate('savedListDetail');
      } else {
        toast.error('Erro ao criar lista. Verifique o console do navegador (F12) para detalhes do erro.');
      }
    } catch (error: any) {
      console.error('Erro ao criar lista:', error);
      
      if (error?.message === 'TABELA_NAO_EXISTE') {
        toast.error('Tabelas do Supabase não encontradas. Execute o arquivo supabase_schema.sql no seu projeto Supabase.');
      } else if (error?.message === 'AUTENTICACAO_INVALIDA') {
        toast.error('Sessão expirada. Faça login novamente.');
        setTimeout(() => {
          onNavigate('login' as Screen);
        }, 2000);
      } else if (error?.message === 'SEM_PERMISSAO') {
        toast.error('Sem permissão. Verifique as políticas RLS no Supabase. Abra o console (F12) para mais detalhes.');
        console.error('Detalhes do erro RLS:', error.details, error.hint);
      } else if (error?.message) {
        toast.error(`Erro: ${error.message}. Verifique o console (F12) para detalhes.`);
        console.error('Detalhes completos do erro:', {
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        toast.error('Erro ao criar lista. Verifique sua conexão e o console (F12) para detalhes.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a lista "${listName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      if (!isSupabaseConfigured()) {
        toast.error('Supabase não configurado. Verifique o arquivo .env.local.');
        return;
      }

      const success = await deleteSavedList(listId);
      if (success) {
        toast.success(`Lista "${listName}" excluída com sucesso`);
        await loadLists();
      } else {
        toast.error('Erro ao excluir lista. Verifique sua conexão e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      toast.error('Erro ao excluir lista. Verifique sua conexão e tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pb-24">
        <div className="bg-white px-6 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-[#0066FF] font-semibold hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-[#111827] mb-1">Minhas Listas</h2>
              <small className="text-[#6B7280]">Organize suas compras recorrentes</small>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-[#0066FF] font-semibold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-[#111827] mb-1">Minhas Listas</h2>
            <small className="text-[#6B7280]">Organize suas compras recorrentes</small>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 bg-[#0066FF] text-white rounded-full flex items-center justify-center hover:bg-[#0052CC] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lista de Listas */}
      <div className="px-4 py-6">
        {lists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <div className="w-24 h-24 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-6">
              <List className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <p className="text-[#111827] font-semibold mb-2">Nenhuma lista criada</p>
            <p className="text-[#6B7280] text-sm mb-6 max-w-sm mx-auto">
              Organize suas compras criando listas de produtos. Clique no botão + acima para começar.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => {
                      onSelectList(list);
                      onNavigate('savedListDetail');
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#111827] font-bold text-base mb-1">{list.name}</h3>
                        <p className="text-[#6B7280] text-sm">
                          {list.items.length} {list.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => {
                        onSelectList(list);
                        onNavigate('savedListDetail');
                      }}
                      className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-[#6B7280]" />
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id, list.name)}
                      className="p-2 hover:bg-[#FEF2F2] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-[#111827] font-bold text-xl mb-4">Nova Lista</h3>
            <input
              type="text"
              placeholder="Nome da lista (ex: Compras do mês)"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateList();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewListName('');
                }}
                className="flex-1 border border-[#E5E7EB] text-[#6B7280] rounded-xl px-4 py-3 font-semibold hover:bg-[#F9FAFB] transition-colors"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateList}
                disabled={creating || !newListName.trim()}
                className="flex-1 bg-[#0066FF] text-white rounded-xl px-4 py-3 font-semibold hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
