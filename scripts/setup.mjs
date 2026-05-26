#!/usr/bin/env node

/**
 * setup.mjs — Platform-agnostic project setup.
 * Installs npm dependencies, builds any native binaries, sets up Husky.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, cwd = ROOT) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function step(n, label) {
  console.log(`\n[${n}] ${label}`);
}

// Step 1: Install root dependencies
step(1, 'Installing dependencies...');
run('npm install');

// Extend with project-specific install steps below

console.log(`\n=== Setup complete ===`);
