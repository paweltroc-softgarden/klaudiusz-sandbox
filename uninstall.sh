#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
DIM='\033[2m'
NC='\033[0m'

SANDBOX_HOME="$HOME/.klaudiusz-sandbox"
CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
IMAGE_NAME="klaudiusz-sandbox"

log_step() { echo -e "\n${BLUE}[$1]${NC} $2"; }
log_success() { echo -e "  ${GREEN}✓${NC} $1"; }
log_warn() { echo -e "  ${YELLOW}!${NC} $1"; }

echo -e "\n${YELLOW}╔══════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   Klaudiusz Sandbox Uninstaller          ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════╝${NC}"

echo -e "\nThis will remove:"
echo -e "  - $SANDBOX_HOME"
echo -e "  - ~/.local/bin/klaudiusz symlink"
echo -e "  - Docker image: $IMAGE_NAME"
echo -e "  - $CLAUDE_HOME/.dockerignore"

read -p $'\nContinue? [y/N] ' -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${DIM}Uninstall cancelled.${NC}"
    exit 0
fi

# Step 1: Remove symlink
log_step "1/4" "Removing symlink..."
if [ -L "$HOME/.local/bin/klaudiusz" ]; then
    rm "$HOME/.local/bin/klaudiusz"
    log_success "Removed ~/.local/bin/klaudiusz"
else
    log_warn "Symlink not found"
fi

# Step 2: Remove Docker image
log_step "2/4" "Removing Docker image..."
if docker rmi "$IMAGE_NAME" 2>/dev/null; then
    log_success "Removed image: $IMAGE_NAME"
else
    log_warn "Image $IMAGE_NAME not found or in use"
fi

# Step 3: Remove .dockerignore from Claude home
log_step "3/4" "Removing .dockerignore..."
if [ -f "$CLAUDE_HOME/.dockerignore" ]; then
    rm "$CLAUDE_HOME/.dockerignore"
    log_success "Removed $CLAUDE_HOME/.dockerignore"
else
    log_warn ".dockerignore not found"
fi

# Step 4: Remove sandbox directory
log_step "4/4" "Removing sandbox directory..."
if [ -d "$SANDBOX_HOME" ]; then
    rm -rf "$SANDBOX_HOME"
    log_success "Removed $SANDBOX_HOME"
else
    log_warn "$SANDBOX_HOME not found"
fi

echo -e "\n${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Uninstall complete!                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
