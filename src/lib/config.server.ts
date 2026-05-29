/**
 * Configuração do Servidor
 * 
 * Este arquivo contém APENAS configurações que rodam no servidor.
 * O sufixo .server.ts previne que o Vite inclua este arquivo no bundle do cliente.
 * 
 * IMPORTANTE: Nunca coloque secrets ou tokens aqui como valores diretos!
 * Sempre leia from process.env dentro de funções.
 * 
 * Padrões de acesso a variáveis de ambiente:
 * 1. .server.ts (este arquivo): Leia process.env DENTRO de funções
 * 2. createServerFn: Leia process.env inline para valores únicos
 * 3. Cliente: Use import.meta.env.VITE_* APENAS para valores públicos
 */

import process from "node:process";

/**
 * Retorna a configuração do servidor.
 * 
 * Lê variáveis de ambiente a cada chamada (importante em Cloudflare Workers
 * onde as env bindings resolvem em tempo de REQUEST).
 * 
 * @returns Objeto com configurações do servidor
 * 
 * @example
 * const config = getServerConfig();
 * console.log(config.nodeEnv); // 'development' | 'production'
 */
export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    // Adicionar mais valores do servidor aqui conforme necessário:
    // databaseUrl: process.env.DATABASE_URL,
    // stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  };
}
