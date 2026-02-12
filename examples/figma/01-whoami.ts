/**
 * Figma Example: whoami
 *
 * Returns the authenticated Figma user's identity (email, handle, teams).
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 01-whoami.ts
 */
import { executeTool, figmaWhoamiTool } from 'visionagent';

async function main() {
  console.log('=== figma_whoami ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  const result = await executeTool(figmaWhoamiTool, {});

  if (result.success) {
    const user = result.output as {
      id?: string;
      email?: string;
      handle?: string;
      img_url?: string;
    };
    console.log('Authenticated user:');
    console.log('  Email :', user.email);
    console.log('  Handle:', user.handle);
    console.log('  ID    :', user.id);
    if (user.img_url) console.log('  Avatar:', user.img_url);
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
