# Frontend - FinanceApp

Frontend profissional e moderno para o aplicativo de finanças pessoais, construído com Next.js, TypeScript e Tailwind CSS.

## 🎨 Design System

O aplicativo utiliza um design system completo com:

- **Cores personalizadas** (indigo, green, red, purple para diferentes contextos)
- **Componentes reutilizáveis** (cards, buttons, inputs)
- **Animações suaves** (fade-in, slide-in, hover effects)
- **Layout responsivo** com menu lateral retrátil
- **Tipografia moderna** (Inter font)

## 📱 Páginas Implementadas

### 1. **Login** (`/login`)
- Design split-screen com hero section
- Modo Preview para visualização sem autenticação
- Validação de formulário
- Estados de loading

### 2. **Dashboard** (`/dashboard`)
- Cards de resumo financeiro (Saldo, Receitas, Despesas, Economia)
- Lista de contas com ícones personalizados
- Transações recentes
- Placeholder para gráficos

### 3. **Transações** (`/transactions`)
- Listagem completa de transações
- Filtros por tipo (Receitas/Despesas)
- Modal para adicionar nova transação
- Estatísticas de receitas e despesas
- Ações de editar e excluir

### 4. **Contas** (`/accounts`)
- Grid de contas com cards visuais
- Resumo de patrimônio líquido, ativos e passivos
- Modal para criar nova conta
- Ações por conta (Ver Extrato, Transferir)

### 5. **Categorias** (`/categories`)
- Grid de categorias com ícones coloridos
- Filtros por tipo (Receitas/Despesas)
- Estatísticas por categoria
- Modal com seleção de ícones

### 6. **Orçamentos** (`/budgets`)
- Lista de orçamentos com barras de progresso
- Indicadores de status (Saudável, Atenção, Crítico, Excedido)
- Resumo de orçamento total, gasto e disponível
- Modal para criar novo orçamento

### 7. **Metas** (`/goals`)
- Cards de metas com gradientes coloridos
- Barras de progresso visual
- Contador de dias restantes
- Resumo de meta total, economizado e faltante

### 8. **Relatórios** (`/reports`)
- Gráficos de evolução mensal
- Distribuição de despesas por categoria
- Tabela detalhada com estatísticas
- Filtros por período (Semana/Mês/Ano)
- Exportação para PDF

## 🎯 Componentes

### Layout
Componente principal que envolve todas as páginas autenticadas:
- Menu lateral com navegação
- Header com título da página
- Área de conteúdo responsiva
- Botão de logout

## 🚀 Como Usar

### Modo Preview (Sem Backend)
1. Acesse `http://localhost:3000`
2. Clique em "Entrar em Modo Preview"
3. Navegue por todas as funcionalidades com dados mock

### Modo Produção (Com Supabase)
1. Configure as variáveis de ambiente no `.env`
2. Faça login com credenciais válidas
3. O app se conectará ao backend e Supabase

## 🎨 Customização

### Cores
As cores principais podem ser alteradas em `styles/globals.css`:
```css
--color-primary: #6366f1;
--color-success: #10b981;
--color-error: #ef4444;
```

### Componentes
Todos os componentes utilizam classes do Tailwind CSS e podem ser facilmente customizados.

## 📦 Estrutura de Arquivos

```
frontend/
├── components/
│   └── Layout.tsx          # Layout principal com sidebar
├── pages/
│   ├── _app.tsx           # Configuração do app
│   ├── index.tsx          # Redirecionamento
│   ├── login.tsx          # Página de login
│   ├── dashboard.tsx      # Dashboard principal
│   ├── transactions.tsx   # Gerenciamento de transações
│   ├── accounts.tsx       # Gerenciamento de contas
│   ├── categories.tsx     # Gerenciamento de categorias
│   ├── budgets.tsx        # Orçamentos mensais
│   ├── goals.tsx          # Metas financeiras
│   └── reports.tsx        # Relatórios e análises
└── styles/
    └── globals.css        # Estilos globais e design system
```

## 🔧 Tecnologias

- **Next.js 13** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase Auth Helpers** - Autenticação

## 💡 Próximos Passos

- [ ] Integração completa com backend
- [ ] Gráficos interativos (Chart.js ou Recharts)
- [ ] Modo escuro
- [ ] Notificações em tempo real
- [ ] PWA (Progressive Web App)
- [ ] Testes unitários e E2E
