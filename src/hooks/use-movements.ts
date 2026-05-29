/**
 * Hook: Movimentacoes de Estoque
 * 
 * Busca movimentacoes de produtos (entrada/saida) dos ultimos N dias.
 * Usado para historico e relatorios de movimentacao.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Carrega movimentacoes de estoque do Supabase.
 * 
 * Busca todos os movimentos posteriores a data especificada (dias atras).
 * Cache: refetch a cada 5 minutos automaticamente.
 * 
 * @param days Quantos dias atras buscar movimentacoes
 * @returns Query result com lista de movimentacoes
 * 
 * @example
 * const { data, isLoading } = useMovements(7); // Ultimos 7 dias
 */
export function useMovements(days: number) {
  return useQuery({
    queryKey: ["movements", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("movements")
        .select("*")
        .gte("created_at", since);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos - refetch se ficar mais velho
  });
}
