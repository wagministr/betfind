#!/bin/bash

# WSL-compatible script for checking monorepo structure using pure bash
# This avoids issues with Node.js path resolution in WSL

# Set terminal colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "🔍 Checking monorepo structure..."

# Change to project root
cd "$PROJECT_ROOT"

# Define required paths to check
REQUIRED_PATHS=(
    "frontend"
    "backend"
    "frontend/package.json"
    "backend/requirements.txt"
    "docker-compose.yml"
    "package.json"
)

# Check all required paths
ALL_PATHS_EXIST=true
for path in "${REQUIRED_PATHS[@]}"; do
    if [ -e "$path" ]; then
        echo -e "${GREEN}✓${NC} Found: $path"
    else
        echo -e "${RED}✗${NC} Missing: $path"
        ALL_PATHS_EXIST=false
    fi
done

if $ALL_PATHS_EXIST; then
    echo -e "\n${GREEN}✅ All critical directories and files exist${NC}"
else
    echo -e "\n${RED}❌ Some critical files or directories are missing${NC}"
fi

# Check frontend package.json
if [ -f "frontend/package.json" ]; then
    FRONTEND_NAME=$(grep -o '"name": "[^"]*' frontend/package.json | cut -d'"' -f4)
    FRONTEND_VERSION=$(grep -o '"version": "[^"]*' frontend/package.json | cut -d'"' -f4)
    echo -e "\nFrontend package: ${YELLOW}$FRONTEND_NAME@$FRONTEND_VERSION${NC}"
fi

# Check root package.json
if [ -f "package.json" ]; then
    ROOT_NAME=$(grep -o '"name": "[^"]*' package.json | cut -d'"' -f4)
    ROOT_VERSION=$(grep -o '"version": "[^"]*' package.json | cut -d'"' -f4)
    echo -e "Root package: ${YELLOW}$ROOT_NAME@$ROOT_VERSION${NC}"
    
    # Check for required scripts
    REQUIRED_SCRIPTS=("dev:frontend" "dev:backend" "dev:all" "docker:up" "docker:down")
    ALL_SCRIPTS_EXIST=true
    
    echo -e "\nChecking root package.json scripts:"
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if grep -q "\"$script\":" package.json; then
            echo -e "${GREEN}✓${NC} Script exists: $script"
        else
            echo -e "${RED}✗${NC} Missing script: $script"
            ALL_SCRIPTS_EXIST=false
        fi
    done
    
    if $ALL_SCRIPTS_EXIST; then
        echo -e "\n${GREEN}✅ Root package.json contains all required scripts${NC}"
    else
        echo -e "\n${RED}❌ Some required scripts are missing in root package.json${NC}"
    fi
fi

# Check for env.example file
if [ -f "env.example" ]; then
    echo -e "\n${GREEN}✅ env.example file exists${NC}"
    
    # Check for required environment variables
    REQUIRED_ENV_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "API_FOOTBALL_KEY" "OPENAI_API_KEY")
    ALL_ENV_VARS_EXIST=true
    
    echo -e "\nChecking env.example variables:"
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if grep -q "$var" env.example; then
            echo -e "${GREEN}✓${NC} Variable exists: $var"
        else
            echo -e "${YELLOW}⚠️${NC} Missing variable: $var"
            ALL_ENV_VARS_EXIST=false
        fi
    done
    
    if $ALL_ENV_VARS_EXIST; then
        echo -e "\n${GREEN}✅ env.example contains all required variables${NC}"
    else
        echo -e "\n${YELLOW}⚠️ Some required environment variables are missing in env.example${NC}"
    fi
else
    echo -e "\n${RED}❌ env.example file is missing${NC}"
fi

# Final summary
echo -e "\n📋 ${YELLOW}Monorepo Check Summary:${NC}"
echo -e "------------------------"
if [ -f "frontend/package.json" ]; then
    echo -e "Frontend package: ${YELLOW}$FRONTEND_NAME@$FRONTEND_VERSION${NC}"
fi
if [ -f "package.json" ]; then
    echo -e "Root package: ${YELLOW}$ROOT_NAME@$ROOT_VERSION${NC}"
    SCRIPT_COUNT=$(grep -c "\".*\":" package.json | wc -l)
    echo -e "Scripts available: ${YELLOW}$SCRIPT_COUNT${NC}"
fi
echo -e "------------------------"
echo -e "${GREEN}✨ Monorepo structure check completed!${NC}\n"

# Instructions for next steps
echo -e "Next steps:"
echo -e "1. Run ${YELLOW}npm install${NC} to install dependencies"
echo -e "2. Run ${YELLOW}npm run backend:install${NC} to install Python dependencies"
echo -e "3. Run ${YELLOW}npm run dev:all${NC} to start both frontend and backend"
echo -e "4. Or run ${YELLOW}npm run docker:up${NC} to start the full stack with Docker" 