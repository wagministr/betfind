# Vercel Deployment Guide

This document outlines how to deploy the BetFind application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Access to your project's Git repository
3. Required environment variables (see below)

## Environment Variables

The following environment variables need to be set in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- Add any other environment variables your application needs

## Deployment Steps

1. **Connect your repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your Git repository
   - Select the repository

2. **Configure the project**
   - Project Name: `betfind` (or your preferred name)
   - Framework Preset: Next.js (should be detected automatically)
   - Root Directory: `./` (default)
   - Build and Output Settings: (already configured in vercel.json)

3. **Environment Variables**
   - Add all required environment variables in the "Environment Variables" section

4. **Deploy**
   - Click "Deploy"

## Cron Jobs

Your application has a cron job configured in `vercel.json`:

```json
"crons": [
  {
    "path": "/api/cron/daily-update",
    "schedule": "0 4 * * *"
  }
]
```

This will run every day at 4:00 AM UTC. Ensure you are using a Vercel plan that supports cron jobs (Pro or higher).

## Post-Deployment

After deployment:

1. Verify that all pages load correctly
2. Test the API endpoints 
3. Check that the cron job is running as expected (this may take up to 24 hours to start)

## Troubleshooting

- **Build Errors**: Check the Vercel build logs for specific errors
- **Runtime Errors**: Check Function Logs in the Vercel dashboard
- **Cron Job Issues**: Verify that your plan supports cron jobs and that the endpoint is functioning correctly

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) 