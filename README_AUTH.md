# Sistema de Autenticação - Gestão Inteligente

Este projeto utiliza o **Supabase Auth** para gerenciamento de usuários e segurança de dados.

## Funcionalidades Implementadas
- [x] Login com E-mail e Senha
- [x] Cadastro de novos advogados (Signup) com perfil automático
- [x] Recuperação de senha por e-mail
- [x] Login Social (Google e GitHub)
- [x] Proteção de rotas (ProtectedRoute)
- [x] Row Level Security (RLS) - Garantia de privacidade dos dados

## Configuração do Banco de Dados
Para que a autenticação funcione corretamente, você deve aplicar o script SQL localizado em:
`supabase/migrations/20240204173000_auth_setup.sql`

Este script cria a tabela `profiles`, configura os triggers de criação automática de perfil e as políticas de segurança (RLS).

## Variáveis de Ambiente Necessárias
Certifique-se de que seu arquivo `.env.local` contém:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_key_anonima
```

## Providers OAuth
Para habilitar o login social:
1. Vá ao **Supabase Dashboard** > **Authentication** > **Providers**.
2. Configure o Google e GitHub com os Client IDs e Secrets obtidos nos consoles de desenvolvedor.
3. Adicione `http://localhost:5173` (ou sua URL oficial) como Site URL e Redirect URIs.

## Segurança (RLS)
Todas as tabelas de negócio agora possuem RLS habilitado. Isso significa que:
1. Usuários só podem ver e editar seus próprios perfis.
2. Usuários só podem acessar dados (clientes, processos, etc.) vinculados ao seu `office_id`.
