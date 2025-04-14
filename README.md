# BetFind

This is a [Next.js](https://nextjs.org) project with [Tailwind CSS](https://tailwindcss.com/) and [Supabase](https://supabase.com/) integration.

## Getting Started

First, set up your environment variables:

1. Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Integration

This project uses Supabase for backend services. The Supabase client is configured in `src/utils/supabase.ts`.

To use Supabase in your components:

```typescript
import { supabase } from '@/utils/supabase';

// Example query
const { data, error } = await supabase.from('your_table').select('*');
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Supabase Documentation](https://supabase.com/docs) - Open source Firebase alternative

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

For deploying with Supabase, make sure to set up your environment variables in your hosting provider.
