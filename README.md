# Klaudiusz Sandbox

Docker sandbox environment for Claude Code with Bun and TypeScript.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker AI Tools Extension](https://hub.docker.com/extensions/docker/labs-ai-tools-for-devs)

## Installation

```bash
# Install globally with bun (recommended)
bun install -g klaudiusz-sandbox

# Or with npm
npm install -g klaudiusz-sandbox
```

Then run the setup:

```bash
klaudiusz-sandbox-setup
```

### Without global install

Run setup once, then use `bunx`/`npx` each time:

```bash
bunx klaudiusz-sandbox-setup   # one-time setup
bunx klaudiusz-sandbox         # run sandbox
```

## What it does

1. Installs the Dockerfile template to `~/.klaudiusz-sandbox/`
2. Copies `.dockerignore` to `~/.claude/`
3. Builds the Docker image (`claude-dev-bun`)

## Usage

After running setup:

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

## Manual rebuild

If you update your settings or plugins:

```bash
docker build -t claude-dev-bun -f ~/.klaudiusz-sandbox/Dockerfile.bun ~/.claude
```

## Uninstall

To remove all Klaudiusz Sandbox artifacts:

```bash
klaudiusz-sandbox-setup --uninstall
```

This removes:
- Docker image (`claude-dev-bun`)
- Sandbox directory (`~/.klaudiusz-sandbox`)
- `.dockerignore` from `~/.claude`

Then remove the CLI:

```bash
# If installed with bun
bun uninstall -g klaudiusz-sandbox

# If installed with npm
npm uninstall -g klaudiusz-sandbox
```

## Development

For local development:

```bash
# Link the package globally
bun link

# Now both commands are available
klaudiusz-sandbox-setup
klaudiusz-sandbox

# To unlink
bun unlink
```

## License

MIT
