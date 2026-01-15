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
const ALIAS_NAME = 'claude-sandbox';

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

async function main() {
  log('\n╔══════════════════════════════════════════╗', colors.blue);
  log('║   Claude Sandbox Setup                   ║', colors.blue);
  log('║   Docker + Bun environment for Claude    ║', colors.blue);
  log('╚══════════════════════════════════════════╝', colors.blue);

  // Step 1: Check prerequisites
  logStep('1/4', 'Checking prerequisites...');

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
  logStep('2/4', 'Installing Dockerfile template...');

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
  logStep('3/4', 'Building Docker image...');
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

  // Step 4: Add shell alias
  logStep('4/4', 'Configuring shell alias...');

  const shells = [
    { name: 'zsh', rc: path.join(HOME, '.zshrc') },
    { name: 'bash', rc: path.join(HOME, '.bashrc') },
  ];

  let aliasAdded = false;
  const dockerfilePath = templateDst.replace(HOME, '~');
  const claudeHomePath = CLAUDE_HOME.replace(HOME, '~');
  const aliasCmd = `docker build -q -t ${IMAGE_NAME} -f "${dockerfilePath}" "${claudeHomePath}" && docker sandbox run --template ${IMAGE_NAME} claude`;
  const aliasLine = `alias ${ALIAS_NAME}='${aliasCmd}'`;

  for (const shell of shells) {
    if (fs.existsSync(shell.rc)) {
      const content = fs.readFileSync(shell.rc, 'utf8');
      if (content.includes(ALIAS_NAME)) {
        logSuccess(`Alias already exists in ${shell.rc}`);
        aliasAdded = true;
      } else {
        const answer = await prompt(`  Add alias to ${shell.rc}? [Y/n] `);
        if (answer !== 'n') {
          fs.appendFileSync(shell.rc, `\n# Claude Sandbox\n${aliasLine}\n`);
          logSuccess(`Added alias to ${shell.rc}`);
          aliasAdded = true;
        }
      }
    }
  }

  if (!aliasAdded) {
    logWarn('No shell config found. Add this alias manually:');
    log(`    ${aliasLine}`, colors.dim);
  }

  // Done!
  log('\n╔══════════════════════════════════════════╗', colors.green);
  log('║   Setup complete!                        ║', colors.green);
  log('╚══════════════════════════════════════════╝', colors.green);

  log('\nUsage:', colors.blue);
  log(`  ${ALIAS_NAME}              # Start sandbox in current directory`);
  log(`  ${ALIAS_NAME} --resume    # Resume previous session`);

  log('\nRestart your shell or run:', colors.dim);
  log(`  source ~/.zshrc`, colors.dim);
}

main().catch((err) => {
  logError(err.message);
  process.exit(1);
});
