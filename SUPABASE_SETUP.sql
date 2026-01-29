-- =============================================
-- FINANCE APP - SUPABASE SETUP COMPLETO
-- =============================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- =============================================
-- TABELAS
-- =============================================

-- Tabela de Contas
create table if not exists public.accounts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash', 'checking', 'savings', 'investment', 'credit')),
  currency text not null default 'BRL',
  initial_balance numeric(15,2) not null default 0,
  current_balance numeric(15,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Categorias
create table if not exists public.categories (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  parent_id bigint references public.categories(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Transações
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id bigint references public.accounts(id) on delete cascade not null,
  category_id bigint references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(15,2) not null,
  description text not null,
  date date not null,
  status text not null default 'completed' check (status in ('completed', 'pending', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Orçamentos
create table if not exists public.budgets (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id bigint references public.categories(id) on delete cascade not null,
  amount numeric(15,2) not null,
  period_start date not null,
  period_end date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Metas
create table if not exists public.goals (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(15,2) not null,
  current_amount numeric(15,2) not null default 0,
  deadline date,
  icon text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Tags
create table if not exists public.tags (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

-- Tabela de relacionamento Transações-Tags
create table if not exists public.transaction_tags (
  transaction_id bigint references public.transactions(id) on delete cascade not null,
  tag_id bigint references public.tags(id) on delete cascade not null,
  primary key (transaction_id, tag_id)
);

-- =============================================
-- ÍNDICES para melhor performance
-- =============================================

create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_account_id on public.transactions(account_id);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_tags_user_id on public.tags(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.tags enable row level security;
alter table public.transaction_tags enable row level security;

-- Políticas para ACCOUNTS
create policy "accounts_select" on public.accounts for select using (user_id = auth.uid());
create policy "accounts_insert" on public.accounts for insert with check (user_id = auth.uid());
create policy "accounts_update" on public.accounts for update using (user_id = auth.uid());
create policy "accounts_delete" on public.accounts for delete using (user_id = auth.uid());

-- Políticas para CATEGORIES
create policy "categories_select" on public.categories for select using (user_id = auth.uid());
create policy "categories_insert" on public.categories for insert with check (user_id = auth.uid());
create policy "categories_update" on public.categories for update using (user_id = auth.uid());
create policy "categories_delete" on public.categories for delete using (user_id = auth.uid());

-- Políticas para TRANSACTIONS
create policy "transactions_select" on public.transactions for select using (user_id = auth.uid());
create policy "transactions_insert" on public.transactions for insert with check (user_id = auth.uid());
create policy "transactions_update" on public.transactions for update using (user_id = auth.uid());
create policy "transactions_delete" on public.transactions for delete using (user_id = auth.uid());

-- Políticas para BUDGETS
create policy "budgets_select" on public.budgets for select using (user_id = auth.uid());
create policy "budgets_insert" on public.budgets for insert with check (user_id = auth.uid());
create policy "budgets_update" on public.budgets for update using (user_id = auth.uid());
create policy "budgets_delete" on public.budgets for delete using (user_id = auth.uid());

-- Políticas para GOALS
create policy "goals_select" on public.goals for select using (user_id = auth.uid());
create policy "goals_insert" on public.goals for insert with check (user_id = auth.uid());
create policy "goals_update" on public.goals for update using (user_id = auth.uid());
create policy "goals_delete" on public.goals for delete using (user_id = auth.uid());

-- Políticas para TAGS
create policy "tags_select" on public.tags for select using (user_id = auth.uid());
create policy "tags_insert" on public.tags for insert with check (user_id = auth.uid());
create policy "tags_update" on public.tags for update using (user_id = auth.uid());
create policy "tags_delete" on public.tags for delete using (user_id = auth.uid());

-- Políticas para TRANSACTION_TAGS
create policy "transaction_tags_select" on public.transaction_tags for select 
  using (exists (select 1 from public.transactions where id = transaction_id and user_id = auth.uid()));
create policy "transaction_tags_insert" on public.transaction_tags for insert 
  with check (exists (select 1 from public.transactions where id = transaction_id and user_id = auth.uid()));
create policy "transaction_tags_delete" on public.transaction_tags for delete 
  using (exists (select 1 from public.transactions where id = transaction_id and user_id = auth.uid()));

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
create trigger set_updated_at before update on public.accounts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.transactions
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.budgets
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.goals
  for each row execute function public.handle_updated_at();

-- Função para atualizar saldo da conta após transação
create or replace function public.update_account_balance()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.type = 'income' then
      update public.accounts set current_balance = current_balance + new.amount where id = new.account_id;
    elsif new.type = 'expense' then
      update public.accounts set current_balance = current_balance - new.amount where id = new.account_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    -- Reverter transação antiga
    if old.type = 'income' then
      update public.accounts set current_balance = current_balance - old.amount where id = old.account_id;
    elsif old.type = 'expense' then
      update public.accounts set current_balance = current_balance + old.amount where id = old.account_id;
    end if;
    -- Aplicar nova transação
    if new.type = 'income' then
      update public.accounts set current_balance = current_balance + new.amount where id = new.account_id;
    elsif new.type = 'expense' then
      update public.accounts set current_balance = current_balance - new.amount where id = new.account_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.type = 'income' then
      update public.accounts set current_balance = current_balance - old.amount where id = old.account_id;
    elsif old.type = 'expense' then
      update public.accounts set current_balance = current_balance + old.amount where id = old.account_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar saldo
create trigger update_balance after insert or update or delete on public.transactions
  for each row execute function public.update_account_balance();

-- =============================================
-- DADOS INICIAIS (Categorias Padrão)
-- =============================================

-- Nota: Estas categorias serão criadas para cada usuário quando ele se registrar
-- Você pode criar uma função para isso ou adicionar via aplicação

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View para resumo mensal
create or replace view public.monthly_summary as
select 
  user_id,
  date_trunc('month', date) as month,
  sum(case when type = 'income' then amount else 0 end) as total_income,
  sum(case when type = 'expense' then amount else 0 end) as total_expense,
  sum(case when type = 'income' then amount else -amount end) as net_balance
from public.transactions
where status = 'completed'
group by user_id, date_trunc('month', date);

-- View para gastos por categoria
create or replace view public.expenses_by_category as
select 
  t.user_id,
  c.name as category_name,
  c.icon,
  c.color,
  sum(t.amount) as total_amount,
  count(t.id) as transaction_count
from public.transactions t
join public.categories c on t.category_id = c.id
where t.type = 'expense' and t.status = 'completed'
group by t.user_id, c.id, c.name, c.icon, c.color;

-- =============================================
-- CONCLUÍDO!
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- Depois configure as variáveis de ambiente no .env
