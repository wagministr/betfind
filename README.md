# betfind / MrBets.ai

MrBets.ai is an AI-powered sports prediction platform that delivers pre-analyzed football match insights based on data aggregation, AI reasoning, and betting value assessment.

## Project Overview

MrBets.ai automatically collects data about upcoming football matches, processes it using advanced AI, and delivers pre-analyzed predictions to users. The platform offers:

- Automated Data Collection from multiple sources
- AI-Powered Analysis using OpenAI for in-depth reasoning
- Value Betting Recommendations with odds comparison and confidence scores
- Fast Performance with pre-computed predictions

## Repository Structure

This project uses a monorepo structure with separate frontend and backend components:

```
betfind/
├── frontend/            # Current Next.js project
│   ├── src/             # Frontend source code
│   ├── public/          # Static files
│   ├── package.json     # Frontend dependencies
│   └── ...              # Other Next.js files
│
├── backend/             # FastAPI backend
│   ├── app/             # Main FastAPI code
│   │   ├── main.py      # FastAPI entry point
│   │   ├── routers/     # API routes
│   │   └── models/      # Data schemas
│   ├── jobs/            # Scripts for cron tasks
│   │   ├── scan_fixtures.py
│   │   └── worker.py
│   ├── fetchers/        # Data collection microservices
│   ├── processors/      # Data processors
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml   # For running the entire system
├── package.json         # Root package.json for monorepo management
├── .github/             # GitHub Actions
└── BACKEND.md           # Backend documentation
```

## Current Project State

The project is currently in transition from a standalone Next.js application to a full monorepo with a dedicated FastAPI backend.

### Working Components:
- Next.js frontend deployed on Vercel
- API-Football integration for match data
- OpenAI API integration for predictions
- Supabase for data storage
- Vercel cron jobs for automated updates

### Planned/In-Progress Components:
- FastAPI backend for improved scalability
- Redis queues for distributed processing
- Advanced data fetchers (News sites, Social media, Video)
- Vector embeddings with Pinecone
- Comprehensive data processing pipeline

## Technology Stack

### Frontend
- Next.js with App Router
- React for UI components
- Supabase for authentication and data storage
- Tailwind CSS for styling
- Vercel for hosting

### Backend (Planned)
- Python 3.11 with FastAPI framework
- Redis for queues and message passing
- Supabase Postgres for relational data
- Pinecone for vector embeddings
- Docker and docker-compose for containerization
- OpenAI API for LLM reasoning and embeddings

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- Python (v3.11 or later) - for backend development
- Docker and Docker Compose - for full system development
- WSL2 (if on Windows) - for Docker compatibility

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/betfind.git
cd betfind
```

2. Setup environment variables:
```bash
cp env.example .env
# Edit .env with your API keys
```

3. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run backend:install
# OR directly with pip
pip install -r backend/requirements.txt
```

### Development

You can run different parts of the application using the scripts in the root package.json:

```bash
# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend

# Run both frontend and backend concurrently
npm run dev:all

# Build frontend
npm run build:frontend

# Start frontend production server
npm run start:frontend
```

### Docker Development

For a complete development environment including Redis and other services:

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# Stop all services
npm run docker:down
```

### Scripts

The following automation scripts are available:

```bash
# Update fixtures data
npm run update-fixtures

# Generate predictions for upcoming matches
npm run generate-predictions

# Run the daily update cron job
npm run cron:daily-update
```

## Data Flow

1. Scheduled tasks identify upcoming football matches
2. Data collectors gather information from various sources
3. Pre-processors clean, translate, and vectorize the data
4. Retrieval system finds relevant information for each match
5. LLM Reasoner generates detailed analysis and predictions
6. Results are stored for fast access by the frontend

## Key Features

### Prediction Generation
- Automated analysis of upcoming matches
- Chain-of-thought reasoning process
- Value bet identification with confidence scores
- Pre-computed results for instant access

### User Interface
- Browse upcoming matches
- View detailed analysis for each match
- Access value betting recommendations
- Track prediction performance

## Documentation

- [BACKEND.md](BACKEND.md) - Technical reference for backend architecture
- [CONTEXT.md](CONTEXT.md) - Comprehensive project overview
- [docs/vercel-deployment.md](docs/vercel-deployment.md) - Vercel deployment guide
- [docs/automated-prediction-system.md](docs/automated-prediction-system.md) - Prediction system details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
