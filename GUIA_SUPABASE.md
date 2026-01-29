# 🚀 Guia Completo: Conectando com Supabase

## Passo 1: Criar Projeto no Supabase

1. **Acesse:** https://supabase.com
2. **Faça login** ou crie uma conta
3. **Clique em "New Project"**
4. **Preencha:**
   - Name: `finance-app`
   - Database Password: (escolha uma senha forte e anote!)
   - Region: `South America (São Paulo)` ou mais próxima
5. **Clique em "Create new project"**
6. **Aguarde** ~2 minutos até o projeto estar pronto

---

## Passo 2: Configurar o Banco de Dados

1. **No painel do Supabase**, vá em **SQL Editor** (ícone de código no menu lateral)
2. **Clique em "+ New query"**
3. **Copie todo o conteúdo** do arquivo `SUPABASE_SETUP.sql` (na raiz do projeto)
4. **Cole no editor SQL**
5. **Clique em "Run"** (ou pressione Ctrl+Enter)
6. **Aguarde** a execução (deve aparecer "Success. No rows returned")

✅ Pronto! Todas as tabelas, políticas de segurança e triggers foram criados!

---

## Passo 3: Obter as Credenciais

1. **No Supabase**, vá em **Settings** (⚙️ no menu lateral)
2. **Clique em "API"**
3. **Anote as seguintes informações:**

   📋 **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   📋 **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Passo 4: Configurar Variáveis de Ambiente

### Frontend (.env)

1. **Navegue até a pasta frontend:**
   ```bash
   cd /home/cmoraya/Projetos_Python/Aplicativo\ de\ Financas/finance_app/frontend
   ```

2. **Edite o arquivo `.env`:**
   ```bash
   nano .env
   ```

3. **Substitua com suas credenciais:**
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA-ANON-KEY-AQUI
   
   # Backend (opcional por enquanto)
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

4. **Salve:** Ctrl+O, Enter, Ctrl+X

### Backend (.env) - Opcional

Se quiser usar o backend FastAPI também:

1. **Navegue até a pasta backend:**
   ```bash
   cd /home/cmoraya/Projetos_Python/Aplicativo\ de\ Financas/finance_app/backend
   ```

2. **Crie/edite o arquivo `.env`:**
   ```bash
   nano .env
   ```

3. **Adicione:**
   ```env
   DATABASE_URL=postgresql://postgres:SUA-SENHA@db.SEU-PROJECT-ID.supabase.co:5432/postgres
   SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
   SUPABASE_ANON_KEY=SUA-ANON-KEY-AQUI
   SUPABASE_JWKS_URL=https://SEU-PROJECT-ID.supabase.co/auth/v1/.well-known/jwks.json
   SUPABASE_JWT_AUDIENCE=authenticated
   ```

---

## Passo 5: Habilitar Autenticação por Email

1. **No Supabase**, vá em **Authentication** > **Providers**
2. **Email** já deve estar habilitado por padrão
3. **Opcional:** Configure **Email Templates** para personalizar emails de confirmação

---

## Passo 6: Criar Sua Primeira Conta

1. **Reinicie o servidor frontend:**
   ```bash
   cd /home/cmoraya/Projetos_Python/Aplicativo\ de\ Financas/finance_app/frontend
   npm run dev
   ```

2. **Acesse:** http://localhost:3000

3. **Clique em "Criar conta"** (ou vá para `/signup`)

4. **Preencha:**
   - Email: seu@email.com
   - Senha: (mínimo 6 caracteres)

5. **Confirme o email** (verifique sua caixa de entrada)

6. **Faça login!**

---

## Passo 7: Testar a Integração

Após fazer login, você deve:

✅ Ver o Dashboard com dados reais (vazios inicialmente)
✅ Conseguir criar contas
✅ Conseguir adicionar transações
✅ Conseguir criar categorias
✅ Todos os dados salvos no Supabase!

---

## 🔧 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a `anon key` corretamente
- Certifique-se de usar `NEXT_PUBLIC_` no nome da variável

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Certifique-se de que o projeto está ativo

### Erro: "Row Level Security"
- Execute o script SQL novamente
- Verifique se as políticas foram criadas

### Dados não aparecem
- Faça logout e login novamente
- Limpe o localStorage: `localStorage.clear()`
- Verifique o console do navegador (F12)

---

## 📊 Próximos Passos

Depois que tudo estiver funcionando:

1. ✅ Adicionar categorias padrão automaticamente
2. ✅ Implementar gráficos reais (Chart.js)
3. ✅ Adicionar exportação de dados
4. ✅ Implementar notificações
5. ✅ Deploy em produção (Vercel + Supabase)

---

## 🆘 Precisa de Ajuda?

Se encontrar algum problema:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase (Logs > API)
3. Me avise qual erro está aparecendo!

**Boa sorte! 🚀**
