# 📌 Posto Buriti - Sistema ERP de Gestão

Sistema completo de gerenciamento e monitoramento para Posto Buriti. Dashboard administrativo + painel do operador (frentista) com controle de estoque, movimentações e vendas em tempo real.

**Status**: ✅ Production Ready | **Última atualização**: 29 de maio de 2026

---

## 📚 Índice Rápido

- [Stack Tecnológico](#-stack-tecnológico)
- [Começar Rápido](#-começar-rápido)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura](#-arquitetura)
- [Banco de Dados](#-banco-de-dados)
- [Desenvolvimento](#-desenvolvimento)
- [Componentes](#-componentes)
- [Segurança](#-segurança)
- [Comandos](#-comandos-úteis)
- [Deploy](#-deploy)

---

## 🚀 Stack Tecnológico

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Router** - Roteamento
- **TailwindCSS** - Estilização
- **Shadcn/UI** - Componentes prontos
- **React Query** - Sincronização de dados
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Framer Motion** - Animações
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL (Banco de dados)
  - Auth (Autenticação de usuários)
  - RLS (Row-Level Security)
  - Edge Functions (Serverless)
  - Realtime (WebSockets)

### DevOps
- **Bun** - Runtime & Package Manager
- **TanStack Start** - SSR Framework
- **Cloudflare Workers** (suportado)

---

## ⚡ Começar Rápido

### Pré-requisitos
- Bun 1.0+ ou Node.js 18+
- Git
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd posto-buriti

# 2. Instale dependências
bun install

# 3. Configure ambiente
cp .env.example .env.local
# Preencha as variáveis com suas credenciais do Supabase
```

### Executar Localmente

```bash
# Desenvolvimento (hot reload)
bun run dev
# Acessa em http://localhost:5173

# Build para produção
bun run build

# Preview da build
bun run preview

# Lint
bun run lint

# Formatar código
bun run format
```

---

## 📁 Estrutura do Projeto

```
posto-buriti/
├── src/
│   ├── components/
│   │   ├── buriti/                    # Componentes de domínio
│   │   │   ├── AdminShell.tsx        # Layout admin principal
│   │   │   ├── DashboardCharts.tsx   # Gráficos
│   │   │   ├── FuelPumpCard.tsx      # Card de bomba
│   │   │   ├── FuelTankCard.tsx      # Card de tanque
│   │   │   ├── RecentMovements.tsx   # Movimentações recentes
│   │   │   ├── PageHeader.tsx        # Header padrão
│   │   │   ├── Logo.tsx              # Logo
│   │   │   └── Stat.tsx              # Estatísticas
│   │   └── ui/                        # Shadcn/UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       └── ... (30+ componentes)
│   │
│   ├── hooks/                         # Custom hooks
│   │   ├── use-products.ts           # CRUD + movimentação de produtos
│   │   ├── use-categories.ts         # Gerenciamento de categorias
│   │   ├── use-movements.ts          # Histórico de movimentações
│   │   └── use-mobile.tsx            # Detector de mobile
│   │
│   ├── lib/
│   │   ├── auth.tsx                  # Autenticação + Context
│   │   ├── query-client.ts           # Config React Query
│   │   ├── config.server.ts          # Config de servidor
│   │   ├── utils.ts                  # Utilidades (cn, etc)
│   │   ├── error-page.ts             # Página de erro
│   │   ├── error-capture.ts          # Captura de erros
│   │   ├── employees.functions.ts    # Funções de funcionários
│   │   ├── users.functions.ts        # Funções de usuários
│   │   └── api/                      # Chamadas de API
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts             # Cliente Supabase
│   │       ├── types.ts              # Types gerados
│   │       └── auth-attacher.ts      # Middleware de auth
│   │
│   ├── routes/                        # TanStack Router
│   │   ├── __root.tsx               # Layout raiz
│   │   ├── _authenticated.tsx        # Layout protegido
│   │   ├── login.tsx                 # Página de login
│   │   ├── admin.tsx                 # Dashboard admin
│   │   ├── operador.tsx              # Painel frentista
│   │   ├── index.tsx                 # Home
│   │   └── _authenticated/           # Rotas protegidas
│   │
│   ├── router.tsx                     # Configuração do router
│   ├── start.ts                       # Inicialização TanStack Start
│   ├── server.ts                      # Handler SSR
│   ├── styles.css                     # Estilos globais
│   └── routeTree.gen.ts              # Gerado automaticamente
│
├── supabase/
│   ├── config.toml                   # Config local Supabase
│   ├── migrations/                    # Migrações do DB
│   │   └── [timestamps]_*.sql
│   └── functions/                     # Edge Functions
│       └── create-backup/
│
├── .env.example                       # Template de env vars
├── .gitignore                         # Arquivos ignorados
├── package.json                       # Dependências
├── tsconfig.json                      # Config TypeScript
├── vite.config.ts                     # Config Vite
├── bunfig.toml                        # Config Bun
├── eslint.config.js                  # Config ESLint
└── README.md                          # Este arquivo
```

---

## 🏗️ Arquitetura

### Fluxo de Autenticação

```
1. Usuário acessa /login
   ↓
2. Digita código (ex: "5") + PIN
   ↓
3. Sistema converte "5" → "f05@buriti.local"
   ↓
4. Autentica no Supabase Auth
   ↓
5. AuthProvider carrega role da tabela user_roles
   ↓
6. Redireciona para /operador ou /admin conforme role
```

### Fluxo de Dados (React Query)

```
Componente
    ↓
Custom Hook (useProducts, useCategories, etc)
    ↓
useQuery / useMutation (React Query)
    ↓
Supabase Client
    ↓
PostgreSQL Database
```

### Stack em Diagrama

```
┌─────────────────────────────────────────┐
│    Browser / Client (React 19)          │
├─────────────────────────────────────────┤
│ • Components (UI + Domínio)             │
│ • Hooks customizados                    │
│ • React Query (cache de dados)          │
│ • TanStack Router (navegação)           │
└─────────────────────────────────────────┘
              ↕ HTTPS
┌─────────────────────────────────────────┐
│  TanStack Start (SSR / Backend)         │
├─────────────────────────────────────────┤
│ • Middlewares (auth, error handling)    │
│ • Server functions                      │
└─────────────────────────────────────────┘
              ↕ REST/WebSocket
┌─────────────────────────────────────────┐
│    Supabase (Backend-as-a-Service)      │
├─────────────────────────────────────────┤
│ • PostgreSQL (Database)                 │
│ • Auth (Usuários + JWT)                 │
│ • RLS (Row-Level Security)              │
│ • Realtime (WebSockets)                 │
│ • Edge Functions (Serverless)           │
└─────────────────────────────────────────┘
```

### Modelos de Dados Principais

**Products (Produtos)**
```typescript
{
  id: string;
  name: string;                 // Nome do produto
  category: string | null;      // Categoria
  internal_code: string | null; // Código interno
  sale_price: number;           // Preço de venda
  cost_price: number;           // Preço de custo
  pista_qty: number;            // Quantidade na pista
  estoque_qty: number;          // Quantidade no estoque
  pista_min: number;            // Mínimo recomendado pista
  estoque_min: number;          // Mínimo recomendado estoque
  brand: string | null;
  barcode: string | null;
}
```

**Movements (Movimentações)**
```typescript
{
  id: string;
  product_id: string;           // Qual produto
  type: "entrada" | "saida" | "transferencia";
  quantity: number;             // Quantidade movida
  location: "pista" | "estoque"; // Para onde foi
  user_id: string;              // Quem fez
  created_at: timestamp;
}
```

**User Roles (Permissões)**
```typescript
{
  id: string;
  user_id: string;
  role: "admin" | "frentista";  // Tipo de acesso
}
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

```sql
-- Usuários e permissões
users (id, email, created_at)
user_roles (user_id, role)

-- Catálogo
categories (id, name, description)
products (id, name, category, prices, quantities)

-- Histórico
movements (id, product_id, type, quantity, location, user_id)

-- Configuração
app_settings (key, value)

-- Opcional
fuel_tanks (id, name, capacity, current_level)
fuel_pumps (id, name, status, total_sales)
```

### Row-Level Security (RLS)

Políticas garantem que usuários só acessem o que devem:

```
Products:
  ✅ Todos podem LER
  ✅ Apenas ADMIN pode CRIAR/ATUALIZAR/DELETAR

Movements:
  ✅ Todos podem LER
  ✅ Apenas ADMIN pode CRIAR
  ❌ Ninguém pode ATUALIZAR/DELETAR (auditoria)

Categories:
  ✅ Todos podem LER
  ✅ Apenas ADMIN pode CRIAR/ATUALIZAR/DELETAR
```

### Migrações

```bash
# Criar nova migração
supabase migration new nome_descritivo

# Aplicar migrações
supabase db push

# Puxar schema remoto
supabase db pull

# Gerar tipos TypeScript
supabase gen types typescript > src/integrations/supabase/types.ts
```

---

## 💻 Desenvolvimento

### Padrão de Hook para CRUD

```typescript
// src/hooks/use-novo-recurso.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useNovoRecurso() {
  const queryClient = useQueryClient();

  // Query: Listar
  const query = useQuery({
    queryKey: ["novo-recurso"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tabela")
        .select("*");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutation: Salvar
  const saveMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: any; id?: string }) => {
      const { error } = id
        ? await supabase.from("tabela").update(payload).eq("id", id)
        : await supabase.from("tabela").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["novo-recurso"] });
      toast.success("Salvo com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
```

### Adicionar Nova Rota

```typescript
// src/routes/minha-pagina.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/minha-pagina")({
  head: () => ({
    meta: [{ title: "Minha Página | Posto Buriti" }],
  }),
  component: MinhaPage,
});

function MinhaPage() {
  return (
    <div>
      {/* Conteúdo */}
    </div>
  );
}
```

### Usar Hook em Componente

```typescript
function MeuComponente() {
  const { data, isLoading, save, isSaving } = useNovoRecurso();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      {data?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={() => save({ payload: { name: "Novo" } })}>
        {isSaving ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
```

### Validação com Zod

```typescript
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  preco: z.coerce.number().min(0, "Não pode ser negativo"),
});

// Use em formulário
const form = useForm({
  resolver: zodResolver(schema),
});

// Ou valide manualmente
const resultado = schema.safeParse(dados);
if (!resultado.success) {
  console.error(resultado.error);
}
```

### Autenticação

```typescript
import { useAuth } from "@/lib/auth";

function MeuComponente() {
  const { user, role, loading, signOut } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Não autenticado</div>;

  return (
    <div>
      <p>Olá, {user.email}</p>
      <p>Role: {role}</p> {/* "admin" ou "frentista" */}
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Proteção de Rotas

Use layout `_authenticated` para rotas protegidas:

```
src/routes/
├── _authenticated.tsx           # Layout - valida autenticação
└── _authenticated/
    ├── dashboard.tsx            # Rotas protegidas
    ├── produtos.tsx
    └── ...
```

### Padrões Importantes

```typescript
// ❌ RUIM: sem type e componente gigante
function Dashboard() {
  const [dados, setDados] = useState([]);
  // 500 linhas de código
  return <div>{/* tudo aqui */}</div>;
}

// ✅ BOM: tipado e modular
interface DashboardProps {
  userId: string;
}

function Dashboard({ userId }: DashboardProps) {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <StatRow />
      <DashboardCharts />
    </div>
  );
}
```

---

## 🎨 Componentes

### Shadcn/UI Disponíveis

Temos 30+ componentes prontos em `src/components/ui/`:

```
Button, Card, Input, Dialog, Sheet, Popover, DropdownMenu,
Alert, Badge, Breadcrumb, Calendar, Carousel, Checkbox,
Collapsible, Command, ContextMenu, DatePicker, Form,
HoverCard, Label, Menubar, NavigationMenu, Progress,
ScrollArea, Select, Separator, Skeleton, Switch, Table,
Tabs, Textarea, Tooltip, ...
```

### Componentes de Domínio

```typescript
// Layout admin
import { AdminShell } from "@/components/buriti/AdminShell";

// Gráficos
import { DashboardCharts } from "@/components/buriti/DashboardCharts";

// Cards de status
import { FuelTankCard } from "@/components/buriti/FuelTankCard";
import { FuelPumpCard } from "@/components/buriti/FuelPumpCard";

// Dados recentes
import { RecentMovements } from "@/components/buriti/RecentMovements";

// Cabeçalho padrão
import { PageHeader } from "@/components/buriti/PageHeader";

// Estatísticas
import { Stat } from "@/components/buriti/Stat";

// Logo
import { BuritiLogo } from "@/components/buriti/Logo";
```

### Exemplo de Composição

```typescript
function Dashboard() {
  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Visão geral do posto"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Receita" value="R$ 25.430" change={12.5} />
        <Stat label="Produtos" value="1.250" />
        <Stat label="Movimentações" value="87" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <FuelTankCard 
          id="tank-1"
          name="Tanque Gasolina"
          currentLevel={850}
          capacity={1000}
        />
        <FuelPumpCard 
          id="pump-1"
          name="Bomba 01"
          status="active"
          totalSales={15230.50}
        />
      </div>

      <DashboardCharts timeRange="30d" />
      <RecentMovements limit={5} />
    </>
  );
}
```

---

## 🔒 Segurança

### Proteção de Dados

✅ **`.gitignore` atualizado com:**
- `.env` e variantes (nunca commitar)
- `supabase/.env.local`
- `node_modules`, `dist`, outputs
- Cache do sistema

✅ **Variáveis de Ambiente:**
- Use `.env.local` (não commitado)
- Crie `.env.example` com template
- Prefixe públicas com `VITE_`

✅ **Autenticação:**
- Supabase Auth com JWT
- Roles controlam acesso
- RLS reforça no banco

✅ **Validação:**
- Zod para entrada de dados
- Supabase valida antes de persistir
- TypeScript para type safety

### Checklist Antes de Deploy

- [ ] `.env.local` configurado
- [ ] Secrets não expostos no código
- [ ] RLS policies ativas no Supabase
- [ ] Migrações aplicadas
- [ ] Build sem erros: `bun run build`
- [ ] Lint OK: `bun run lint`
- [ ] README atualizado
- [ ] Credenciais Supabase corretas

---

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Servidor com hot reload
bun run dev

# Build produção
bun run build

# Preview da build
bun run preview

# Lint/format
bun run lint
bun run format
```

### Banco de Dados

```bash
# Nova migração
supabase migration new minha_migracao

# Aplicar migrações
supabase db push

# Gerar tipos
supabase gen types typescript > src/integrations/supabase/types.ts
```

### Git

```bash
# Verificar status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: descrição da mudança"

# Push
git push origin main
```

### Bun

```bash
# Instalar dependências
bun install

# Adicionar pacote
bun add pacote-nome

# Dev dependency
bun add -d pacote-nome

# Atualizar tudo
bun update
```

### Debug

```bash
# Ver processo em porta
lsof -i :5173

# Matar processo
kill -9 <PID>

# Check tipos
bun --bun tsc --noEmit

# Limpar tudo
rm -rf node_modules dist .output && bun install && bun run build
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar CLI
bun add -g vercel

# Deploy
vercel

# Produção
vercel --prod
```

### Configurar Variáveis de Ambiente

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Vá em Settings → Environment Variables
3. Adicione:
   ```
   VITE_SUPABASE_URL=https://...supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

### Outras Plataformas

- **Netlify**: Suporte nativo a Vite
- **Cloudflare Workers**: Suportado via TanStack Start
- **Node.js Servers**: Build com `bun run build`

---

## 📖 Convenções de Código

### Nomes

```typescript
// Componentes: PascalCase
function AdminShell() {}

// Hooks: camelCase com prefixo use-
function useProducts() {}

// Variáveis: camelCase
const currentUser = {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "https://...";

// Arquivos componentes: kebab-case
// admin-shell.tsx, page-header.tsx
```

### Commits

```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
style: muda formatação (sem lógica)
refactor: refatora sem mudar comportamento
test: adiciona testes
chore: atualizações de dependências
```

Exemplo: `git commit -m "feat: adiciona listagem de categorias"`

### Estrutura de Arquivos

```
src/
├── components/        # React components
├── hooks/            # Custom hooks (useX pattern)
├── lib/              # Utilidades e config
├── routes/           # Páginas (TanStack Router)
├── integrations/     # Serviços externos
└── types/            # Tipos TypeScript (se houver)
```

---

## 🎓 Aprendizado Rápido

Se é novo no projeto:

1. **Leia esta seção** (10 min)
2. **Explore o código** de uma rota existente (10 min)
3. **Rode o servidor**: `bun run dev` (2 min)
4. **Faça login** com código `1` + PIN qualquer (2 min)
5. **Adicione um campo** a um formulário (30 min)
6. **Leia o banco de dados** para entender RLS (15 min)

**Total**: ~70 minutos para estar produtivo!

---

## 🆘 Troubleshooting

### "useAuth must be used inside AuthProvider"
→ Verifique se componente está dentro de `<AuthProvider>` em `__root.tsx`

### Dados não atualizam em tempo real
→ Aumentar `staleTime` ou forçar invalidate: `queryClient.invalidateQueries()`

### Erro 401 em requisições
→ Sessão expirou, faça logout e login novamente

### Port 5173 em uso
→ `lsof -i :5173` depois `kill -9 <PID>`

### Build falha com TypeScript
→ `bun --bun tsc --noEmit` para verificar erros

---

## 📞 Suporte

- 📖 Leia a documentação completa em `DOCS.md`
- 🏗️ Arquitetura detalhada em `ARCHITECTURE.md`
- 🗄️ DB schema em `DATABASE.md`
- 🎨 Componentes em `COMPONENTS.md`
- ⌨️ Comandos em `COMMANDS.md`
- 💻 Dev guide em `DEVELOPMENT.md`

---

## 📄 Licença

Propriedade privada - Posto Buriti

---

## ✨ Desenvolvido com

React 19 • TypeScript • Supabase • TailwindCSS • Shadcn/UI • Bun

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Update**: 29 de maio de 2026
