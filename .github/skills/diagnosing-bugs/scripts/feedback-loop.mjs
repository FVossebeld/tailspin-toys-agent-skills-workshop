#!/usr/bin/env node
/**
 * Run a command several times and report whether it is a tight feedback loop:
 * red-capable (non-zero exit while the bug exists), deterministic and fast.
 *
 * Usage: node feedback-loop.mjs [--runs N] -- <command ...>
 * Exit codes: 0 = consistently green, 1 = consistently red, 2 = usage error, 3 = flaky.
 */
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const TIGHT_LOOP_MS = 10_000;
const TAIL_LINES = 25;

const argv = process.argv.slice(2);
const separator = argv.indexOf('--');
const options = separator === -1 ? [] : argv.slice(0, separator);
const command = (separator === -1 ? argv : argv.slice(separator + 1)).join(' ').trim();

let runs = 3;
for (let i = 0; i < options.length; i++) {
    if (options[i] === '--runs') {
        runs = Number(options[++i]);
    }
}

if (!command || !Number.isInteger(runs) || runs < 1) {
    console.error('Usage: node feedback-loop.mjs [--runs N] -- <command ...>');
    process.exit(2);
}

const ANSI_ESCAPE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const stripAnsi = (text) => text.replace(ANSI_ESCAPE, '');
const results = [];

console.log(`Feedback loop: ${command}  (${runs} run${runs === 1 ? '' : 's'})`);

for (let run = 1; run <= runs; run++) {
    const started = performance.now();
    const result = spawnSync(command, {
        shell: true,
        encoding: 'utf8',
        env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    const ms = Math.round(performance.now() - started);
    const exitCode = result.status ?? 1;
    results.push({ exitCode, ms });
    console.log(`  run ${run}/${runs}: ${exitCode === 0 ? 'GREEN' : 'RED  '}  exit ${exitCode}  ${ms} ms`);

    if (run === 1 && exitCode !== 0) {
        // Failures usually go to stderr and the summary to stdout; show the summary last.
        const output = stripAnsi(`${result.stderr ?? ''}\n${result.stdout ?? ''}`)
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0);
        console.log(`\n  --- last ${TAIL_LINES} lines of run 1 ---`);
        for (const line of output.slice(-TAIL_LINES)) {
            console.log(`  | ${line}`);
        }
        console.log('  ---\n');
    }
}

const allGreen = results.every((r) => r.exitCode === 0);
const allRed = results.every((r) => r.exitCode !== 0);
const slowest = Math.max(...results.map((r) => r.ms));
const verdict = allGreen ? 'GREEN' : allRed ? 'RED' : 'FLAKY';

console.log(`Verdict:       ${verdict}`);
console.log(`Deterministic: ${allGreen || allRed ? 'yes' : 'no — raise the reproduction rate before hypothesising'}`);
console.log(`Slowest run:   ${slowest} ms (${slowest <= TIGHT_LOOP_MS ? 'tight' : 'slow — narrow the scope'})`);

process.exit(allGreen ? 0 : allRed ? 1 : 3);
