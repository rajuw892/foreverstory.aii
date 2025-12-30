#!/bin/bash
# ========================================
# Quick Component Tests
# ========================================

echo ""
echo "=========================================="
echo "🔧 ForeverStory.ai - Quick Component Tests"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: FFmpeg
echo -n "Testing FFmpeg... "
if command -v ffmpeg &> /dev/null; then
    VERSION=$(ffmpeg -version 2>&1 | head -1 | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} Installed (v$VERSION)"
else
    echo -e "${RED}✗${NC} Not found"
fi

# Test 2: Node.js
echo -n "Testing Node.js... "
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $VERSION"
else
    echo -e "${RED}✗${NC} Not found"
fi

# Test 3: npm packages
echo -n "Testing Remotion packages... "
if npm list @remotion/bundler @remotion/renderer &> /dev/null; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Missing packages"
fi

# Test 4: Supabase connection
echo -n "Testing Supabase connection... "
if node scripts/check-migration.js &> /dev/null; then
    echo -e "${GREEN}✓${NC} Connected"
else
    echo -e "${RED}✗${NC} Connection failed"
fi

# Test 5: Dev server
echo -n "Testing dev server... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running"
else
    echo -e "${YELLOW}⚠${NC}  Not running (start with: npm run dev)"
fi

# Test 6: Public directories
echo -n "Testing public/videos directory... "
if [ -d "public/videos" ]; then
    echo -e "${GREEN}✓${NC} Exists"
else
    echo -e "${YELLOW}⚠${NC}  Creating..."
    mkdir -p public/videos
    echo -e "${GREEN}✓${NC} Created"
fi

# Test 7: Environment variables
echo -n "Testing environment variables... "
if [ -f ".env.local" ]; then
    MISSING=()

    grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local || MISSING+=("SUPABASE_URL")
    grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local || MISSING+=("SERVICE_ROLE_KEY")
    grep -q "GROQ_API_KEY" .env.local || MISSING+=("GROQ_API_KEY")

    if [ ${#MISSING[@]} -eq 0 ]; then
        echo -e "${GREEN}✓${NC} All set"
    else
        echo -e "${YELLOW}⚠${NC}  Missing: ${MISSING[*]}"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found"
fi

echo ""
echo "=========================================="
echo "📝 To run full flow test:"
echo "   npx tsx scripts/test-full-flow.ts"
echo ""
echo "📝 To start dev server:"
echo "   npm run dev"
echo "=========================================="
echo ""
