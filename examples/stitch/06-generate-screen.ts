/**
 * Stitch Example: Generate Screen from Text
 *
 * Generate a new screen in a project from a text prompt.
 *
 * Setup:
 *   npm install visionagent
 *   export STITCH_MCP_URL="https://..."   # or STITCH_MCP_COMMAND
 *
 * Run:
 *   npx tsx 06-generate-screen.ts
 */
import { executeTool, stitchGenerateScreenTool } from 'visionagent';

const STITCH_SETUP = 'https://stitch.withgoogle.com/docs/mcp/setup';

async function main() {
  if (!process.env.STITCH_MCP_URL && !process.env.STITCH_MCP_COMMAND) {
    console.error(
      'Stitch MCP is not configured.\n' +
        'Set STITCH_MCP_URL or STITCH_MCP_COMMAND in your environment.\n' +
        'See: ' +
        STITCH_SETUP
    );
    process.exit(1);
  }

  const projectId = process.env.STITCH_PROJECT_ID ?? '4044680601076201931';
  const prompt =
    process.env.STITCH_PROMPT ??
    'A simple login screen with email and password fields and a sign-in button.';
  const deviceTypeRaw = process.env.STITCH_DEVICE_TYPE ?? 'MOBILE';
  const deviceType =
    deviceTypeRaw === 'MOBILE' ||
    deviceTypeRaw === 'DESKTOP' ||
    deviceTypeRaw === 'TABLET' ||
    deviceTypeRaw === 'AGNOSTIC'
      ? deviceTypeRaw
      : 'DEVICE_TYPE_UNSPECIFIED';

  console.log('=== stitch_generate_screen ===\n');
  console.log('Generating screen (this may take a few minutes)...\n');

  const result = await executeTool(stitchGenerateScreenTool, {
    projectId,
    prompt,
    deviceType: deviceType === 'DEVICE_TYPE_UNSPECIFIED' ? 'DEVICE_TYPE_UNSPECIFIED' : deviceType,
  });

  if (result.success) {
    const out = result.output as {
      screen?: { name: string };
      outputComponents?: string[];
    };
    console.log('Screen:', out.screen?.name ?? '—');
    if (out.outputComponents?.length) console.log('Output:', out.outputComponents);
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
