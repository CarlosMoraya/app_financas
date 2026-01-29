
# Context Pack - API Contract

- Todas as rotas estão sob `/api/v1`.
- Coleções: `GET /resource` lista; `POST /resource` cria.
- Itens: `GET /resource/{id}`, `PUT /resource/{id}`, `DELETE /resource/{id}`.
- Filtros via query params: `?start_date=&end_date=&account_id=&category_id=`.
- JWT obrigatório em `Authorization`.
