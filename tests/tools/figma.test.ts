/**
 * Tests for Figma module: URL parsing, utils, tool set, whoami tool
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseFigmaUrl,
  formatNodeId,
  formatNodeIdForApi,
  formatNodeIdForUrl,
  buildNodeTree,
  extractDesignTokens,
  createFigmaToolSet,
  figmaWhoamiTool,
} from '../../src/modules/figma';
import type { FigmaNode, FigmaVariablesResponse } from '../../src/modules/figma/types';

describe('parseFigmaUrl', () => {
  it('extracts fileKey and nodeId from design URL', () => {
    const url = 'https://www.figma.com/design/abc123/MyFile?node-id=1-2';
    expect(parseFigmaUrl(url)).toEqual({ fileKey: 'abc123', nodeId: '1:2' });
  });

  it('extracts fileKey when no node-id', () => {
    expect(parseFigmaUrl('https://figma.com/file/xyz789/Design')).toEqual({ fileKey: 'xyz789' });
  });

  it('handles branch URL', () => {
    const url = 'https://figma.com/design/abc/branch/br1/name?node-id=42-100';
    expect(parseFigmaUrl(url)).toEqual({
      fileKey: 'abc',
      branchKey: 'br1',
      nodeId: '42:100',
    });
  });

  it('handles Make URL', () => {
    expect(parseFigmaUrl('https://figma.com/make/makeKey/name?node-id=1-2')).toEqual({
      fileKey: 'makeKey',
      nodeId: '1:2',
    });
  });

  it('handles proto URL', () => {
    expect(parseFigmaUrl('https://figma.com/proto/xyz99/Prototype?node-id=5-10')).toEqual({
      fileKey: 'xyz99',
      nodeId: '5:10',
    });
  });

  it('returns fileKey as trimmed URL for invalid or malformed URL', () => {
    expect(parseFigmaUrl('https://example.com/not-figma')).toEqual({
      fileKey: 'https://example.com/not-figma',
    });
    expect(parseFigmaUrl('  https://other.com  ')).toEqual({
      fileKey: 'https://other.com',
    });
  });
});

describe('formatNodeId', () => {
  it('converts URL form to API form', () => {
    expect(formatNodeId('1-2')).toBe('1:2');
  });
  it('converts API form to URL form', () => {
    expect(formatNodeId('1:2')).toBe('1-2');
  });
  it('returns unchanged when no separator', () => {
    expect(formatNodeId('single')).toBe('single');
  });
  it('trims whitespace', () => {
    expect(formatNodeId('  1-2  ')).toBe('1:2');
  });
});

describe('formatNodeIdForApi', () => {
  it('converts 1-2 to 1:2', () => {
    expect(formatNodeIdForApi('1-2')).toBe('1:2');
  });
  it('leaves 1:2 unchanged', () => {
    expect(formatNodeIdForApi('1:2')).toBe('1:2');
  });
});

describe('formatNodeIdForUrl', () => {
  it('converts 1:2 to 1-2', () => {
    expect(formatNodeIdForUrl('1:2')).toBe('1-2');
  });
  it('trims whitespace', () => {
    expect(formatNodeIdForUrl('  1:2  ')).toBe('1-2');
  });
});

describe('buildNodeTree', () => {
  it('returns XML-like string with id, name, type, bounds', () => {
    const node: FigmaNode = {
      id: '1:2',
      name: 'Frame',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 50 },
    };
    const out = buildNodeTree(node);
    expect(out).toContain('id="1:2"');
    expect(out).toContain('name="Frame"');
    expect(out).toContain('type="FRAME"');
    expect(out).toContain('width="100"');
    expect(out).toContain('height="50"');
    expect(out).toContain('</node>');
  });

  it('includes children', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Parent',
      type: 'FRAME',
      children: [{ id: '2', name: 'Child', type: 'RECTANGLE' }],
    };
    const out = buildNodeTree(node);
    expect(out).toContain('Parent');
    expect(out).toContain('Child');
  });

  it('handles deeply nested children (3+ levels)', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Root',
      type: 'FRAME',
      children: [
        {
          id: '2',
          name: 'Level2',
          type: 'FRAME',
          children: [
            {
              id: '3',
              name: 'Level3',
              type: 'FRAME',
              children: [{ id: '4', name: 'Leaf', type: 'RECTANGLE' }],
            },
          ],
        },
      ],
    };
    const out = buildNodeTree(node);
    expect(out).toContain('Root');
    expect(out).toContain('Level2');
    expect(out).toContain('Level3');
    expect(out).toContain('Leaf');
    expect(out).toContain('id="4"');
  });

  it('escapes special XML characters in names', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Test <tag> & "quoted"',
      type: 'FRAME',
    };
    const out = buildNodeTree(node);
    expect(out).toContain('&lt;');
    expect(out).toContain('&gt;');
    expect(out).toContain('&amp;');
    expect(out).toContain('&quot;');
    expect(out).not.toContain('<tag>');
  });

  it('handles node without bounding box', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'NoBounds',
      type: 'GROUP',
    };
    const out = buildNodeTree(node);
    expect(out).toContain('id="1"');
    expect(out).toContain('name="NoBounds"');
    expect(out).toContain('type="GROUP"');
    expect(out).not.toContain('width=');
    expect(out).not.toContain('height=');
  });
});

describe('extractDesignTokens', () => {
  it('extracts fills and bounds from node', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Rect',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 100 },
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 } }],
    };
    const tokens = extractDesignTokens(node);
    expect(tokens['fill/color']).toContain('rgba(255, 0, 0');
    expect(tokens.width).toBe(200);
    expect(tokens.height).toBe(100);
  });

  it('extracts typography from style', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Text',
      type: 'TEXT',
      style: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 600,
        lineHeightPx: 24,
      },
    };
    const tokens = extractDesignTokens(node);
    expect(tokens.fontFamily).toBe('Inter');
    expect(tokens.fontSize).toBe(16);
    expect(tokens.fontWeight).toBe(600);
    expect(tokens.lineHeight).toBe(24);
  });

  it('extracts cornerRadius, padding, itemSpacing', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Card',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
      cornerRadius: 8,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 12,
      paddingBottom: 12,
      itemSpacing: 10,
    };
    const tokens = extractDesignTokens(node);
    expect(tokens.cornerRadius).toBe(8);
    expect(tokens.paddingLeft).toBe(16);
    expect(tokens.paddingRight).toBe(16);
    expect(tokens.paddingTop).toBe(12);
    expect(tokens.paddingBottom).toBe(12);
    expect(tokens.itemSpacing).toBe(10);
  });

  it('extracts variables from variables response (color and non-color)', () => {
    const node: FigmaNode = { id: '1', name: 'N', type: 'FRAME' };
    const variablesResponse: FigmaVariablesResponse = {
      meta: {
        variableCollections: {
          c1: {
            id: 'c1',
            name: 'Collection 1',
            key: 'collection-key',
            modes: [{ modeId: 'default', name: 'Default' }],
            defaultModeId: 'default',
            hiddenFromPublishing: false,
            variableIds: ['v1', 'v2'],
          },
        },
        variables: {
          v1: {
            id: 'v1',
            name: 'primary',
            key: 'k1',
            variableCollectionId: 'c1',
            valueType: 'COLOR',
            valuesByMode: { default: { r: 0, g: 0.5, b: 1, a: 1 } },
          },
          v2: {
            id: 'v2',
            name: 'spacing',
            key: 'k2',
            variableCollectionId: 'c1',
            valueType: 'FLOAT',
            valuesByMode: { default: 16 },
          },
        },
      },
    };
    const tokens = extractDesignTokens(node, variablesResponse);
    expect(tokens.primary).toContain('rgba(0, 128, 255');
    expect(tokens.spacing).toBe(16);
  });

  it('returns empty object for node with no fills, bounds, or style', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Empty',
      type: 'GROUP',
    };
    const tokens = extractDesignTokens(node);
    expect(tokens).toEqual({});
  });
});

describe('createFigmaToolSet', () => {
  it('returns an object with 12 figma tools', () => {
    const set = createFigmaToolSet();
    expect(Object.keys(set)).toHaveLength(12);
    expect(set.figma_whoami).toBeDefined();
    expect(set.figma_get_screenshot).toBeDefined();
    expect(set.figma_get_design_context).toBeDefined();
    expect(set.figma_get_metadata).toBeDefined();
    expect(set.figma_get_variable_defs).toBeDefined();
    expect(set.figma_get_code_connect_map).toBeDefined();
    expect(set.figma_add_code_connect_map).toBeDefined();
    expect(set.figma_get_code_connect_suggestions).toBeDefined();
    expect(set.figma_send_code_connect_mappings).toBeDefined();
    expect(set.figma_create_design_system_rules).toBeDefined();
    expect(set.figma_get_figjam).toBeDefined();
    expect(set.figma_generate_diagram).toBeDefined();
  });
});

describe('figmaWhoamiTool', () => {
  beforeEach(() => {
    vi.stubEnv('FIGMA_API_KEY', 'figd_test_key');
  });

  it('has correct description', () => {
    expect(figmaWhoamiTool.description).toContain('identity');
  });

  it('calls Figma API and returns user when FIGMA_API_KEY is set', async () => {
    const result = await figmaWhoamiTool.execute!({}, { toolCallId: '', messages: [] });
    expect(result).toEqual({
      id: 'figma-user-123',
      email: 'test@example.com',
      handle: 'testuser',
    });
  });
});
