#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}    MrBets.ai Development Setup     ${NC}"
echo -e "${YELLOW}======================================${NC}"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"
else
    echo -e "${RED}✗${NC} Docker is not installed. Please install Docker Desktop."
    exit 1
fi

# Check if Docker Compose is installed
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed"
else
    echo -e "${RED}✗${NC} Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Check if .env file exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}!${NC} .env file does not exist. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Created .env from .env.example. Please update with your actual values."
    else
        echo -e "${RED}✗${NC} .env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

# Check required environment variables
echo -e "\nChecking required environment variables in .env:"
required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_KEY" "API_FOOTBALL_KEY" "OPENAI_API_KEY")
missing_vars=0

for var in "${required_vars[@]}"; do
    if grep -q "$var=" .env && ! grep -q "$var=$" .env; then
        echo -e "${GREEN}✓${NC} $var is set"
    else
        echo -e "${RED}✗${NC} $var is missing or empty"
        missing_vars=$((missing_vars+1))
    fi
done

if [ $missing_vars -gt 0 ]; then
    echo -e "\n${YELLOW}Warning:${NC} $missing_vars required environment variables are missing or empty."
    echo -e "Please update your .env file before proceeding."
fi

# Create directories if they don't exist
echo -e "\nChecking directories:"
directories=("monitoring/prometheus" "monitoring/grafana/provisioning/datasources" "monitoring/grafana/provisioning/dashboards")

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir exists"
    else
        echo -e "${YELLOW}!${NC} Creating $dir..."
        mkdir -p "$dir"
        echo -e "${GREEN}✓${NC} Created $dir"
    fi
done

# Check frontend and backend directories
echo -e "\nChecking project structure:"
if [ -d "backend" ]; then
    echo -e "${GREEN}✓${NC} backend directory exists"
    if [ -f "backend/requirements.txt" ]; then
        echo -e "${GREEN}✓${NC} backend/requirements.txt exists"
    else
        echo -e "${RED}✗${NC} backend/requirements.txt is missing"
    fi
else
    echo -e "${RED}✗${NC} backend directory is missing"
fi

if [ -d "frontend" ]; then
    echo -e "${GREEN}✓${NC} frontend directory exists"
    if [ -f "frontend/package.json" ]; then
        echo -e "${GREEN}✓${NC} frontend/package.json exists"
    else
        echo -e "${RED}✗${NC} frontend/package.json is missing"
    fi
else
    echo -e "${RED}✗${NC} frontend directory is missing"
fi

# Check if Docker is running
if docker info &> /dev/null; then
    echo -e "\n${GREEN}✓${NC} Docker is running"
else
    echo -e "\n${RED}✗${NC} Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo -e "\n${YELLOW}======================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}======================================${NC}"
echo -e "\nTo start development environment, run:"
echo -e "${GREEN}docker compose up -d${NC}"
echo -e "\nTo view logs, run:"
echo -e "${GREEN}docker compose logs -f${NC}"
echo -e "\nTo access services:"
echo -e "- Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "- Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "- Prometheus: ${GREEN}http://localhost:9090${NC}"
echo -e "- Grafana: ${GREEN}http://localhost:3001${NC} (admin/admin)" 