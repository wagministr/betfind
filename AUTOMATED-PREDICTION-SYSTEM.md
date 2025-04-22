# Automated Prediction System

This document explains how the automated prediction system works for MrBets AI.

## System Overview

The prediction system is fully automated and follows these steps:

1. **Scheduled Updates**: A daily cron job runs at 4:00 AM UTC to:
   - Update the fixtures database with upcoming matches
   - Generate predictions for matches that don't have predictions yet

2. **User Experience**: When users visit the /ai page:
   - They see upcoming matches already loaded from the database
   - When they click on a match, the pre-generated prediction is immediately shown
   - If a prediction doesn't exist (rare case), they see a "Prediction is being prepared" message

## Technical Implementation

### Scheduled Jobs

The system uses Vercel Cron Jobs to run the daily update process:

- **Schedule**: Every day at 4:00 AM UTC (`0 4 * * *`)
- **Endpoint**: `/api/cron/daily-update`
- **Security**: Protected with a `CRON_SECRET` environment variable

### Update Process

The update process has two main steps:

1. **Fixture Update** (`scripts/run-update.js`):
   - Fetches upcoming matches from API-Football
   - Stores them in the `fixtures` table in Supabase

2. **Prediction Generation** (`scripts/run-all-predictions.js`):
   - Checks which fixtures don't have predictions yet
   - Generates predictions using OpenAI
   - Stores predictions in the `ai_predictions` table in Supabase

### Frontend Integration

The `/ai` page:
- Loads fixtures from Supabase on page load
- When a user clicks a match, it queries for the corresponding prediction
- Displays the prediction in three parts:
  - Chain of Thought analysis
  - Final Prediction
  - Value Bets list

## Testing and Monitoring

### Manual Testing

You can manually trigger the update process during development:
- Visit `/api/test-cron` in your browser (development only)
- This will run the same process as the scheduled job

### Monitoring

Check the logs in your Vercel dashboard to monitor the cron job execution.

## Environment Setup

Required environment variables:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# API-Football credentials
API_FOOTBALL_KEY=
API_FOOTBALL_HOST=v3.football.api-sports.io

# OpenAI API credentials
OPENAI_API_KEY=
OPENAI_API_MODEL=o4-mini

# Cron job security
CRON_SECRET=
```

## Deployment

When deploying to Vercel:

1. Set all the environment variables in the Vercel dashboard
2. The cron job will be automatically configured via the `vercel.json` file
3. No manual intervention is required after deployment

## Troubleshooting

If predictions are not being generated:

1. Check the Vercel logs for any errors in the cron job
2. Verify API keys are valid and have sufficient quota
3. Check Supabase for database errors
4. Try running the manual test endpoint to see detailed error messages 