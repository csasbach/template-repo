/**
 * check-deprecations.js
 *
 * Scans all npm packages for deprecation warnings and outdated major versions.
 * Exits with code 1 if any un-accepted issue is found.
 *
 * Configure accepted deprecations in .deprecations.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, '.deprecations.json');
const DIRS = [{ name: 'root', cwd: ROOT }];

let exitCode = 0;
let accepted = [];

function loadAccepted() {
  try {
    accepted = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')).accepted || [];
  } catch {
    accepted = [];
  }
}

function isAccepted(msg) {
  return accepted.some((a) => msg.includes(a));
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });
  } catch (e) {
    return e.stdout || '';
  }
}

function checkOutdated() {
  for (const dir of DIRS) {
    const out = run(`npm outdated --long --prefix ${dir.cwd} 2>/dev/null || true`);
    if (!out.trim()) continue;
    const lines = out.trim().split('\n');
    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length < 4) continue;
      const [pkg, current, wanted, latest] = parts;
      const curMajor = parseInt(current?.split('.')[0] || '0', 10);
      const latMajor = parseInt(latest?.split('.')[0] || '0', 10);
      const diff = latMajor - curMajor;
      const isDev = line.includes('devDependencies') || dir.name === 'root';
      const threshold = isDev ? 2 : 1;
      if (diff >= threshold) {
        const msg = `${dir.name}: ${pkg} ${current} → ${latest} (${diff} major versions behind)`;
        if (isAccepted(msg)) {
          console.log(`  (accepted) ${msg}`);
        } else {
          console.error(`  FAIL: ${msg}`);
          exitCode = 1;
        }
      }
    }
  }
}

function checkDeprecations() {
  for (const dir of DIRS) {
    const stderr = run(`npm install --dry-run --prefix ${dir.cwd} 2>&1 >/dev/null || true`);
    const deprecations = stderr.split('\n').filter((l) => l.includes('npm warn deprecated'));
    for (const line of deprecations) {
      if (isAccepted(line)) {
        console.log(`  (accepted) ${line.trim()}`);
      } else {
        console.error(`  FAIL: ${line.trim()}`);
        exitCode = 1;
      }
    }
  }
}

console.log('\n--- Deprecation & Obsolescence Check ---\n');
loadAccepted();

console.log('[1/2] Checking outdated packages...');
checkOutdated();

console.log('[2/2] Checking install deprecation warnings...');
checkDeprecations();

console.log('');
if (exitCode === 0) {
  console.log('✓ All checks passed');
} else {
  console.error('✗ Some checks failed — see above');
}
process.exit(exitCode);
