#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
DIM='\033[2m'
NC='\033[0m' # No Color

SANDBOX_HOME="$HOME/.klaudiusz-sandbox"
CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
REPO_URL="https://raw.githubusercontent.com/paweltroc/klaudiusz-sandbox/main"

log_step() { echo -e "\n${BLUE}[$1]${NC} $2"; }
log_success() { echo -e "  ${GREEN}✓${NC} $1"; }
log_warn() { echo -e "  ${YELLOW}!${NC} $1"; }
log_error() { echo -e "  ${RED}✗${NC} $1"; }

echo -e "\n${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Klaudiusz Sandbox Installer            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"

# Step 1: Check prerequisites
log_step "1/3" "Checking prerequisites..."

if ! command -v claude &> /dev/null; then
    log_error "Claude CLI is not installed. Please install it first."
    echo -e "    ${DIM}https://docs.anthropic.com/en/docs/claude-code${NC}"
    exit 1
fi
log_success "Claude CLI installed"

if [ ! -d "$CLAUDE_HOME" ]; then
    log_error "Claude home directory not found at $CLAUDE_HOME"
    exit 1
fi
log_success "Claude home: $CLAUDE_HOME"

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi
log_success "Docker installed"

if ! docker sandbox version &> /dev/null; then
    log_error "Docker sandbox extension not found."
    echo -e "    ${DIM}Install it from: https://hub.docker.com/extensions/docker/labs-ai-tools-for-devs${NC}"
    exit 1
fi
log_success "Docker sandbox available"

# Step 2: Download and install files
log_step "2/3" "Downloading files..."

mkdir -p "$SANDBOX_HOME/bin"
log_success "Created $SANDBOX_HOME"

# Download sandbox runner script
if curl -fsSL "$REPO_URL/bin/klaudiusz-sandbox" -o "$SANDBOX_HOME/bin/klaudiusz-sandbox"; then
    chmod +x "$SANDBOX_HOME/bin/klaudiusz-sandbox"
    log_success "Downloaded klaudiusz-sandbox script"
else
    log_error "Failed to download klaudiusz-sandbox script"
    exit 1
fi

# Download Dockerfile template
if curl -fsSL "$REPO_URL/templates/Dockerfile.klaudiusz" -o "$SANDBOX_HOME/Dockerfile.klaudiusz"; then
    log_success "Downloaded Dockerfile template"
else
    log_error "Failed to download Dockerfile template"
    exit 1
fi

# Download .dockerignore to Claude home
if curl -fsSL "$REPO_URL/templates/.dockerignore" -o "$CLAUDE_HOME/.dockerignore"; then
    log_success "Downloaded .dockerignore to $CLAUDE_HOME"
else
    log_error "Failed to download .dockerignore"
    exit 1
fi

# Step 3: Create symlink in ~/.local/bin
log_step "3/3" "Setting up command..."

mkdir -p "$HOME/.local/bin"
ln -sf "$SANDBOX_HOME/bin/klaudiusz-sandbox" "$HOME/.local/bin/klaudiusz-sandbox"
log_success "Created symlink in ~/.local/bin"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    log_warn "~/.local/bin is not in your PATH"
    echo -e "    ${DIM}Add this to your shell config (.bashrc or .zshrc):${NC}"
    echo -e "    ${DIM}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
fi

# Done!
echo -e "\n${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Installation complete!                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Usage:${NC}"
echo -e "  klaudiusz-sandbox              # Start sandbox in current directory"
echo -e "  klaudiusz-sandbox --resume     # Resume previous session"

echo -e "\n${DIM}First run will build the Docker image (may take a few minutes)${NC}"

echo -e "\n${BLUE}Uninstall:${NC}"
echo -e "  curl -fsSL $REPO_URL/uninstall.sh | bash"
