/**
 * Hook: Produtos
 * 
 * Gerencia produtos (CRUD) e movimentacoes de estoque entre pista e estoque.
 * Validacao com Zod, cache com React Query, feedback com toast.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Database } from "@/integrations/supabase/types";

// Tipos do Supabase (enums)
type TransactionType = Database["public"]["Enums"]["transaction_type"];
type StockLocation = Database["public"]["Enums"]["stock_location"];

/**
 * Schema de validacao para produtos.
 * 
 * Valida nome, precos, e quantidades minimas.
 * Garante que nenhum campo invalido seja enviado ao servidor.
 */
export const productSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
  category: z.string().nullable(),
  internal_code: z.string().nullable(),
  sale_price: z.coerce.number().min(0, "O preco de venda nao pode ser negativo"),
  cost_price: z.coerce.number().min(0, "O preco de custo nao pode ser negativo"),
  pista_min: z.coerce.number().min(0, "O minimo na pista nao pode ser negativo"),
  estoque_min: z.coerce.number().min(0, "O minimo no estoque nao pode ser negativo"),
});

/**
 * Tipo completo de Produto (com campos do DB).
 */
export type Product = z.infer<typeof productSchema> & {
  id: string;
  brand: string | null;
  barcode: string | null;
  description: string | null;
  pista_qty: number;      // Quantidade na pista
  estoque_qty: number;    // Quantidade no estoque
};

/**
 * Hook completo para gerenciar produtos.
 * 
 * Fornece:
 * - Query: Listar produtos (refetch a cada 10s)
 * - Mutation: Salvar produto
 * - Mutation: Deletar produto
 * - Mutation: Movimentar estoque entre pista e estoque
 * 
 * A movimentacao de estoque tambem registra na tabela movements para historico.
 */
export function useProducts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query: Listar todos os produtos
  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Product[];
    },
    refetchInterval: 10000, // Refetch a cada 10 segundos para manter em tempo real
  });

  // Mutation: Salvar produto (criar ou atualizar)
  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: any; id?: string }) => {
      const { error } = id
        ? await supabase.from("products").update(payload).eq("id", id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto salvo com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar produto");
    },
  });

  // Mutation: Deletar produto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluido");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir produto");
    },
  });

  // Mutation: Movimentar estoque
  // Move quantidade entre pista e estoque (ou registra transacao)
  const moveStockMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      delta, 
      location, 
      type 
    }: { 
      productId: string; 
      delta: number; 
      location: StockLocation; 
      type: TransactionType;
    }) => {
      const product = query.data?.find(p => p.id === productId);
      if (!product) throw new Error("Produto não encontrado");

      let updatePayload: Database["public"]["Tables"]["products"]["Update"] = {};
      let currentQty = 0;

      if (location === "pista") {
        currentQty = product.pista_qty || 0;
        updatePayload.pista_qty = currentQty + delta;
      } else if (location === "estoque") {
        currentQty = product.estoque_qty || 0;
        updatePayload.estoque_qty = currentQty + delta;
      } else {
        throw new Error("Localização inválida para movimentação manual");
      }

      if ((updatePayload.pista_qty ?? 0) < 0 || (updatePayload.estoque_qty ?? 0) < 0) {
        throw new Error("Quantidade insuficiente");
      }

      const { error: updateError } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", productId);

      if (updateError) throw updateError;

      const { error: movementError } = await supabase.from("movements").insert({
        product_id: productId,
        type,
        quantity: Math.abs(delta),
        location,
        user_id: user?.id,
      });

      if (movementError) throw movementError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  return {
    ...query,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    remove: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    moveStock: moveStockMutation.mutateAsync,
    isMoving: moveStockMutation.isPending,
  };
}
