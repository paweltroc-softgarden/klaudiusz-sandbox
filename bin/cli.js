#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');
const readline = require('readline');

const HOME = os.homedir();
const CLAUDE_HOME = process.env.CLAUDE_HOME || path.join(HOME, '.claude');
const SANDBOX_HOME = path.join(HOME, '.klaudiusz-sandbox');
const IMAGE_NAME = 'claude-dev-bun';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

function log(msg, color = '') {
  console.log(`${color}${msg}${colors.reset}`);
}

function logStep(step, msg) {
  log(`\n[${step}] ${msg}`, colors.blue);
}

function logSuccess(msg) {
  log(`  ✓ ${msg}`, colors.green);
}

function logWarn(msg) {
  log(`  ! ${msg}`, colors.yellow);
}

function logError(msg) {
  log(`  ✗ ${msg}`, colors.red);
}

function checkCommand(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logSuccess(`Created ${dir}`);
  } else {
    logSuccess(`${dir} exists`);
  }
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function runCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', cmd], {
      stdio: 'inherit',
      ...options,
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function uninstall() {
  log('\n╔══════════════════════════════════════════╗', colors.yellow);
  log('║   Klaudiusz Sandbox Uninstall            ║', colors.yellow);
  log('╚══════════════════════════════════════════╝', colors.yellow);

  const answer = await prompt('\nThis will remove all Klaudiusz Sandbox artifacts. Continue? [y/N] ');
  if (answer !== 'y' && answer !== 'yes') {
    log('\nUninstall cancelled.', colors.dim);
    return;
  }

  // Step 1: Remove Docker image
  logStep('1/3', 'Removing Docker image...');
  try {
    execSync(`docker rmi ${IMAGE_NAME}`, { stdio: 'ignore' });
    logSuccess(`Removed image: ${IMAGE_NAME}`);
  } catch {
    logWarn(`Image ${IMAGE_NAME} not found or in use`);
  }

  // Step 2: Remove sandbox directory
  logStep('2/3', 'Removing sandbox directory...');
  if (fs.existsSync(SANDBOX_HOME)) {
    fs.rmSync(SANDBOX_HOME, { recursive: true });
    logSuccess(`Removed ${SANDBOX_HOME}`);
  } else {
    logSuccess(`${SANDBOX_HOME} not found`);
  }

  // Step 3: Remove .dockerignore from ~/.claude
  logStep('3/3', 'Removing .dockerignore...');
  const dockerignorePath = path.join(CLAUDE_HOME, '.dockerignore');
  if (fs.existsSync(dockerignorePath)) {
    fs.unlinkSync(dockerignorePath);
    logSuccess(`Removed ${dockerignorePath}`);
  } else {
    logSuccess(`.dockerignore not found`);
  }

  log('\n╔══════════════════════════════════════════╗', colors.green);
  log('║   Uninstall complete!                    ║', colors.green);
  log('╚══════════════════════════════════════════╝', colors.green);

  log('\nTo remove the CLI commands, run:', colors.dim);
  log('  npm uninstall -g klaudiusz-sandbox', colors.dim);
  log('  # or: bun unlink (if installed via bun link)', colors.dim);
}

function showHelp() {
  log('\nKlaudiusz Sandbox - Docker environment for Claude Code\n', colors.blue);
  log('Usage:', colors.green);
  log('  klaudiusz-sandbox-setup [options]\n');
  log('Options:', colors.green);
  log('  --help, -h       Show this help message');
  log('  --uninstall      Remove all Klaudiusz Sandbox artifacts\n');
  log('After setup, use:', colors.green);
  log('  klaudiusz-sandbox              Start sandbox in current directory');
  log('  klaudiusz-sandbox --resume    Resume previous session\n');
  log('More info: https://github.com/anthropics/klaudiusz-sandbox', colors.dim);
}

