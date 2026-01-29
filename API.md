
# API Reference

Esta referência descreve os principais endpoints da versão 1 da API (`/api/v1`). A API segue um padrão RESTful e utiliza tokens JWT (Bearer) para autenticação. Todas as rotas exigem que o cabeçalho `Authorization: Bearer <jwt>` seja enviado, exceto quando indicado.

> **Nota:** A documentação completa e interativa (OpenAPI/Swagger) é gerada automaticamente pelo FastAPI em `/docs`. Este documento complementa essa referência com exemplos e explicações adicionais.

## Autenticação e Perfil

O backend confia no Supabase Auth para autenticar usuários. O cliente deve obter o token de acesso (`access_token`) através do Supabase SDK e enviá-lo no cabeçalho `Authorization`. Não há endpoints de login ou registro no backend, pois essa etapa ocorre no Supabase.

### Obter Usuário Atual

Retorna informações básicas do usuário extraídas do token.

- **GET /api/v1/users/me**

**Resposta 200**

```json
{
  "id": "uuid",
  "email": "usuario@exemplo.com"
}
```

## Contas (`/accounts`)

### Listar contas

- **GET /api/v1/accounts**

Retorna todas as contas do usuário atual.

### Criar conta

- **POST /api/v1/accounts**

Envia os dados da conta:

```json
{
  "name": "Nubank",
  "type": "credit",
  "currency": "BRL",
  "initial_balance": 0.0
}
```

## Categorias (`/categories`)

### Listar categorias

- **GET /api/v1/categories**

### Criar categoria

- **POST /api/v1/categories**

Envia:

```json
{
  "name": "Alimentação",
  "type": "expense",
  "parent_id": null
}
```

## Transações (`/transactions`)

### Listar transações

- **GET /api/v1/transactions?start_date=2025-01-01&end_date=2025-01-31&account_id=1**

### Criar transação

- **POST /api/v1/transactions**

```json
{
  "account_id": 1,
  "type": "expense",
  "amount": 50.75,
  "date": "2025-05-10",
  "description": "Supermercado",
  "category_id": 3,
  "tags": ["mercado", "casa"]
}
```

## Orçamentos (`/budgets`)

### Listar orçamentos

- **GET /api/v1/budgets?month=2025-05-01**

### Criar ou atualizar budget

- **POST /api/v1/budgets**

```json
{
  "month": "2025-05-01",
  "category_id": 3,
  "limit_amount": 500.0
}
```

Para obter mais detalhes sobre todos os endpoints (incluindo metas, parcelamentos, recorrências e importação de CSV), consulte a documentação automática ou o código-fonte em `app/api`.
