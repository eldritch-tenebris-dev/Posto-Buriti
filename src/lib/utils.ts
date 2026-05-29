/**
 * Utilidades de Classe CSS
 * 
 * Combina e mescla classes CSS de forma inteligente, resolvendo conflitos
 * entre classes Tailwind CSS.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina múltiplas classes CSS com resolução inteligente de conflitos.
 * 
 * Usa clsx para construir classes condicionais e twMerge para resolver
 * conflitos de especificidade do Tailwind CSS.
 * 
 * @example
 * cn('px-4', isActive && 'bg-blue-500', 'px-2') // px-2 sobrescreve px-4
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
