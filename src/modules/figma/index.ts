/**
 * Figma module - tools and agent for Figma design context
 */

export { runFigmaAgent } from './agents';
export type { FigmaAgentConfig } from './agents';

export {
  createFigmaToolSet,
  figmaWhoamiTool,
  figmaGetScreenshotTool,
  figmaGetDesignContextTool,
  figmaGetMetadataTool,
  figmaGetVariableDefsTool,
  figmaGetCodeConnectMapTool,
  figmaAddCodeConnectMapTool,
  figmaGetCodeConnectSuggestionsTool,
  figmaSendCodeConnectMappingsTool,
  figmaCreateDesignSystemRulesTool,
  figmaGetFigjamTool,
  figmaGenerateDiagramTool,
  getStoredMappings,
  setStoredMappings,
} from './tools';

export { FigmaClient } from './client';
export type { FigmaClientOptions } from './client';

export type {
  FigmaConfig,
  FigmaUserResponse,
  FigmaNode,
  FigmaFileResponse,
  FigmaFileNodesResponse,
  FigmaImageResponse,
  FigmaVariablesResponse,
  FigmaVariable,
  FigmaVariableCollection,
  FigmaComponentMeta,
  FigmaStyleMeta,
  DesignContext,
  CodeConnectMapping,
  CodeConnectSuggestion,
} from './types';

export {
  parseFigmaUrl,
  formatNodeId,
  formatNodeIdForApi,
  formatNodeIdForUrl,
  buildNodeTree,
  extractDesignTokens,
} from './utils';
