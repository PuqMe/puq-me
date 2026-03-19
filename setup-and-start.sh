#!/bin/bash

###############################################################################
# PuQ.me - Setup & Start Script (für Sandbox ohne Docker)
# Baut die App mit Node.js und startet den API-Server
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PuQ.me Setup & Start (Node.js Direct)       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# Schritt 1: Abhängigkeiten installieren
echo -e "${YELLOW}[1/3]${NC} Installing dependencies with npm..."

# Erste installiere das root package.json
if [ -f "package.json" ]; then
    echo "  Installing root dependencies..."
    npm install --prefer-offline 2>&1 | grep -E "^npm|^added|^up to date|ERR!" | head -20
fi

# Installiere API-Abhängigkeiten
echo "  Installing API dependencies..."
cd apps/api
npm install --prefer-offline 2>&1 | grep -E "^npm|^added|^up to date|ERR!" | head -20
cd - > /dev/null

echo -e "${GREEN}  ✓ Dependencies installed${NC}\n"

# Schritt 2: Build API
echo -e "${YELLOW}[2/3]${NC} Building API..."
cd apps/api
npm run build 2>&1 | tail -20
cd - > /dev/null
echo -e "${GREEN}  ✓ API built${NC}\n"

# Schritt 3: Konfiguriere und starte API
echo -e "${YELLOW}[3/3]${NC} Starting API Server..."
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}API Server ist online!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}\n"

# Starte den API-Server
cd apps/api
npm run start
