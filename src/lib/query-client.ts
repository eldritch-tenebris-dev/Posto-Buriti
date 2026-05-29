/**
 * Query Client Configuration
 * 
 * Configura o React Query com opções padrão para cache e refetch de dados.
 * Este cliente é usado em toda a aplicação para gerenciar requisições assíncronas.
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Cria uma instância do QueryClient com configurações otimizadas.
 * 
 * Opções:
 * - staleTime: 1 minuto - dados não refetch automaticamente neste período
 * - gcTime: 5 minutos - cache é mantido por 5 minutos após não ser usado
 * - retry: 1 - tenta novamente 1 vez em caso de erro
 * - refetchOnWindowFocus: false - não faz refetch ao voltar para a aba
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minuto
        gcTime: 1000 * 60 * 5, // 5 minutos
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
