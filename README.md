<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19oxzqks8H8C7y6zBMiYQoB93gxk8AWya

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Performance Checklist

To maintain optimal performance (`Lighthouse Score > 90`):

### 1. Bundle & Code Splitting

- [ ] **Lazy Loading**: Ensure all new routes in `App.tsx` use `React.lazy`.
- [ ] **Heavy Libs**: Use dynamic imports (`await import('lib')`) for features like PDF, Excel, or heavy Charts.
- [ ] **Chunk Limits**: Check `vite.config.ts` manualChunks if adding large dependencies.

### 2. Data Fetching

- [ ] **Pagination**: Always use `page` and `limit` for lists > 50 items.
- [ ] **Server-Side Filtering**: Don't filter arrays in client-side JS; use Supabase filters (`.eq()`, `.ilike()`).
- [ ] **Caching**: Use specific `staleTime` in `useQueries.ts` (e.g., 5 mins for static data).

### 3. Assets

- [ ] **Images**: Use WebP format and compress images before commit.
- [ ] **Icons**: Import specific icons (`import { User } from 'lucide-react'`) instead of the whole library.

## Improvements (Phase 1)

- [x] **RLS Refined**: `profiles` policy documented as Single Tenant (MVP). Code for Multi-tenant restriction prepared in migrations.
- [x] **Visual Feedback**: `sonner` (Toast) replaces `alert()` and `console.error` in Auth & Forms.
- [x] **Code Style**: Prettier check added to CI (`npm run prettier:check`).

## 🔐 Sistema de Convites (Invite-Only)

O sistema utiliza um fluxo seguro baseado em convites por email.

### Como funciona
1. **Envio:** O Admin acessa `Configurações > Membros e Convites` e envia um convite por email.
   - O convite é registrado no banco como `status: sent`.
   - Uma Edge Function (`send-invite-email`) garante a segurança e envia o email (mockado no console por enquanto).
2. **Aceite:** O usuário recebe o email e acessa a página de Signup (`/auth/signup`) ou Login via Magic Link.
3. **Vínculo Automático:** Ao criar a conta (ou fazer o primeiro login), uma trigger (`handle_new_user`) detecta o convite pendente pelo email.
   - O usuário é automaticamente vinculado ao Escritório do convite.
   - O cargo (Admin, Lawyer, etc.) é atribuído conforme o convite.
   - O convite é marcado como `accepted`.

### Configuração
Para restringir o acesso público e permitir apenas convidados:
1. Defina `VITE_INVITE_ONLY_MODE=true` no `.env`.
2. Isso ocultará o formulário de cadastro público.

### Setup Inicial (Bootstrap)
Como o primeiro usuário não tem quem o convide, ele deve ser criado manualmente ou via SQL se o `VITE_INVITE_ONLY_MODE` estiver ativo.

**Opção 1 (Recomendada):** Deixe `VITE_INVITE_ONLY_MODE=false` inicialmente, crie o primeiro usuário (que gerará seu escritório automaticamente), e depois ative o modo restrito.

**Opção 2 (Manual via SQL):**
Se precisar promover um usuário existente ou criar um escritório manualmente:

```sql
-- 1. Crie o Escritório
INSERT INTO public.offices (name) VALUES ('Meu Escritório') RETURNING id;

-- 2. Vincule o Usuário (pegue o ID do usuário em auth.users)
UPDATE public.profiles 
SET office_id = 'ID_DO_ESCRITORIO', role = 'admin' 
WHERE email = 'seu@email.com';
```

### Deploy da Edge Function
```bash
supabase functions deploy send-invite-email --no-verify-jwt
```
*Nota: `--no-verify-jwt` é usado porque a função verifica a autenticação internamente para validar permissões customizadas.*
