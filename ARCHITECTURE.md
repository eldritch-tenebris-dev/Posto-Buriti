# Arquitetura do Projeto Posto Buriti

## Visão Geral

Sistema ERP fullstack de gestão de estoque e pista para Posto Buriti. Frontend em React/TypeScript e backend via Supabase (PostgreSQL + Auth).

## Stack Tecnológico

### Frontend
- **React 19** + TypeScript
- **TanStack Router** - Roteamento
- **Vite** - Build tool
- **TailwindCSS** + **Shadcn/UI** - UI Components
- **React Query** (@tanstack/react-query) - Sincronização de dados
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Zustand** - State management (se usado)
- **Framer Motion** - Animações

### Backend
- **Supabase** - BaaS com PostgreSQL
- **Supabase Auth** - Autenticação de usuários
- **Edge Functions** - Serverless functions
- **Realtime** - WebSockets para sincronização

### DevOps
- **Bun** - Runtime e package manager
- **Docker** (opcional)
- **Cloudflare Workers** (suportado via TanStack Start)

## Estrutura de Pastas

```
src/
├── components/              # Componentes React
│   ├── buriti/             # Componentes específicos do domínio
│   │   ├── AdminShell.tsx  # Layout principal admin
│   │   ├── DashboardCharts.tsx
│   │   ├── FuelPumpCard.tsx
│   │   ├── FuelTankCard.tsx
│   │   ├── Logo.tsx
│   │   ├── PageHeader.tsx
│   │   └── ...outros componentes
│   └── ui/                 # Componentes Shadcn/UI (sistema de design)
│
├── hooks/                  # Custom hooks React
│   ├── use-movements.ts   # Hook para movimentações de estoque
│   ├── use-categories.ts  # Hook para categorias
│   ├── use-products.ts    # Hook para produtos (CRUD + movimentação)
│   ├── use-mobile.tsx     # Hook para detectar mobile
│   └── ...outros hooks
│
├── lib/                    # Funções utilitárias
│   ├── auth.tsx           # Context e hook de autenticação
│   ├── query-client.ts    # Configuração do React Query
│   ├── config.server.ts   # Configurações de servidor
│   ├── utils.ts           # Utilidades gerais (cn, etc)
│   ├── error-page.ts      # Rendering de página de erro
│   ├── error-capture.ts   # Captura de erros
│   ├── employees.functions.ts
│   ├── users.functions.ts
│   └── api/               # Chamadas de API
│
├── integrations/          # Integrações externas
│   └── supabase/
│       ├── client.ts      # Cliente Supabase
│       ├── types.ts       # Types gerados do DB
│       └── auth-attacher.ts
│
├── routes/                # TanStack Router routes
│   ├── __root.tsx        # Layout raiz
│   ├── _authenticated.tsx # Layout para rotas protegidas
│   ├── admin.tsx         # Admin dashboard
│   ├── operador.tsx      # Painel do frentista
│   ├── login.tsx         # Página de login
│   ├── index.tsx         # Home page
│   └── _authenticated/   # Subrotas autenticadas
│
├── router.tsx            # Configuração do router
├── start.ts              # Inicialização do TanStack Start
├── server.ts             # Handler de servidor (SSR)
└── styles.css            # Estilos globais

supabase/
├── config.toml          # Configuração do Supabase local
├── functions/           # Edge Functions
│   └── create-backup/
└── migrations/          # Migrações de banco de dados
    └── [arquivos.sql]
```

## Fluxo de Autenticação

1. **Login**: Frentista digita código (ex: "5") + PIN
   - Código "5" é convertido para `f05@buriti.local`
   - PIN é a senha

2. **Supabase Auth**: Autentica no Supabase
   - Sessão é armazenada localmente
   - JWT é enviado em cada requisição

3. **AuthProvider**: Context React monitora mudanças
   - Carrega role do usuário da tabela `user_roles`
   - Fornece `useAuth()` hook para toda a app

4. **Proteção de Rotas**:
   - `_authenticated` layout verifica se usuário está logado
   - Redireciona para `/login` se não autenticado
   - Redireciona para `/operador` se frentista

## Fluxo de Dados (React Query)

