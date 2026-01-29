
# Segurança

Este documento resume os mecanismos de segurança empregados no aplicativo.

## Autenticação

- **Supabase Auth**: o frontend autentica usuários utilizando o Supabase Auth. O usuário obtém um `access_token` (JWT) que é enviado ao backend em cada requisição.
- **Validação de JWT**: o backend utiliza o módulo `security.py` para validar o token. O JWKS é obtido a partir do Supabase (`SUPABASE_JWKS_URL`) e armazenado em cache. O token deve conter o `aud` configurado em `SUPABASE_JWT_AUDIENCE` e não estar expirado.

## Autorização e RLS

- **Row Level Security (RLS)**: todas as tabelas possuem a coluna `user_id` e políticas em nível de linha que permitem que usuários acessem apenas seus registros. Essas policies estão definidas em `backend/supabase_setup.sql`.
- **Filtros no Código**: os repositórios filtram queries por `user_id` para reforçar a RLS e evitar IDOR (insecure direct object reference).

## Práticas Adicionais

- **CORS**: configurado para permitir somente origens confiáveis definidas via variável de ambiente.
- **Headers de Segurança**: o FastAPI é configurado para incluir cabeçalhos como `Strict-Transport-Security`, `X-Content-Type-Options` e `X-Frame-Options`.
- **Validação de Entrada**: todas as entradas passam por modelos Pydantic e validações do SQLAlchemy para evitar injeção de SQL e outros ataques.
