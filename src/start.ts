/**
 * Inicializacao da Aplicacao
 * 
 * Configura middlewares e inicia o servidor TanStack Start.
 * Ponto de entrada principal para o backend SSR.
 */

import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

/**
 * Middleware para tratamento de erros.
 * 
 * Captura excecoes nao tratadas e retorna pagina de erro generica.
 * Diferencia entre erros com statusCode (HTTP known) e erros desconhecidos.
 */
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Se tiver statusCode, eh um erro HTTP esperado, deixa passar
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // Caso contrario, loga e retorna pagina de erro generica
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

/**
 * Instancia do Start com middlewares configurados.
 * 
 * requestMiddleware: Executados para toda requisicao HTTP
 * functionMiddleware: Executados para chamadas de funcao do servidor (API)
 * 
 * attachSupabaseAuth adiciona contexto de autenticacao do Supabase
 * em todas as chamadas de funcao.
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
