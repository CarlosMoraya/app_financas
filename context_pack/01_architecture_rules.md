
# Context Pack - Architecture Rules

- Separe API, services, repositories e models.
- Use sempre async com SQLAlchemy 2.0 e asyncpg.
- Filtre queries por `user_id` para reforçar RLS.
- Valide JWTs com JWKS do Supabase e faça cache.
- Use configurações via variáveis de ambiente (Pydantic Settings).
- Mantenha documentação atualizada ao modificar a API.
