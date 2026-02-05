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
