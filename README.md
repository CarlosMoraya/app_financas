
# Aplicativo Web de Finanças Pessoais

Este projeto é um aplicativo web completo para controle de finanças pessoais. Ele foi concebido com uma arquitetura moderna em Python e Next.js, empregando boas práticas de design, segurança, testes e qualidade de código. O objetivo é proporcionar uma base sólida e extensível para um SaaS de finanças pessoais ou um projeto educativo.

## Funcionalidades Principais

- **Autenticação multiusuário** via Supabase Auth (JWT).
- **Controle de receitas, despesas e transferências**.
- **Gerenciamento de contas** (carteira, banco, cartão, investimentos) com saldo inicial.
- **Categorias, subcategorias e tags** para classificação das transações.
- **Parcelamentos e recorrências** para compras parceladas e assinaturas.
- **Orçamento mensal por categoria (budget)** com alertas quando atingir limites.
- **Metas financeiras** com acompanhamento de progresso.
- **Dashboards e relatórios** (mensal, por categoria, por conta, por tag) com gráficos.
- **Importação e exportação CSV** das transações.
- **Busca e filtros avançados**.
- **Auditoria básica** (created_at/updated_at) e histórico opcional.
- **Boas práticas de UX**: validação, feedback, estados de carregamento.

## Arquitetura

O backend utiliza **FastAPI** com **SQLAlchemy 2.0 (async)** como ORM, **Alembic** para migrations e **Pydantic v2** para validação. A autenticação ocorre via Supabase Auth e os dados são armazenados em um Postgres compatível com Supabase, com políticas de Row Level Security (RLS) para garantir isolamento por usuário.

O frontend foi construído em **Next.js** com **TypeScript** e **Tailwind CSS**, consumindo a API do backend. Ele utiliza o SDK do Supabase para autenticação no navegador e compartilha os componentes de design definidos em `DESIGN.md`.

A estrutura de pastas e as regras de arquitetura estão descritas em `ARCHITECTURE.md` e no *Context Pack* (`/context_pack`).

## Pré-Requisitos

- Python 3.12+
- Node.js 18+
- Postgres (recomenda-se utilizar Supabase para autenticação e banco de dados)
- Docker (opcional) para execução simplificada

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto seguindo o exemplo `.env.example`. As principais variáveis são:

- `DATABASE_URL`: URL de conexão com o Postgres (por exemplo, a URL do banco no Supabase)
- `SUPABASE_JWKS_URL`: URL para buscar as chaves JWKS do Supabase
- `SUPABASE_JWT_AUDIENCE`: Público (audience) esperado nos tokens JWT
- `SUPABASE_URL` e `SUPABASE_ANON_KEY`: usados no frontend para inicializar o Supabase client
- `FRONTEND_URL`: URL do frontend (ex.: http://localhost:3000)
- `BACKEND_URL`: URL do backend (ex.: http://localhost:8000)

## Como executar localmente

1. **Clone o repositório** e entre na pasta do projeto:

   ```bash
   git clone <repo-url> finance_app
   cd finance_app
   ```

2. **Crie o ambiente virtual e instale as dependências do backend**:

   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Execute as migrações Alembic** e inicialize o banco de dados:

   ```bash
   alembic upgrade head
   ```

4. **Inicie o backend**:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Instale as dependências do frontend**:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Acesse** `http://localhost:3000` no navegador para utilizar o aplicativo.

### Utilizando Docker (opcional)

Você pode executar toda a stack com Docker utilizando o `docker-compose.yml` fornecido:

```bash
docker-compose up --build
```

Isso iniciará o banco Postgres, o backend FastAPI e o frontend Next.js.

## Documentação da API

A documentação automática do backend está disponível em `/docs` quando o servidor FastAPI está em execução. Para detalhes adicionais sobre os endpoints, consulte `API.md`.

## Contribuindo

Siga as diretrizes definidas em `CONTRIBUTING.md`. Utilize os hooks do `pre-commit` para garantir que o código segue os padrões de estilo (`ruff`, `black`), tipagem (`mypy`) e que os testes automatizados são executados.
