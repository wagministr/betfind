# Cron Job Setup for BetFind

This document explains how to properly set up and secure the cron jobs for the BetFind application.

## Environment Variables

To ensure your cron endpoints are secure, you need to set the following environment variable in your Vercel project:

- `CRON_SECRET`: A random string that acts as a password for your cron endpoints

## Setting Up in Vercel

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add a new environment variable:
   - Name: `CRON_SECRET`
   - Value: Generate a random string (e.g., using `openssl rand -base64 32` or an online generator)
   - Select "Production" environment (and others if needed)
4. Click "Save"

## Testing the Cron Endpoint Manually

To test your cron endpoint manually, you'll need to include the authorization header:

```bash
curl -X GET "https://your-domain.vercel.app/api/cron/daily-update" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value you set in the environment variable.

## How Authentication Works

The cron endpoint is protected in two ways:

1. **Vercel Cron Authentication**: When Vercel triggers the cron job, it includes a special header `x-vercel-cron: 1`. The endpoint verifies this header.

2. **Custom Token Authentication**: For manual testing or triggering from external systems, you can use the `Authorization: Bearer YOUR_CRON_SECRET` header.

If neither authentication method passes, the endpoint returns a 401 Unauthorized error.

## Troubleshooting

If you're getting an "Unauthorized" error:

1. Make sure the `CRON_SECRET` environment variable is set in Vercel
2. When testing manually, ensure you're including the correct Authorization header
3. Check the Vercel function logs to see more details about the authorization failure

## Setting Up Initial Data

If you need to populate your database with initial predictions before the cron job runs:

1. Set up your local environment with the necessary environment variables
2. Run the script to generate initial predictions:

```bash
node scripts/run-generate-initial-predictions.js
```

This will populate your Supabase database with predictions for upcoming fixtures. 