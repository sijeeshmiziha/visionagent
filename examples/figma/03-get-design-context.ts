/**
 * Figma Example: get_design_context
 *
 * Get UI code context (layout, styles, typography) for a node.
 *
 * Setup:
 *   npm install visionagent
 *   export FIGMA_API_KEY="figd_..."
 *
 * Run:
 *   npx tsx 03-get-design-context.ts
 */
import { executeTool, figmaGetDesignContextTool, parseFigmaUrl } from 'visionagent';
import type { DesignContext } from 'visionagent';

const DEFAULT_FIGMA_URL =
  'https://www.figma.com/design/e6yvvRTNOUyoSecHnjnpWZ/Fitstatic-V1?node-id=11301-18833';

function printContext(ctx: DesignContext, indent = 0) {
  const pad = '  '.repeat(indent);
  console.log(`${pad}${ctx.type} "${ctx.name}" (${ctx.nodeId})`);

  if (ctx.bounds) {
    console.log(
      `${pad}  bounds: ${ctx.bounds.width}x${ctx.bounds.height} at (${ctx.bounds.x}, ${ctx.bounds.y})`
    );
  }
  if (ctx.layout) {
    console.log(`${pad}  layout: ${ctx.layout.mode}, spacing=${ctx.layout.itemSpacing ?? '-'}`);
  }
  if (ctx.fills?.length) {
    console.log(`${pad}  fill  : ${ctx.fills[0]?.color}`);
  }
  if (ctx.typography) {
    const t = ctx.typography;
    console.log(`${pad}  font  : ${t.fontFamily} ${t.fontSize}px w${t.fontWeight}`);
  }
  if (ctx.text) {
    console.log(`${pad}  text  : "${ctx.text.slice(0, 60)}${ctx.text.length > 60 ? '...' : ''}"`);
  }
  if (ctx.children) {
    for (const child of ctx.children.slice(0, 5)) {
      printContext(child, indent + 1);
    }
    if (ctx.children.length > 5) {
      console.log(`${pad}  ... and ${ctx.children.length - 5} more children`);
    }
  }
}

async function main() {
  console.log('=== figma_get_design_context ===\n');

  if (!process.env.FIGMA_API_KEY) {
    console.error('FIGMA_API_KEY is not set. Set it in your environment and run again.');
    process.exit(1);
  }

  const figmaUrl = process.env.FIGMA_URL ?? DEFAULT_FIGMA_URL;
  const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);
  if (!nodeId) {
    console.error('URL must contain a node-id. Got:', figmaUrl);
    process.exit(1);
  }

  console.log('File key:', fileKey);
  console.log('Node ID :', nodeId, '\n');

  const result = await executeTool(figmaGetDesignContextTool, {
    fileKey,
    nodeId,
  });

  if (result.success) {
    const out = result.output as {
      designContext?: DesignContext;
      error?: string;
    };
    if (out.designContext) {
      printContext(out.designContext);
    } else {
      console.log('Node not found (design context is null).');
      if (out.error) console.log('Reason:', out.error);
    }
  } else {
    console.error('Error:', result.error);
  }
}

main().catch(console.error);
