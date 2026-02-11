/**
 * Figma module utilities - URL parsing, node ID formatting, metadata tree, design tokens
 */

import type { FigmaNode, FigmaVariablesResponse } from './types';

const FIGMA_DESIGN_URL =
  /figma\.com\/(?:design|file|proto)\/([A-Za-z0-9]+)(?:\/[^?]*)?(?:\?node-id=([\d-]+))?/;
const FIGMA_BRANCH_URL =
  /figma\.com\/design\/([A-Za-z0-9]+)\/branch\/([^/]+)(?:\/[^?]*)?(?:\?node-id=([\d-]+))?/;
const FIGMA_MAKE_URL = /figma\.com\/make\/([A-Za-z0-9]+)(?:\/[^?]*)?(?:\?node-id=([\d-]+))?/;

/**
 * Extract fileKey and optional nodeId from a Figma URL.
 * Supports design/file URLs, branch URLs, and Make URLs.
 */
export function parseFigmaUrl(url: string): {
  fileKey: string;
  nodeId?: string;
  branchKey?: string;
} {
  const trimmed = url.trim();
  const branchMatch = FIGMA_BRANCH_URL.exec(trimmed);
  if (branchMatch) {
    const fileKey = branchMatch[1];
    const branchKey = branchMatch[2];
    const nodeId = branchMatch[3] ? formatNodeIdForApi(branchMatch[3]) : undefined;
    return { fileKey: fileKey ?? trimmed, branchKey, nodeId };
  }
  const makeMatch = FIGMA_MAKE_URL.exec(trimmed);
  if (makeMatch) {
    const fileKey = makeMatch[1];
    const nodeId = makeMatch[2] ? formatNodeIdForApi(makeMatch[2]) : undefined;
    return { fileKey: fileKey ?? trimmed, nodeId };
  }
  const designMatch = FIGMA_DESIGN_URL.exec(trimmed);
  if (designMatch) {
    const fileKey = designMatch[1];
    const nodeId = designMatch[2] ? formatNodeIdForApi(designMatch[2]) : undefined;
    return { fileKey: fileKey ?? trimmed, nodeId };
  }
  return { fileKey: trimmed };
}

/**
 * Convert node-id from URL form (1-2) to API form (1:2) or vice versa.
 * If input contains ':', returns with '-'; if contains '-', returns with ':'.
 */
export function formatNodeId(nodeId: string): string {
  const normalized = nodeId.trim();
  if (normalized.includes(':')) {
    return normalized.replace(':', '-');
  }
  if (normalized.includes('-')) {
    return normalized.replace('-', ':');
  }
  return normalized;
}

/**
 * Convert URL form (1-2) to API form (1:2) for Figma REST API.
 */
export function formatNodeIdForApi(nodeId: string): string {
  const normalized = nodeId.trim();
  if (normalized.includes('-')) {
    return normalized.replace('-', ':');
  }
  return normalized;
}

/**
 * Convert API form (1:2) to URL form (1-2) for links.
 */
export function formatNodeIdForUrl(nodeId: string): string {
  const normalized = nodeId.trim();
  if (normalized.includes(':')) {
    return normalized.replace(':', '-');
  }
  return normalized;
}

/**
 * Build a sparse XML-like string from a node tree (metadata: IDs, names, types, positions, sizes).
 */
export function buildNodeTree(node: FigmaNode, indent = 0): string {
  const pad = '  '.repeat(indent);
  const bounds = node.absoluteBoundingBox ?? node.absoluteRenderBounds;
  const attrs = [
    `id="${node.id}"`,
    `name="${escapeXml(node.name)}"`,
    `type="${node.type}"`,
    ...(bounds
      ? [
          `x="${bounds.x}"`,
          `y="${bounds.y}"`,
          `width="${bounds.width}"`,
          `height="${bounds.height}"`,
        ]
      : []),
  ].join(' ');
  const open = `<node ${attrs}>`;
  if (!node.children?.length) {
    return `${pad}${open}</node>`;
  }
  const children = node.children.map(c => buildNodeTree(c, indent + 1)).join('\n');
  return `${pad}${open}\n${children}\n${pad}</node>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Extract design tokens (colors, spacing, typography) from a node and variable data.
 * Variables response can be from getLocalVariables or getPublishedVariables.
 */
export function extractDesignTokens(
  node: FigmaNode,
  variablesResponse?: FigmaVariablesResponse | null
): Record<string, string | number> {
  const tokens: Record<string, string | number> = {};

  if (node.fills?.length) {
    const fill = node.fills[0];
    if (fill?.color) {
      const { r, g, b, a } = fill.color;
      tokens['fill/color'] =
        `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
  }

  const bounds = node.absoluteBoundingBox ?? node.absoluteRenderBounds;
  if (bounds) {
    tokens.width = bounds.width;
    tokens.height = bounds.height;
  }
  if (node.cornerRadius != null) {
    tokens.cornerRadius = node.cornerRadius;
  }
  if (node.paddingLeft != null) tokens.paddingLeft = node.paddingLeft;
  if (node.paddingRight != null) tokens.paddingRight = node.paddingRight;
  if (node.paddingTop != null) tokens.paddingTop = node.paddingTop;
  if (node.paddingBottom != null) tokens.paddingBottom = node.paddingBottom;
  if (node.itemSpacing != null) tokens.itemSpacing = node.itemSpacing;

  if (node.style) {
    if (node.style.fontFamily) tokens.fontFamily = node.style.fontFamily;
    if (node.style.fontSize != null) tokens.fontSize = node.style.fontSize;
    if (node.style.fontWeight != null) tokens.fontWeight = node.style.fontWeight;
    if (node.style.lineHeightPx != null) tokens.lineHeight = node.style.lineHeightPx;
    if (node.style.letterSpacing != null) tokens.letterSpacing = node.style.letterSpacing;
  }

  if (variablesResponse?.meta?.variables) {
    const vars = variablesResponse.meta.variables;
    for (const v of Object.values(vars)) {
      const modeKey = v.valuesByMode ? Object.keys(v.valuesByMode)[0] : undefined;
      const val = modeKey != null ? v.valuesByMode[modeKey] : undefined;
      if (val != null) {
        if (typeof val === 'object' && val !== null && 'r' in val) {
          const c = val as { r: number; g: number; b: number; a?: number };
          tokens[v.name] =
            `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a ?? 1})`;
        } else {
          tokens[v.name] = val as string | number;
        }
      }
    }
  }

  return tokens;
}
