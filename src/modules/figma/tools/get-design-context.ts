/**
 * Figma get_design_context tool - structured node tree with styles, layout, typography
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { FigmaClient } from '../client';
import { formatNodeIdForApi } from '../utils';
import type { FigmaNode, DesignContext } from '../types';

function nodeToDesignContext(node: FigmaNode): DesignContext {
  const bounds = node.absoluteBoundingBox ?? node.absoluteRenderBounds;
  const ctx: DesignContext = {
    nodeId: node.id,
    name: node.name,
    type: node.type,
    bounds: bounds
      ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
      : undefined,
    text: node.characters,
    cornerRadius: node.cornerRadius,
  };
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    ctx.layout = {
      mode: node.layoutMode,
      padding:
        node.paddingLeft != null
          ? {
              top: node.paddingTop ?? 0,
              right: node.paddingRight ?? 0,
              bottom: node.paddingBottom ?? 0,
              left: node.paddingLeft ?? 0,
            }
          : undefined,
      itemSpacing: node.itemSpacing,
      alignment: node.primaryAxisAlignItems ?? node.counterAxisAlignItems,
    };
  }
  if (node.fills?.length) {
    const fill = node.fills[0];
    if (fill?.color) {
      const { r, g, b, a } = fill.color;
      ctx.fills = [
        {
          type: fill.type,
          color: `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`,
          opacity: a,
        },
      ];
    }
  }
  if (node.style) {
    ctx.typography = {
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      lineHeight: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
    };
  }
  if (node.children?.length) {
    ctx.children = node.children.map(nodeToDesignContext);
  }
  return ctx;
}

export const figmaGetDesignContextTool = defineTool({
  name: 'figma_get_design_context',
  description:
    'Returns structured design context for a Figma node: layout, styles, typography, bounds. Use for code generation.',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    nodeId: z.string().describe('Node ID (e.g. 1:2 or 1-2)'),
    depth: z.number().min(1).max(10).optional().describe('Max depth to traverse'),
  }),
  handler: async ({ fileKey, nodeId }) => {
    const client = new FigmaClient();
    const id = formatNodeIdForApi(nodeId);
    const res = await client.getFileNodes(fileKey, [id]);
    const entry = res.nodes?.[id.replace(':', '-')];
    const doc = entry?.document;
    if (!doc) {
      return { error: 'Node not found', designContext: null };
    }
    const designContext = nodeToDesignContext(doc);
    return { designContext };
  },
});
