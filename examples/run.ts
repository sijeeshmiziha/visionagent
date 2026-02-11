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

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');

interface ExampleEntry {
  value: string;
  name: string;
  group: 'Core' | 'Figma' | 'Hello World' | 'Stitch';
  envVars: string[];
}

const EXAMPLES: ExampleEntry[] = [
  {
    value: 'examples/core/01-basic-model.ts',
    name: '01 - Basic Model',
    group: 'Core',
    envVars: [],
  },
  {
    value: 'examples/core/02-all-providers.ts',
    name: '02 - All Providers',
    group: 'Core',
    envVars: [],
  },
  {
    value: 'examples/core/03-tool-calling.ts',
    name: '03 - Tool Calling',
    group: 'Core',
    envVars: [],
  },
  {
    value: 'examples/core/04-agent-with-multiple-tools.ts',
    name: '04 - Agent with Multiple Tools',
    group: 'Core',
    envVars: [],
  },
  {
    value: 'examples/hello-world/01-hello-world.ts',
    name: '01 - Hello World',
    group: 'Hello World',
    envVars: [],
  },
  { value: 'examples/figma/01-whoami.ts', name: '01 - Whoami', group: 'Figma', envVars: [] },
  {
    value: 'examples/figma/02-get-screenshot.ts',
    name: '02 - Get Screenshot',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/03-get-design-context.ts',
    name: '03 - Get Design Context',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/04-get-metadata.ts',
    name: '04 - Get Metadata',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/05-get-variable-defs.ts',
    name: '05 - Get Variable Defs',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/06-get-code-connect-map.ts',
    name: '06 - Get Code Connect Map',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/07-add-code-connect-map.ts',
    name: '07 - Add Code Connect Map',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/08-get-code-connect-suggestions.ts',
    name: '08 - Get Code Connect Suggestions',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/09-send-code-connect-mappings.ts',
    name: '09 - Send Code Connect Mappings',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/10-create-design-system-rules.ts',
    name: '10 - Create Design System Rules',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/11-get-figjam.ts',
    name: '11 - Get FigJam',
    group: 'Figma',
    envVars: ['FIGMA_URL'],
  },
  {
    value: 'examples/figma/12-generate-diagram.ts',
    name: '12 - Generate Diagram',
    group: 'Figma',
    envVars: [],
  },
  {
    value: 'examples/stitch/01-create-project.ts',
    name: '01 - Create Project',
    group: 'Stitch',
    envVars: [],
  },
  {
    value: 'examples/stitch/02-get-project.ts',
    name: '02 - Get Project',
    group: 'Stitch',
    envVars: ['STITCH_PROJECT_ID'],
  },
  {
    value: 'examples/stitch/03-list-projects.ts',
    name: '03 - List Projects',
    group: 'Stitch',
    envVars: [],
  },
  {
    value: 'examples/stitch/04-list-screens.ts',
    name: '04 - List Screens',
    group: 'Stitch',
    envVars: ['STITCH_PROJECT_ID'],
  },
  {
    value: 'examples/stitch/05-get-screen.ts',
    name: '05 - Get Screen',
    group: 'Stitch',
    envVars: ['STITCH_PROJECT_ID', 'STITCH_SCREEN_ID'],
  },
  {
    value: 'examples/stitch/06-generate-screen.ts',
    name: '06 - Generate Screen',
    group: 'Stitch',
    envVars: ['STITCH_PROJECT_ID'],
  },
  {
    value: 'examples/stitch/07-edit-screens.ts',
    name: '07 - Edit Screens',
    group: 'Stitch',
    envVars: ['STITCH_PROJECT_ID', 'STITCH_SCREEN_ID'],
  },
  {
    value: 'examples/stitch/08-generate-variants.ts',
    name: '08 - Generate Variants',
    group: 'Stitch',
    envVars: ['STITCH_PROJECT_ID', 'STITCH_SCREEN_ID'],
  },
];

const ENV_VAR_LABELS: Record<string, string> = {
  FIGMA_URL: 'Figma URL (design or file link with optional node-id)',
  STITCH_PROJECT_ID: 'Stitch project ID',
  STITCH_SCREEN_ID: 'Stitch screen ID (comma-separated for multiple)',
};

const ENV_VAR_DEFAULTS: Record<string, string> = {
  FIGMA_URL: 'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833',
  STITCH_PROJECT_ID: '4044680601076201931',
  STITCH_SCREEN_ID: '98b50e2ddc9943efb387052637738f61',
};

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
  const env = { ...process.env, ...envOverrides };
  execSync(`npx tsx --env-file=.env ${scriptPath}`, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
}

const GROUPS = ['Core', 'Figma', 'Hello World', 'Stitch'] as const;
type Group = (typeof GROUPS)[number];

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
