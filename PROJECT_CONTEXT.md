# Memória do Projeto: Moraya's Finance

Este documento serve como a "memória" do sistema para garantir que mudanças futuras mantenham a consistência da arquitetura.

## 🏗️ Arquitetura do Sistema
O projeto é um Monorepo dividido em duas partes principais:

### 1. Frontend (Pasta `/frontend`)
- **Framework:** Next.js (Pages Router) + Tailwind CSS.
- **Autenticação:** Supabase Auth (@supabase/auth-helpers-react).
- **Comunicação:** Utiliza a variável `NEXT_PUBLIC_API_URL` para falar com o Backend.
- **Deploy:** Hospedado na **Vercel**.

### 2. Backend (Pasta `/backend`)
- **Framework:** FastAPI (Python).
- **Banco de Dados:** PostgreSQL hospedado no **Supabase**.
- **ORM:** SQLAlchemy com suporte assíncrono (`asyncpg`).
- **Deploy:** Hospedado na **Render**.
- **Configuração Crítica:** As configurações são lidas em `app/core/config.py` com `case_sensitive=False` para compatibilidade com o deploy.

## 🛠️ Detalhes Técnicos Importantes (O "Pulo do Gato")

- **Conflito de Nomes:** No modelo `Transaction`, o atributo `tx_metadata` mapeia para a coluna `metadata` no banco. Isso foi feito porque `metadata` é uma palavra reservada do SQLAlchemy e causava erro de deploy.
- **Auth Flow:** O frontend valida o token no Supabase e o envia no Header das requisições para o Backend. O Backend valida o JWT usando a JWKS URL do Supabase.
- **CORS:** Configurado no `main.py` para aceitar origens dinâmicas, permitindo a comunicação entre Vercel e Render.

## 🔐 Variáveis de Ambiente Necessárias

### Para o Frontend (Vercel):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (Link do backend na Render)

### Para o Backend (Render):
- `DATABASE_URL` (Link PostgreSQL +asyncpg)
- `SUPABASE_JWKS_URL`
- `SUPABASE_JWT_AUDIENCE` (Geralmente 'authenticated')

## 🚀 Como continuar o projeto daqui a 3 meses?
1. Peça para a IA ler este arquivo `PROJECT_CONTEXT.md`.
2. O código de "Login" já foi limpo (removido o modo Preview).
3. O Backend já está rodando com migrations do Alembic.

---
*Ultima atualização: 29 de Janeiro de 2026*
