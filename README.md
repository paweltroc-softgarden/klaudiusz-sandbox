# claude-sandbox-setup

Setup Claude Code Docker sandbox with Bun and TypeScript.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker AI Tools Extension](https://hub.docker.com/extensions/docker/labs-ai-tools-for-devs)

## Installation

```bash
# Using bun (recommended)
bunx claude-sandbox-setup

# Or using npx
npx claude-sandbox-setup
```

## What it does

1. Creates `~/.claude/` directory structure
2. Installs the Dockerfile template
3. Builds the Docker image (`claude-dev-bun`)
4. Adds `claude-sandbox` alias to your shell

## Usage

After installation:

```bash
# Start sandbox in current directory
claude-sandbox

# Resume previous session
claude-sandbox --resume
```

## Features

- **Bun runtime** - Fast JavaScript/TypeScript execution
- **Your settings preserved** - Copies your `~/.claude/settings.json` into the container
- **Plugins & agents** - Your custom plugins, agents, and skills are available
- **Isolated environment** - Safe to experiment without affecting your system

## Manual rebuild

If you update your settings or plugins:

```bash
cd ~/.claude
docker build -t claude-dev-bun -f dockerfiles/Dockerfile.bun .
```

## License

MIT
