
# Guia de Configuração do Supabase

1. Crie um projeto no Supabase e anote a URL e a anon key.
2. Configure as variáveis de ambiente `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWKS_URL` e `SUPABASE_JWT_AUDIENCE`.
3. Habilite Row Level Security (RLS) para as tabelas criadas e aplique as políticas definidas em `backend/supabase_setup.sql`.
4. Altere o arquivo `.env.example` com as informações do seu projeto Supabase.
