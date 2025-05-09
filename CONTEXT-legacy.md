# 📘 CONTEXT.md — Project Overview for MrBets (WinPulse)
_Last updated: 2025-04-24_

---

## 🎯 Project Name: MrBets (Codename: WinPulse)

MrBets is an AI-powered sports prediction platform that delivers pre-analyzed football match insights based on live data, AI reasoning, and betting value.  
It combines data from external APIs with OpenAI-powered analysis, storing results in Supabase and displaying them in a user-friendly interface.

---

## 🧩 Key Functional Components

### 1. 🔄 **Fixtures Sync**
- Uses `API-Football` to fetch upcoming matches from select leagues (e.g., Premier League, La Liga)
- Script: `/scripts/updateFixtures.ts`
- Stores raw match data into `Supabase.fixtures`
- Triggered manually or via a cron job

### 2. 🧠 **AI Prediction Generation**
- Each match is processed by:
  - Fetching live stats & odds
  - Formatting a structured prompt
  - Sending to OpenAI (model: `o4-mini`)
  - Parsing AI response into:
    - `CHAIN OF THOUGHT`
    - `FINAL PREDICTION`
    - `VALUE BETS`
- Script: `/scripts/generatePrediction.ts`
- All results are stored in `Supabase.ai_predictions`

### 3. 📅 **Automated Cron Flow**
- Nightly cron job (4:00 AM UTC) runs two steps:
  - `run-update.js` → Updates fixtures
  - `run-all-predictions.js` → Generates predictions for unprocessed matches
- Cron route: `/api/cron/daily-update`
- Deployment: Vercel with `vercel.json` cron support

### 4. 💬 **User-Facing /ai Page**
- Users visit `/ai`
- See horizontally scrollable cards of upcoming matches
- Clicking a card:
  - Opens a modal
  - Loads prediction from `Supabase.ai_predictions`
  - Displays:
    - Chain of Thought
    - Final Prediction
    - List of Top 3 Value Bets
- If no prediction exists:
  - Fallback message: "AI prediction is being prepared..."

### 5. 🔐 **Auth & Visibility**
- Top matches in `/ai` preview are blurred unless the user logs in
- Login is email-based (OTP) using Supabase Auth
- After login, full dashboard unlocked

---

## 🔒 Database Structure (Supabase)

### `fixtures`
- `fixture_id`: integer
- `league_id`: integer
- `home_id`: integer
- `away_id`: integer
- `utc_kickoff`: timestamp
- `status`: text
- `score_home`: integer
- `score_away`: integer

### `ai_predictions`
- `fixture_id`: integer
- `type`: text (e.g., "pre-match")
- `chain_of_thought`: text
- `final_prediction`: text
- `value_bets_json`: string (stringified array)
- `model_version`: text
- `generated_at`: timestamp

---

## 📡 External APIs & Models

### ✅ API-Football
- Used for: Fixtures, live odds, team data, predictions
- Called via `lib/apiFootball.ts`
- Rate-limited API with key-based access

### ✅ OpenAI
- Used for: Text generation (reasoning, summary, betting logic)
- Model: `o4-mini`
- Called via `generatePrediction.ts` → OpenAI Chat Completion endpoint
- Responses are split into 3 sections and stored

---

## 🧪 Development Notes

- Project is developed on Windows 11 + PowerShell
- Local script execution via `ts-node`
- Supabase MCP enabled for Cursor integration
- `.env` stores all API keys & model info

---

## 🔜 Roadmap / Vision

- Introduce more APIs (e.g., OddsAPI, Tipstrr)
- Add post-match analysis & live updates during games
- Build out `/dashboard` with historical performance
- Enable users to search for matches or teams
- Integrate referral-based monetization
- Long-term: own betting backend + MrBets AI mobile assistant

---

This file is the **single source of truth** for how the platform is designed to work.  
Keep it updated when functionality evolves.
