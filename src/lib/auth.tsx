/**
 * Sistema de AutenticaÃ§Ã£o
 * 
 * Gerencia autenticação de usuários via Supabase Auth.
 * Fornece Context para acessar informações de usuário e permissões.
 * 
 * Fluxo:
 * 1. AuthProvider monitora mudanças de sessão do Supabase
 * 2. Carrega o role do usuário da tabela user_roles
 * 3. ExpÃµe via Context (useAuth hook)
 */

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tipos de papÃ©is de usuÃ¡rio no sistema.
 * - admin: Acesso total ao painel administrativo
 * - frentista: Operador de pista (vendas e consultas)
 * - null: NÃ£o autenticado
 */
type Role = "admin" | "frentista" | null;

/**
 * Estado de autenticaÃ§Ã£o compartilhado via Context.
 * 
 * @property user - UsuÃ¡rio autenticado do Supabase
 * @property session - SessÃ£o ativa do Supabase
 * @property role - Papel do usuÃ¡rio (admin, frentista, etc)
 * @property loading - Indica se estÃ¡ carregando dados iniciais
 * @property signOut - FunÃ§Ã£o para fazer logout
 * @property refresh - FunÃ§Ã£o para recarregar role do usuÃ¡rio
 */
interface AuthState {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** Context React para compartilhar estado de autenticaÃ§Ã£o */
const AuthCtx = React.createContext<AuthState | null>(null);

/**
 * Provedor de autenticaÃ§Ã£o que deve envolver toda a aplicaÃ§Ã£o.
 * 
 * Responsabilidades:
 * - Monitora mudanÃ§as de autenticaÃ§Ã£o do Supabase
 * - Carrega e atualiza o role do usuÃ¡rio
 * - Fornece estado via Context
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [role, setRole] = React.useState<Role>(null);
  const [loading, setLoading] = React.useState(true);

  /**
   * Carrega o role do usuÃ¡rio a partir da tabela user_roles.
   * 
   * Busca todas as permissÃµes do usuÃ¡rio e define a mais alta:
   * - admin > frentista > nenhum
   * 
   * @param uid ID do usuÃ¡rio
   */
  const loadRole = React.useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    if (data && data.length > 0) {
      const roles = data.map((r) => r.role);
      // Define o role mais permissivo: admin > frentista
      setRole(roles.includes("admin") ? "admin" : roles.includes("frentista") ? "frentista" : null);
    } else {
      setRole(null);
    }
  }, []);

  /**
   * Efeito: Monitora mudanÃ§as de autenticaÃ§Ã£o.
   * 
   * - Configura listener para onAuthStateChange
   * - Carrega sessÃ£o e role iniciais
   * - Limpa subscription ao desmontar
   * 
   * Nota: loadRole Ã© feito com setTimeout para evitar deadlocks
   * dentro do callback do Supabase.
   */
  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Adia o lookup de role para evitar deadlocks dentro do callback
      setTimeout(() => loadRole(s?.user.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadRole(data.session?.user.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, [loadRole]);

  // ConstrÃ³i o estado final para o Context
  const value: AuthState = {
    user: session?.user ?? null,
    session,
    role,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refresh: async () => {
      await loadRole(session?.user.id);
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/**
 * Hook para acessar estado de autenticaÃ§Ã£o.
 * 
 * Deve ser usado DENTRO de um AuthProvider.
 * 
 * @returns Estado de autenticaÃ§Ã£o completo
 * 
 * @example
 * function MyComponent() {
 *   const { user, role, loading } = useAuth();
 *   if (loading) return <Loading />;
 *   if (!user) return <LoginPage />;
 *   return <Dashboard />;
 * }
 */
export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

/**
 * Converte cÃ³digo de frentista (nÃºmeros) para email de autenticaÃ§Ã£o.
 * 
 * Exemplo: "5" -> "f05@buriti.local"
 * 
 * Este padrÃ£o permite login simples usando apenas nÃºmero na pista.
 * 
 * @param code CÃ³digo do frentista (ex: "1", "42")
 * @returns Email formatado para Supabase Auth
 */
export function codeToEmail(code: string) {
  return `f${code.padStart(2, "0")}@buriti.local`;
}