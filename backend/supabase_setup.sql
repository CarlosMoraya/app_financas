
create extension if not exists "uuid-ossp";

alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.tags enable row level security;
alter table public.goals enable row level security;

create policy "accounts_select" on public.accounts for select using (user_id = auth.uid());
create policy "accounts_insert" on public.accounts for insert with check (user_id = auth.uid());
create policy "accounts_update" on public.accounts for update using (user_id = auth.uid());
create policy "accounts_delete" on public.accounts for delete using (user_id = auth.uid());

create policy "categories_select" on public.categories for select using (user_id = auth.uid());
create policy "categories_insert" on public.categories for insert with check (user_id = auth.uid());
create policy "categories_update" on public.categories for update using (user_id = auth.uid());
create policy "categories_delete" on public.categories for delete using (user_id = auth.uid());

create policy "transactions_select" on public.transactions for select using (user_id = auth.uid());
create policy "transactions_insert" on public.transactions for insert with check (user_id = auth.uid());
create policy "transactions_update" on public.transactions for update using (user_id = auth.uid());
create policy "transactions_delete" on public.transactions for delete using (user_id = auth.uid());

create policy "budgets_select" on public.budgets for select using (user_id = auth.uid());
create policy "budgets_insert" on public.budgets for insert with check (user_id = auth.uid());
create policy "budgets_update" on public.budgets for update using (user_id = auth.uid());
create policy "budgets_delete" on public.budgets for delete using (user_id = auth.uid());
