/**
 * Script de diagnóstico para verificar conexão com Supabase
 * Execute este script no console do navegador (F12) para diagnosticar problemas
 */

import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface ConnectionDiagnostic {
  configured: boolean;
  url: string;
  keyPresent: boolean;
  authWorking: boolean;
  sessionStatus: 'active' | 'none' | 'error';
  userId?: string;
  tables: {
    saved_lists: 'ok' | 'error' | 'no_access';
    saved_list_items: 'ok' | 'error' | 'no_access';
    scan_sessions: 'ok' | 'error' | 'no_access';
  };
  rlsEnabled: {
    saved_lists: boolean;
    saved_list_items: boolean;
    scan_sessions: boolean;
  };
  errors: Array<{
    table: string;
    operation: string;
    error: string;
    code?: string;
  }>;
}

export async function testSupabaseConnection(): Promise<ConnectionDiagnostic> {
  const diagnostic: ConnectionDiagnostic = {
    configured: false,
    url: '',
    keyPresent: false,
    authWorking: false,
    sessionStatus: 'none',
    tables: {
      saved_lists: 'no_access',
      saved_list_items: 'no_access',
      scan_sessions: 'no_access',
    },
    rlsEnabled: {
      saved_lists: false,
      saved_list_items: false,
      scan_sessions: false,
    },
    errors: [],
  };

  console.group('🔍 Diagnóstico de Conexão Supabase');

  // 1. Verificar configuração
  console.log('1️⃣ Verificando configuração...');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  diagnostic.configured = isSupabaseConfigured();
  diagnostic.url = supabaseUrl;
  diagnostic.keyPresent = !!supabaseKey && supabaseKey !== 'placeholder-key';

  console.log('  ✓ URL:', supabaseUrl || 'NÃO CONFIGURADO');
  console.log('  ✓ Key presente:', diagnostic.keyPresent);
  console.log('  ✓ Configurado:', diagnostic.configured);

  if (!diagnostic.configured) {
    console.error('❌ Supabase não está configurado corretamente!');
    console.groupEnd();
    return diagnostic;
  }

  // 2. Verificar autenticação
  console.log('2️⃣ Verificando autenticação...');
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      diagnostic.sessionStatus = 'error';
      diagnostic.errors.push({
        table: 'auth',
        operation: 'getSession',
        error: sessionError.message,
        code: sessionError.status?.toString(),
      });
      console.error('  ❌ Erro na sessão:', sessionError);
    } else if (session?.user) {
      diagnostic.sessionStatus = 'active';
      diagnostic.userId = session.user.id;
      diagnostic.authWorking = true;
      console.log('  ✓ Sessão ativa');
      console.log('  ✓ User ID:', session.user.id);
      console.log('  ✓ Email:', session.user.email);
    } else {
      diagnostic.sessionStatus = 'none';
      console.warn('  ⚠️ Nenhuma sessão ativa (usuário não logado)');
    }
  } catch (error: any) {
    diagnostic.sessionStatus = 'error';
    diagnostic.errors.push({
      table: 'auth',
      operation: 'getSession',
      error: error.message || String(error),
    });
    console.error('  ❌ Erro ao verificar sessão:', error);
  }

  // 3. Verificar acesso às tabelas (SELECT)
  console.log('3️⃣ Verificando acesso às tabelas...');
  
  // Teste saved_lists
  try {
    const { data, error } = await supabase
      .from('saved_lists')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        diagnostic.tables.saved_lists = 'error';
        diagnostic.errors.push({
          table: 'saved_lists',
          operation: 'SELECT',
          error: 'Tabela não existe',
          code: error.code,
        });
        console.error('  ❌ saved_lists: Tabela não existe');
      } else if (error.code === '42501' || error.message?.includes('permission denied')) {
        diagnostic.tables.saved_lists = 'no_access';
        diagnostic.errors.push({
          table: 'saved_lists',
          operation: 'SELECT',
          error: error.message || 'Sem permissão',
          code: error.code,
        });
        console.warn('  ⚠️ saved_lists: Sem permissão (RLS bloqueando?)');
      } else {
        diagnostic.tables.saved_lists = 'error';
        diagnostic.errors.push({
          table: 'saved_lists',
          operation: 'SELECT',
          error: error.message || 'Erro desconhecido',
          code: error.code,
        });
        console.error('  ❌ saved_lists:', error.message, error.code);
      }
    } else {
      diagnostic.tables.saved_lists = 'ok';
      console.log('  ✓ saved_lists: Acesso OK');
    }
  } catch (error: any) {
    diagnostic.tables.saved_lists = 'error';
    diagnostic.errors.push({
      table: 'saved_lists',
      operation: 'SELECT',
      error: error.message || String(error),
    });
    console.error('  ❌ saved_lists: Erro inesperado:', error);
  }

  // Teste saved_list_items
  try {
    const { error } = await supabase
      .from('saved_list_items')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        diagnostic.tables.saved_list_items = 'error';
        diagnostic.errors.push({
          table: 'saved_list_items',
          operation: 'SELECT',
          error: 'Tabela não existe',
          code: error.code,
        });
        console.error('  ❌ saved_list_items: Tabela não existe');
      } else if (error.code === '42501') {
        diagnostic.tables.saved_list_items = 'no_access';
        console.warn('  ⚠️ saved_list_items: Sem permissão (RLS bloqueando?)');
      } else {
        diagnostic.tables.saved_list_items = 'error';
        diagnostic.errors.push({
          table: 'saved_list_items',
          operation: 'SELECT',
          error: error.message || 'Erro desconhecido',
          code: error.code,
        });
        console.error('  ❌ saved_list_items:', error.message);
      }
    } else {
      diagnostic.tables.saved_list_items = 'ok';
      console.log('  ✓ saved_list_items: Acesso OK');
    }
  } catch (error: any) {
    diagnostic.tables.saved_list_items = 'error';
    diagnostic.errors.push({
      table: 'saved_list_items',
      operation: 'SELECT',
      error: error.message || String(error),
    });
    console.error('  ❌ saved_list_items: Erro inesperado:', error);
  }

  // Teste scan_sessions
  try {
    const { error } = await supabase
      .from('scan_sessions')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        diagnostic.tables.scan_sessions = 'error';
        diagnostic.errors.push({
          table: 'scan_sessions',
          operation: 'SELECT',
          error: 'Tabela não existe',
          code: error.code,
        });
        console.error('  ❌ scan_sessions: Tabela não existe');
      } else if (error.code === '42501') {
        diagnostic.tables.scan_sessions = 'no_access';
        console.warn('  ⚠️ scan_sessions: Sem permissão (RLS bloqueando?)');
      } else {
        diagnostic.tables.scan_sessions = 'error';
        diagnostic.errors.push({
          table: 'scan_sessions',
          operation: 'SELECT',
          error: error.message || 'Erro desconhecido',
          code: error.code,
        });
        console.error('  ❌ scan_sessions:', error.message);
      }
    } else {
      diagnostic.tables.scan_sessions = 'ok';
      console.log('  ✓ scan_sessions: Acesso OK');
    }
  } catch (error: any) {
    diagnostic.tables.scan_sessions = 'error';
    diagnostic.errors.push({
      table: 'scan_sessions',
      operation: 'SELECT',
      error: error.message || String(error),
    });
    console.error('  ❌ scan_sessions: Erro inesperado:', error);
  }

  // 4. Tentar INSERT de teste (apenas se houver sessão)
  if (diagnostic.sessionStatus === 'active' && diagnostic.userId) {
    console.log('4️⃣ Testando INSERT (com rollback)...');
    
    try {
      const testList = {
        user_id: diagnostic.userId,
        name: `TESTE_CONNECTION_${Date.now()}`,
      };

      const { data, error } = await supabase
        .from('saved_lists')
        .insert([testList])
        .select()
        .single();

      if (error) {
        diagnostic.errors.push({
          table: 'saved_lists',
          operation: 'INSERT',
          error: error.message || 'Erro ao inserir',
          code: error.code,
        });
        
        if (error.code === '42501') {
          console.error('  ❌ INSERT bloqueado por RLS! Verifique as políticas.');
        } else {
          console.error('  ❌ Erro no INSERT:', error.message, error.code);
        }
      } else {
        console.log('  ✓ INSERT funcionou! Deletando registro de teste...');
        // Deletar o registro de teste
        if (data?.id) {
          await supabase.from('saved_lists').delete().eq('id', data.id);
          console.log('  ✓ Registro de teste removido');
        }
      }
    } catch (error: any) {
      diagnostic.errors.push({
        table: 'saved_lists',
        operation: 'INSERT',
        error: error.message || String(error),
      });
      console.error('  ❌ Erro inesperado no INSERT:', error);
    }
  } else {
    console.warn('  ⏭️  Pulando teste de INSERT (usuário não autenticado)');
  }

  // Resumo
  console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
  console.log('========================');
  console.log('Configurado:', diagnostic.configured ? '✅ SIM' : '❌ NÃO');
  console.log('URL:', diagnostic.url || 'NÃO CONFIGURADO');
  console.log('Autenticado:', diagnostic.sessionStatus === 'active' ? '✅ SIM' : '❌ NÃO');
  console.log('User ID:', diagnostic.userId || 'N/A');
  console.log('\nTabelas:');
  console.log('  - saved_lists:', diagnostic.tables.saved_lists === 'ok' ? '✅ OK' : '❌ ERRO');
  console.log('  - saved_list_items:', diagnostic.tables.saved_list_items === 'ok' ? '✅ OK' : '❌ ERRO');
  console.log('  - scan_sessions:', diagnostic.tables.scan_sessions === 'ok' ? '✅ OK' : '❌ ERRO');

  if (diagnostic.errors.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    diagnostic.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.table} (${err.operation}):`, err.error, err.code ? `[${err.code}]` : '');
    });
  } else {
    console.log('\n✅ Nenhum erro encontrado!');
  }

  console.groupEnd();

  return diagnostic;
}

// Expor função globalmente para acesso pelo console
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
  console.log('💡 Execute testSupabaseConnection() no console para diagnosticar a conexão');
}

