/**
 * Entrada do Servidor (SSR)
 * 
 * Processa requisicoes HTTP e renderiza componentes React no servidor.
 * Trata erros de SSR de forma elegante para evitar respostas corrompidas.
 */

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

/**
 * Tipo de modulo de entrada do servidor.
 * Define o contrato que qualquer modulo de servidor deve seguir.
 */
type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

/**
 * Carrega o modulo de entrada do servidor (lazy loading).
 * 
 * Usa cache em memoria para evitar re-imports multiples.
 * Importa dinamicamente de @tanstack/react-start/server-entry.
 */
async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

/**
 * Normaliza respostas de erro catastroficas do h3 (usado internamente).
 * 
 * h3 envelopa alguns erros como respostas JSON 500 com "{unhandled:true}".
 * Esta funcao detecta e converte para uma pagina HTML de erro.
 * 
 * Motivo: Respostas JSON corrompidas podem quebrar o cliente.
 * Preferimos retornar HTML de erro generico.
 */
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  // Log do erro capturado e retorna pagina de erro
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/**
 * Handler HTTP principal (exportado como default para Cloudflare Workers).
 * 
 * Processa cada requisicao:
 * 1. Carrega o modulo de entrada do servidor
 * 2. Renderiza a requisicao
 * 3. Normaliza respostas de erro para evitar corrupcao
 * 4. Trata erros nao capturados
 */
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
