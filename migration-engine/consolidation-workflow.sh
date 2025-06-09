#!/bin/bash
# Complete Type Consolidation Script
# This script performs the entire type consolidation process in one go

# Set strict error handling
set -e

# Set working directory to project root
cd "$(dirname "$0")/../../.."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting complete type consolidation process...${NC}"

# Step 1: Run type consolidation analysis
echo -e "${YELLOW}Step 1: Analyzing types for consolidation...${NC}"
npm run consolidate-types
echo -e "${GREEN}Type analysis completed${NC}"

# Step 2: Rewrite imports to use canonical paths
echo -e "${YELLOW}Step 2: Rewriting imports to use canonical paths...${NC}"
npm run rewrite-imports
echo -e "${GREEN}Import rewriting completed${NC}"

# Step 3: Remove redundant type files
echo -e "${YELLOW}Step 3: Removing redundant type files...${NC}"
npm run types:cleanup
echo -e "${GREEN}Redundant files removed${NC}"

# Step 4: Verify everything still works
echo -e "${YELLOW}Step 4: Verifying consolidation...${NC}"
npm run verify-consolidation
echo -e "${GREEN}Verification completed${NC}"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Type consolidation process completed successfully!${NC}"
echo -e "${GREEN}  All redundant types have been removed.${NC}"
echo -e "${GREEN}  All imports now use the canonical paths.${NC}"
echo -e "${GREEN}  The Single Source of Truth (SSOT) is established.${NC}"
echo -e "${GREEN}============================================${NC}"