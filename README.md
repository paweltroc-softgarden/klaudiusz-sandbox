# Klaudiusz Sandbox

Docker sandbox environment for Claude Code with Bun and TypeScript.

## Prerequisites

- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) installed and configured
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker AI Tools Extension](https://hub.docker.com/extensions/docker/labs-ai-tools-for-devs)

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/paweltroc/klaudiusz-sandbox/main/install.sh | bash
```

This will:
1. Check prerequisites (Claude CLI, Docker, Docker sandbox extension)
2. Install files to `~/.klaudiusz-sandbox/`
3. Create `klaudiusz-sandbox` command in `~/.local/bin/`

First run will build the Docker image (may take a few minutes).

## Usage

```bash
# Start sandbox in current directory
klaudiusz-sandbox

# Resume previous session
klaudiusz-sandbox --resume
```

## Features

- **Bun runtime** - Fast JavaScript/TypeScript execution
- **Your settings preserved** - Copies your `~/.claude/settings.json` into the container
- **Plugins & agents** - Your custom plugins, agents, and skills are available
- **Isolated environment** - Safe to experiment without affecting your system

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/paweltroc/klaudiusz-sandbox/main/uninstall.sh | bash
```

This removes:
- `~/.klaudiusz-sandbox/` directory
- `~/.local/bin/klaudiusz-sandbox` symlink
- Docker image (`claude-dev-bun`)
- `.dockerignore` from `~/.claude/`

## License

MIT
