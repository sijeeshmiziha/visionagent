/**
 * Interactive example launcher.
 * Select an example and provide env-var inputs via prompts, then run the example.
 * API keys are read from .env only; this script does not prompt for them.
 *
 * Run: npm run example:interactive
 */

import { select, input, confirm } from '@inquirer/prompts';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { EXAMPLES, ENV_VAR_LABELS, ENV_VAR_DEFAULTS, GROUPS, type Group } from './lib/registry.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');

async function promptForEnvVars(envVars: string[]): Promise<Record<string, string>> {
  const collected: Record<string, string> = {};
  for (const key of envVars) {
    const label = ENV_VAR_LABELS[key] ?? key;
    const defaultValue = ENV_VAR_DEFAULTS[key] ?? '';
    const value = await input({
      message: label,
      default: defaultValue,
    });
    collected[key] = value;
  }
  return collected;
}

function runExample(scriptPath: string, envOverrides: Record<string, string>): void {
  const nonEmptyOverrides = Object.fromEntries(
    Object.entries(envOverrides).filter(([, v]) => v !== '')
  );
  const env = { ...process.env, ...nonEmptyOverrides };
  execSync(`npx tsx --env-file=.env ${scriptPath}`, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
}

async function main(): Promise<void> {
  const selectedGroup = await select<Group>({
    message: 'Select a folder',
    choices: GROUPS.map(g => ({ value: g, name: g })),
  });

  const examplesInGroup = EXAMPLES.filter(e => e.group === selectedGroup);
  const selectedPath = await select({
    message: `Select an example (${selectedGroup})`,
    choices: examplesInGroup.map(e => ({ value: e.value, name: e.name })),
  });

  const entry = examplesInGroup.find(e => e.value === selectedPath);
  if (!entry) {
    console.error('Unknown example:', selectedPath);
    process.exit(1);
  }

  const envOverrides = entry.envVars.length > 0 ? await promptForEnvVars(entry.envVars) : {};

  console.log(`\nRunning: ${entry.name}\n`);
  runExample(entry.value, envOverrides);

  const runAgain = await confirm({
    message: 'Run another example?',
    default: true,
  });

  if (runAgain) {
    await main();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
