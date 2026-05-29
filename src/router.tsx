/**
 * Configuracao do Roteador
 * 
 * Define e exporta a instancia do TanStack Router.
 * Este eh o ponto de entrada para o sistema de navegacao da aplicacao.
 */

import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { createQueryClient } from "./lib/query-client";

/**
 * Factory para criar a instancia do router.
 * 
 * Responsabilidades:
 * - Cria QueryClient para gerenciar requisicoes
 * - Configura o roteador com as rotas (routeTree.gen)
 * - Define comportamentos como scroll restoration e preload
 * 
 * @returns Instancia configurada do TanStack Router
 */
export const getRouter = () => {
  const queryClient = createQueryClient();

  const router = createRouter({
    routeTree, // Arvore de rotas gerada automaticamente
    context: { queryClient }, // Passa QueryClient para todas as rotas
    scrollRestoration: true, // Restaura posicao de scroll ao navegar
    defaultPreloadStaleTime: 0, // Preload rotas imediatamente
  });

  return router;
};
