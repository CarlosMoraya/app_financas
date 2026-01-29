
# Arquitetura do Projeto

Este documento descreve as principais decisões arquiteturais adotadas no desenvolvimento do aplicativo de finanças pessoais.

## Camadas

O backend segue uma arquitetura em camadas para promover separação de responsabilidades e facilitar manutenção:

- **API (`app/api`)**: define os *routers* do FastAPI e expõe os endpoints HTTP. Cada endpoint utiliza esquemas (Pydantic) para validação de entrada e saída e injeta dependências para autenticação e acesso à base de dados.
- **Core (`app/core`)**: contém configurações globais, definições de segurança (decodificação do JWT), configuração de logging e utilidades comuns.
- **DB (`app/db`)**: abstrai a configuração do SQLAlchemy, a criação da *engine*, a sessão assíncrona e a configuração das migrações Alembic.
- **Models (`app/models`)**: define as entidades do domínio utilizando SQLAlchemy 2.0 com mapeamento declarativo. Todas as tabelas incluem a coluna `user_id` (UUID) para permitir Row Level Security.
- **Schemas (`app/schemas`)**: define os modelos Pydantic usados para validação e serialização/deserialização. Há esquemas para entrada (`Create`/`Update`) e saída (`Read`).
- **Repositories (`app/repositories`)**: encapsulam a lógica de acesso aos dados. Recebem a sessão do banco via *dependency injection* e expõem métodos CRUD assíncronos.
- **Services (`app/services`)**: contêm a lógica de negócios. Podem utilizar múltiplos repositórios e aplicar regras como validação de orçamentos e geração de recorrências.
- **Tasks (`app/tasks`)**: responsável por jobs agendados, como a geração de transações recorrentes.

## Fluxo de Requisição

1. O cliente faz uma chamada HTTP para o backend com um `Authorization: Bearer <JWT>`.
2. O **router** determina qual função manipulará a requisição e injeta as dependências (sessão de banco de dados e usuário atual). O `deps.get_current_user` valida e decodifica o JWT utilizando as chaves JWKS do Supabase e extrai o `user_id`.
3. O **serviço** correspondente realiza verificações de negócio (ex.: se o usuário possui saldo suficiente) e chama o **repositório** para executar operações de banco.
4. O **repositório** interage com a sessão assíncrona do SQLAlchemy para criar, consultar, atualizar ou excluir registros. As consultas sempre filtram por `user_id` para reforçar a RLS.
5. O resultado é retornado ao cliente através de um esquema Pydantic.

## Observabilidade

- **Logs estruturados**: configurados via `logging_config.py` usando o formato JSON para permitir centralização.
- **Healthcheck**: endpoint simples `/health` que verifica a conectividade com o banco e a validade do JWKS.
- **Tracing**: o projeto está preparado para adicionar tracing (OpenTelemetry) caso necessário.

## Segurança

- **JWT Validation**: o backend valida o token JWT utilizando o JWKS fornecido pelo Supabase. O módulo `security.py` inclui cache para evitar downloads repetitivos.
- **CORS**: configurado para permitir apenas domínios confiáveis (configurados via variável de ambiente).
- **Proteção contra IDOR**: todas as consultas filtram pelo `user_id`, garantindo que um usuário só acesse seus próprios dados.
- **RLS no Banco**: as policies em `supabase_setup.sql` implementam Row Level Security para replicar a filtragem no banco.

## Extensibilidade

- **Módulos independentes**: novas funcionalidades (como metas e parcelamentos) podem ser adicionadas em novas camadas de serviço e rotas sem impactar o core.
- **Configurações com Pydantic**: todas as configurações sensíveis são externas e carregadas via variáveis de ambiente.
