/**
 * Hook: Categorias de Produtos
 * 
 * Gerencia CRUD completo de categorias (criar, ler, atualizar, deletar).
 * Inclui sincronizacao automática com a tabela de produtos.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Tipo: Categoria de Produto
 */
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

/**
 * Hook completo para gerenciar categorias.
 * 
 * Fornece:
 * - Query: Listar categorias
 * - Mutation: Salvar (criar/atualizar)
 * - Mutation: Deletar
 * 
 * Sincroniza com tabela products quando categoria eh renomeada.
 * 
 * @returns Objeto com query e mutations
 * 
 * @example
 * const { data, save, remove, isSaving } = useCategories();
 * await save({ payload: { name: "Combustivel" } });
 */
export function useCategories() {
  const queryClient = useQueryClient();

  // Query: Listar categorias
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as Category[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutation: Salvar categoria (criar ou atualizar)
  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: any; id?: string }) => {
      if (id) {
        // UPDATE
        const { data, error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;

        // Se nome mudou, atualizar referencia em todos os produtos
        if (payload.name) {
          await supabase
            .from("products")
            .update({ category: payload.name })
            .eq("category_id", id);
        }

        return data;
      } else {
        // INSERT
        const { data, error } = await supabase
          .from("categories")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria salva com sucesso");
    },
    onError: (error) => {
      console.error("Error saving category:", error);
      toast.error("Erro ao salvar categoria");
    },
  });

  // Mutation: Deletar categoria
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria removida com sucesso");
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error("Erro ao remover categoria. Verifique se existem produtos vinculados.");
    },
  });

  return {
    ...query,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
