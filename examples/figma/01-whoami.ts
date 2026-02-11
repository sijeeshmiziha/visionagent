/**
 * Figma Example: whoami
 *
 * Returns the authenticated Figma user's identity (email, handle, teams).
 *
 * Run:  npm run example -- examples/figma/01-whoami.ts
 *
 * Requires: FIGMA_API_KEY in .env
 */

import { executeTool } from '../../src/index';
import { figmaWhoamiTool } from '../../src/modules/figma';

async function main() {
  console.log('=== figma_whoami ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Add it to .env and run again.');
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
