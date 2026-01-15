# Klaudiusz Sandbox

Docker sandbox environment for Claude Code with Bun and TypeScript.

## Prerequisites

- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) installed and configured
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker AI Tools Extension](https://hub.docker.com/extensions/docker/labs-ai-tools-for-devs)

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/paweltroc-softgarden/klaudiusz-sandbox/main/install.sh | bash
```

This will:
1. Check prerequisites (Claude CLI, Docker, Docker sandbox extension)
2. Install files to `~/.klaudiusz-sandbox/`
3. Create `klaudiusz` command in `~/.local/bin/`

First run will build the Docker image (may take a few minutes).

## Usage

```bash
# Start sandbox in current directory
klaudiusz
```

## Environment Variables

You can pass environment variables to the sandbox by editing `~/.klaudiusz-sandbox/.env`:

```bash
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

These variables will be available inside the container on startup.

## Features

- **Bun runtime** - Fast JavaScript/TypeScript execution
- **Your settings preserved** - Copies your `~/.claude/settings.json` into the container
- **Plugins & agents** - Your custom plugins, agents, and skills are available
- **Isolated environment** - Safe to experiment without affecting your system

## Troubleshooting

### Changes to local skills/plugins not reflected in sandbox

The sandbox container persists after exiting Claude (via `/exit`). This means changes to your local `~/.claude/` files (skills, plugins, agents) won't apply until the container is removed.

### Changes made inside sandbox not persisted locally

There is no volume mounting between the sandbox and your local `~/.claude/` directory. Any changes made inside the sandbox (adding plugins, skills, memories, etc.) will be lost when the container is removed and won't affect your local Claude installation.

**To apply changes:**

1. Open Docker Desktop and remove the `claude-sandbox-*` container
2. Run `klaudiusz` again to apply your latest config

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/paweltroc-softgarden/klaudiusz-sandbox/main/uninstall.sh | bash
```

This removes:
- `~/.klaudiusz-sandbox/` directory
- `~/.local/bin/klaudiusz` symlink
- Docker image (`klaudiusz-sandbox`)
- `.dockerignore` from `~/.claude/`

## License

MIT
