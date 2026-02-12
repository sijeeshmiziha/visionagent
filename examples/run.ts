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
    envVars: ['PROVIDER', 'MODEL', 'PROMPT', 'TEMPERATURE'],
  },
  {
    value: 'examples/core/02-all-providers.ts',
    name: '02 - All Providers',
    group: 'Core',
    envVars: ['PROMPT'],
  },
  {
    value: 'examples/core/03-tool-calling.ts',
    name: '03 - Tool Calling',
    group: 'Core',
    envVars: ['PROVIDER', 'MODEL', 'AGENT_INPUT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/core/04-agent-with-multiple-tools.ts',
    name: '04 - Agent with Multiple Tools',
    group: 'Core',
    envVars: ['PROVIDER', 'MODEL', 'AGENT_INPUT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/core/05-subagents.ts',
    name: '05 - Subagents',
    group: 'Core',
    envVars: ['PROVIDER', 'MODEL', 'AGENT_INPUT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/hello-world/01-hello-world.ts',
    name: '01 - Hello World',
    group: 'Hello World',
    envVars: ['PROVIDER', 'MODEL', 'AGENT_INPUT', 'SYSTEM_PROMPT', 'MAX_ITERATIONS'],
  },
  { value: 'examples/figma/01-whoami.ts', name: '01 - Whoami', group: 'Figma', envVars: [] },
  {
    value: 'examples/figma/02-get-screenshot.ts',
    name: '02 - Get Screenshot',
    group: 'Figma',
    envVars: ['FIGMA_URL', 'FIGMA_FORMAT', 'FIGMA_SCALE'],
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
    envVars: ['FIGMA_URL', 'FIGMA_NODE_ID', 'FIGMA_COMPONENT_NAME', 'FIGMA_SOURCE', 'FIGMA_LABEL'],
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
    envVars: ['FIGMA_URL', 'FIGMA_MAPPINGS_JSON'],
  },
  {
    value: 'examples/figma/10-create-design-system-rules.ts',
    name: '10 - Create Design System Rules',
    group: 'Figma',
    envVars: ['FIGMA_URL', 'FIGMA_OUTPUT_PATH'],
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
    envVars: ['STITCH_TITLE'],
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
    envVars: ['STITCH_FILTER'],
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
    envVars: ['STITCH_PROJECT_ID', 'STITCH_PROMPT', 'STITCH_DEVICE_TYPE'],
  },
  {
    value: 'examples/stitch/07-edit-screens.ts',
    name: '07 - Edit Screens',
    group: 'Stitch',
    envVars: ['STITCH_PROJECT_ID', 'STITCH_SCREEN_ID', 'STITCH_PROMPT'],
  },
  {
    value: 'examples/stitch/08-generate-variants.ts',
    name: '08 - Generate Variants',
    group: 'Stitch',
    envVars: [
      'STITCH_PROJECT_ID',
      'STITCH_SCREEN_ID',
      'STITCH_PROMPT',
      'STITCH_VARIANT_COUNT',
      'STITCH_CREATIVE_RANGE',
    ],
  },
  {
    value: 'examples/stitch/09-run-agent.ts',
    name: '09 - Run Agent',
    group: 'Stitch',
    envVars: ['STITCH_PROMPT', 'STITCH_MODEL', 'STITCH_MAX_ITERATIONS'],
  },
];

const ENV_VAR_LABELS: Record<string, string> = {
  PROVIDER: 'AI provider (openai | anthropic | google)',
  MODEL: 'Model name (e.g. gpt-4o-mini)',
  PROMPT: 'User prompt',
  TEMPERATURE: 'Temperature (0-2)',
  AGENT_INPUT: 'Agent input / task',
  SYSTEM_PROMPT: 'System prompt',
  MAX_ITERATIONS: 'Max agent iterations',
  FIGMA_URL: 'Figma URL (design or file link with optional node-id)',
  FIGMA_FORMAT: 'Screenshot format (png | jpg | svg | pdf)',
  FIGMA_SCALE: 'Screenshot scale (e.g. 2)',
  FIGMA_OUTPUT_PATH: 'Design system rules output path',
  FIGMA_NODE_ID: 'Figma node ID (if not in URL)',
  FIGMA_COMPONENT_NAME: 'Code Connect component name',
  FIGMA_SOURCE: 'Code Connect source path',
  FIGMA_LABEL: 'Code Connect label (React | Vue | Svelte | etc.)',
  FIGMA_MAPPINGS_JSON: 'JSON array of { nodeId, componentName, source, label }',
  STITCH_PROJECT_ID: 'Stitch project ID',
  STITCH_SCREEN_ID: 'Stitch screen ID (comma-separated for multiple)',
  STITCH_TITLE: 'Project title',
  STITCH_FILTER: 'List filter (view=owned | view=shared)',
  STITCH_PROMPT: 'Screen prompt (generate/edit/variant)',
  STITCH_DEVICE_TYPE: 'Device type (MOBILE | DESKTOP | TABLET | AGNOSTIC)',
  STITCH_VARIANT_COUNT: 'Number of variants',
  STITCH_CREATIVE_RANGE: 'Creative range (REFINE | EXPLORE | REIMAGINE)',
  STITCH_MODEL: 'Model name (e.g. gpt-4o-mini)',
  STITCH_MAX_ITERATIONS: 'Max agent iterations',
};

const ENV_VAR_DEFAULTS: Record<string, string> = {
  PROVIDER: 'openai',
  MODEL: 'gpt-4o-mini',
  PROMPT: 'Explain what TypeScript is in one sentence.',
  TEMPERATURE: '0.7',
  AGENT_INPUT: 'What is 25 multiplied by 4?',
  SYSTEM_PROMPT:
    'You are a friendly greeter. Use the hello_world tool to greet each person the user mentions.',
  MAX_ITERATIONS: '5',
  FIGMA_URL: 'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833',
  FIGMA_FORMAT: 'png',
  FIGMA_SCALE: '2',
  FIGMA_OUTPUT_PATH: '.cursor/rules/figma-design-system.md',
  FIGMA_NODE_ID: '',
  FIGMA_COMPONENT_NAME: 'HeroSection',
  FIGMA_SOURCE: 'src/components/HeroSection.tsx',
  FIGMA_LABEL: 'React',
  FIGMA_MAPPINGS_JSON:
    '[{"nodeId":"11301:18833","componentName":"HeroSection","source":"src/components/HeroSection.tsx","label":"React"}]',
  STITCH_PROJECT_ID: '4044680601076201931',
  STITCH_SCREEN_ID: '98b50e2ddc9943efb387052637738f61',
  STITCH_TITLE: 'VisionAgent Test Project',
  STITCH_FILTER: 'view=owned',
  STITCH_PROMPT: 'A simple login screen with email and password fields and a sign-in button.',
  STITCH_DEVICE_TYPE: 'MOBILE',
  STITCH_VARIANT_COUNT: '2',
  STITCH_CREATIVE_RANGE: 'EXPLORE',
  STITCH_MODEL: 'gpt-4o-mini',
  STITCH_MAX_ITERATIONS: '10',
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
