
# Context Pack - Data Model

Resumo das principais tabelas:

- `accounts`: id, user_id, name, type, currency, initial_balance, timestamps
- `categories`: id, user_id, name, parent_id, type, timestamps
- `tags`: id, user_id, name, timestamps
- `transactions`: id, user_id, account_id, type, amount, date, description, category_id, merchant, metadata, timestamps
- `recurring_rules`: id, user_id, pattern, interval, next_run, timestamps
- `budgets`: id, user_id, month (1º dia), category_id, limit_amount, timestamps
- `goals`: id, user_id, name, target_amount, target_date, timestamps
