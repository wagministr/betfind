# MrBets.ai Development Setup for Windows

# Colors
$Green = [ConsoleColor]::Green
$Red = [ConsoleColor]::Red
$Yellow = [ConsoleColor]::Yellow
$DefaultColor = [Console]::ForegroundColor

function Write-Colored($message, $color) {
    $prevColor = [Console]::ForegroundColor
    [Console]::ForegroundColor = $color
    Write-Host $message
    [Console]::ForegroundColor = $prevColor
}

function Write-Success($message) {
    Write-Host "✓ " -ForegroundColor $Green -NoNewline
    Write-Host $message
}

function Write-Error($message) {
    Write-Host "✗ " -ForegroundColor $Red -NoNewline
    Write-Host $message
}

function Write-Warning($message) {
    Write-Host "! " -ForegroundColor $Yellow -NoNewline
    Write-Host $message
}

Write-Colored "======================================" $Yellow
Write-Colored "    MrBets.ai Development Setup     " $Yellow
Write-Colored "======================================" $Yellow
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Success "Docker is installed: $dockerVersion"
} catch {
    Write-Error "Docker is not installed. Please install Docker Desktop."
    exit 1
}

# Check if Docker Compose is installed
try {
    $dockerComposeVersion = docker compose version
    Write-Success "Docker Compose is installed"
} catch {
    Write-Error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Success ".env file exists"
} else {
    Write-Warning ".env file does not exist. Creating from template..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" -Destination ".env"
        Write-Success "Created .env from .env.example. Please update with your actual values."
    } else {
        Write-Error ".env.example file not found. Please create a .env file manually."
        exit 1
    }
}

# Check required environment variables
Write-Host "`nChecking required environment variables in .env:"
$requiredVars = @("SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_KEY", "API_FOOTBALL_KEY", "OPENAI_API_KEY")
$missingVars = 0

$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
foreach ($var in $requiredVars) {
    $varValue = $envContent | Where-Object { $_ -match "^$var=.+" }
    if ($varValue) {
        Write-Success "$var is set"
    } else {
        Write-Error "$var is missing or empty"
        $missingVars++
    }
}

if ($missingVars -gt 0) {
    Write-Host "`nWarning: $missingVars required environment variables are missing or empty." -ForegroundColor $Yellow
    Write-Host "Please update your .env file before proceeding."
}

# Create directories if they don't exist
Write-Host "`nChecking directories:"
$directories = @(
    "monitoring\prometheus", 
    "monitoring\grafana\provisioning\datasources", 
    "monitoring\grafana\provisioning\dashboards"
)

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Success "$dir exists"
    } else {
        Write-Warning "Creating $dir..."
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Success "Created $dir"
    }
}

# Check frontend and backend directories
Write-Host "`nChecking project structure:"
if (Test-Path "backend") {
    Write-Success "backend directory exists"
    if (Test-Path "backend\requirements.txt") {
        Write-Success "backend\requirements.txt exists"
    } else {
        Write-Error "backend\requirements.txt is missing"
    }
} else {
    Write-Error "backend directory is missing"
}

if (Test-Path "frontend") {
    Write-Success "frontend directory exists"
    if (Test-Path "frontend\package.json") {
        Write-Success "frontend\package.json exists"
    } else {
        Write-Error "frontend\package.json is missing"
    }
} else {
    Write-Error "frontend directory is missing"
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "`n" -NoNewline
    Write-Success "Docker is running"
} catch {
    Write-Host "`n" -NoNewline
    Write-Error "Docker is not running. Please start Docker Desktop."
    exit 1
}

Write-Host ""
Write-Colored "======================================" $Yellow
Write-Colored "Setup complete!" $Green
Write-Colored "======================================" $Yellow
Write-Host "`nTo start development environment, run:"
Write-Host "docker compose up -d" -ForegroundColor $Green
Write-Host "`nTo view logs, run:"
Write-Host "docker compose logs -f" -ForegroundColor $Green
Write-Host "`nTo access services:"
Write-Host "- Frontend: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor $Green
Write-Host "- Backend API: " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor $Green
Write-Host "- Prometheus: " -NoNewline; Write-Host "http://localhost:9090" -ForegroundColor $Green
Write-Host "- Grafana: " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor $Green -NoNewline; Write-Host " (admin/admin)" 