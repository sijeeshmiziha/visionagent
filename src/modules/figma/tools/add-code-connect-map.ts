/**
 * Figma add_code_connect_map tool - record a mapping from Figma node to code component
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import type { CodeConnectMapping } from '../types';

const localMappings = new Map<string, CodeConnectMapping[]>();

export function getStoredMappings(fileKey: string): CodeConnectMapping[] {
  return localMappings.get(fileKey) ?? [];
}

export function setStoredMappings(fileKey: string, mappings: CodeConnectMapping[]): void {
  localMappings.set(fileKey, mappings);
}

export const figmaAddCodeConnectMapTool = defineTool({
  name: 'figma_add_code_connect_map',
  description:
    'Adds a mapping between a Figma node ID and a code component (source path, component name, label). Stored locally for this session.',
  input: z.object({
    fileKey: z.string().describe('Figma file key'),
    nodeId: z.string().describe('Node ID'),
    componentName: z.string().describe('Name of the component in code'),
    source: z.string().describe('Path or URL to the component in codebase'),
    label: z.string().optional().describe('Framework label e.g. React, SwiftUI'),
  }),
  handler: async ({ fileKey, nodeId, componentName, source, label }) => {
    const mapping: CodeConnectMapping = {
      nodeId,
      codeConnectSrc: source,
      codeConnectName: componentName,
      label,
    };
    const list = localMappings.get(fileKey) ?? [];
    const existing = list.findIndex(m => m.nodeId === nodeId);
    if (existing >= 0) list[existing] = mapping;
    else list.push(mapping);
    localMappings.set(fileKey, list);
    return { success: true, mapping };
  },
});