```
Component
    ↓
Custom Hook (use-products, use-categories, etc)
    ↓
useQuery (busca) / useMutation (insert/update/delete)
    ↓
Supabase Client
    ↓
PostgreSQL Database
```

### Cache Strategy
- **staleTime**: 1 minuto - dados não refetch automaticamente
- **gcTime**: 5 minutos - cache é descartado após não usar
- **retry**: 1 vez em caso de erro
- **refetchOnWindowFocus**: false - não refetch ao voltar

### Invalidação de Cache
Após mutation bem-sucedida:
```typescript
queryClient.invalidateQueries({ queryKey: ["products"] });
```

## Modelos de Dados Principais

### Products (Produtos)
```typescript
{
  id: string;
  name: string;
  category: string | null;
  internal_code: string | null;
  sale_price: number;
  cost_price: number;
  pista_qty: number;        // Quantidade na pista
  estoque_qty: number;      // Quantidade no estoque
  pista_min: number;        // Mínimo recomendado na pista
  estoque_min: number;      // Mínimo recomendado no estoque
  brand: string | null;
  barcode: string | null;
  description: string | null;
}
```

### Movements (Movimentações)
```typescript
{
  id: string;
  product_id: string;
  type: "entrada" | "saida" | "transferencia" | ...;
  quantity: number;
  location: "pista" | "estoque";
  user_id: string;          // Quem fez a movimentação
  created_at: timestamp;
}
```

### Users & Roles
```typescript
{
  id: string;
  email: string;
  created_at: timestamp;
}

user_roles:
{
  user_id: string;
  role: "admin" | "frentista";
}
```

## Componentes Principais

### AdminShell
Layout principal do admin. Contém:
- Sidebar com navegação
- Header com logo e notificações
- Outlet para rotas filhas

### DashboardCharts
Exibe gráficos e estatísticas em tempo real.

### FuelPumpCard / FuelTankCard
Componentes específicos para exibir estado de bombas/tanques.

### RecentMovements / ReportsCharts
Mostram histórico e relatórios de movimentações.

## Padrões de Código

### Hooks Customizados
Padrão para CRUD + mutations:

```typescript
export function useProducts() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => { /* fetch */ },
  });
  
  const saveMutation = useMutation({
    mutationFn: async (payload) => { /* post/put */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
  
  return {
    ...query,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
```

### Roteamento
```typescript
export const Route = createFileRoute("/caminho")({
  component: MyComponent,
  loader: async () => { /* preload data */ },
  beforeLoad: ({ context }) => { /* validations */ },
});
```

## Inicialização do Projeto

1. **startInstance** (start.ts)
   - Configura middlewares
   - Passa QueryClient como contexto

2. **getRouter** (router.tsx)
   - Cria instância do TanStack Router
   - Inicializa QueryClient

3. **RootComponent** (__root.tsx)
   - Configura QueryClientProvider
   - Configura AuthProvider
   - Monta Toaster e error boundaries

4. **SSR** (server.ts)
   - Renderiza componentes no servidor
   - Trata erros de renderização
   - Normaliza respostas H3

## Segurança

1. **Autenticação**
   - Supabase Auth com Policies de Row-Level Security (RLS)
   - Sessão armazenada seguramente

2. **Autorização**
   - Roles (admin, frentista) controlam acesso
   - RLS do Supabase reforça no DB

3. **Validação**
   - Zod schemas para todas as entradas
   - Supabase valida antes de persistir

4. **Variáveis de Ambiente**
   - `.env` com credenciais (nunca commitar)
   - `import.meta.env.VITE_*` para valores públicos

## Deploy

Suportado em:
- Vercel (recomendado)
- Cloudflare Workers
- Node.js servers
- Qualquer host com suporte a SSR

Build:
```bash
bun run build
```

## Troubleshooting

### Erro: "useAuth must be used inside AuthProvider"
- Certifique que o componente está dentro de `<AuthProvider>`
- Verifique se AuthProvider está em `__root.tsx`

### Dados não atualizam em tempo real
- Verifique se refetchInterval está configurado
- Força invalidate manual: `queryClient.invalidateQueries()`
- Veja staleTime vs gcTime

### Erro 401 em requisições
- Sessão expirou, faça logout e login novamente
- Verifique Supabase Auth settings

---

**Última atualização**: 29 de maio de 2026