async function main() {
  // Check for --help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    return;
  }

  // Check for --uninstall flag
  if (process.argv.includes('--uninstall')) {
    return uninstall();
  }

  log('\n╔══════════════════════════════════════════╗', colors.blue);
  log('║   Klaudiusz Sandbox Setup                ║', colors.blue);
  log('║   Docker + Bun environment for Claude    ║', colors.blue);
  log('╚══════════════════════════════════════════╝', colors.blue);

  // Step 1: Check prerequisites
  logStep('1/3', 'Checking prerequisites...');

  if (!checkCommand('claude')) {
    logError('Claude CLI is not installed. Please install it first.');
    process.exit(1);
  }
  logSuccess('Claude CLI installed');

  if (!fs.existsSync(CLAUDE_HOME)) {
    logError(`Claude home directory not found at ${CLAUDE_HOME}`);
    process.exit(1);
  }
  logSuccess(`Claude home: ${CLAUDE_HOME}`);

  if (!checkCommand('docker')) {
    logError('Docker is not installed. Please install Docker first.');
    process.exit(1);
  }
  logSuccess('Docker installed');

  try {
    execSync('docker sandbox version', { stdio: 'ignore' });
    logSuccess('Docker sandbox available');
  } catch {
    logError('Docker sandbox extension not found.');
    log('    Install it from: https://hub.docker.com/extensions/docker/labs-ai-tools-for-devs', colors.dim);
    process.exit(1);
  }

  // Step 2: Copy Dockerfile and .dockerignore
  logStep('2/3', 'Installing Dockerfile template...');

  ensureDir(SANDBOX_HOME);

  const templateSrc = path.join(__dirname, '..', 'templates', 'Dockerfile.bun');
  const templateDst = path.join(SANDBOX_HOME, 'Dockerfile.bun');
  const dockerignoreSrc = path.join(__dirname, '..', 'templates', '.dockerignore');
  const dockerignoreDst = path.join(CLAUDE_HOME, '.dockerignore');

  if (fs.existsSync(templateSrc)) {
    fs.copyFileSync(templateSrc, templateDst);
    logSuccess(`Copied Dockerfile to ${templateDst}`);
  } else {
    logError('Template not found in package. Downloading from source...');
    // Fallback: could fetch from URL or embed inline
    process.exit(1);
  }

  // Copy .dockerignore (required to limit build context to only needed files)
  if (fs.existsSync(dockerignoreSrc)) {
    fs.copyFileSync(dockerignoreSrc, dockerignoreDst);
    logSuccess(`Copied .dockerignore to ${dockerignoreDst}`);
  } else {
    logWarn('.dockerignore template not found, creating default...');
    const defaultDockerignore = `# Exclude everything by default (future-proof)
*

# Include only what the Dockerfile needs
!plugins/
!plugins/**
!agents/
!agents/**
!skills/
!skills/**
!settings.json
`;
    fs.writeFileSync(dockerignoreDst, defaultDockerignore);
    logSuccess(`Created default .dockerignore`);
  }

  // Step 3: Build Docker image
  logStep('3/3', 'Building Docker image...');
  log(`    This may take a few minutes on first run...`, colors.dim);

  try {
    await runCommand(`docker build -t ${IMAGE_NAME} -f "${templateDst}" "${CLAUDE_HOME}"`);
    logSuccess(`Built image: ${IMAGE_NAME}`);
  } catch (err) {
    logError('Failed to build Docker image');
    log('    You can retry manually:', colors.dim);
    log(`    docker build -t ${IMAGE_NAME} -f ${templateDst} ${CLAUDE_HOME}`, colors.dim);
    process.exit(1);
  }

  // Done!
  log('\n╔══════════════════════════════════════════╗', colors.green);
  log('║   Setup complete!                        ║', colors.green);
  log('╚══════════════════════════════════════════╝', colors.green);

  log('\nUsage:', colors.blue);
  log('  klaudiusz-sandbox              # Start sandbox in current directory');
  log('  klaudiusz-sandbox --resume    # Resume previous session');
}

main().catch((err) => {
  logError(err.message);
  process.exit(1);
});
