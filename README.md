# claude-sandbox-setup

Setup Claude Code Docker sandbox with Bun and TypeScript.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker AI Tools Extension](https://hub.docker.com/extensions/docker/labs-ai-tools-for-devs)

## Installation

```bash
# Install globally with bun (recommended)
bun install -g claude-sandbox-setup

# Or with npm
npm install -g claude-sandbox-setup
```

Then run the setup:

```bash
claude-sandbox-setup
```

### One-liner (without global install)

```bash
bunx claude-sandbox-setup && bunx claude-sandbox
# or: npx claude-sandbox-setup && npx claude-sandbox
```

## What it does

1. Installs the Dockerfile template to `~/.klaudiusz-sandbox/`
2. Copies `.dockerignore` to `~/.claude/`
3. Builds the Docker image (`claude-dev-bun`)

## Usage

After running setup:

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
docker build -t claude-dev-bun -f ~/.klaudiusz-sandbox/Dockerfile.bun ~/.claude
```

## Uninstall

To remove all Claude Sandbox artifacts:

```bash
claude-sandbox-setup --uninstall
```

This removes:
- Docker image (`claude-dev-bun`)
- Sandbox directory (`~/.klaudiusz-sandbox`)
- `.dockerignore` from `~/.claude`

Then remove the CLI:

```bash
# If installed with bun
bun uninstall -g claude-sandbox-setup

# If installed with npm
npm uninstall -g claude-sandbox-setup
```

## Development

For local development:

```bash
# Link the package globally
bun link

# Now both commands are available
claude-sandbox-setup
claude-sandbox

# To unlink
bun unlink
```

## License

MIT
