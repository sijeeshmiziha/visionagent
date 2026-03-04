/**
 * Figma module - tools, agent, and converter for Figma design-to-code
 */

export { runFigmaAgent, runFigmaToCodeAgent } from './agents';
export type { FigmaAgentConfig, FigmaToCodeAgentConfig } from './agents';

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
  figmaConvertToReactTool,
  figmaCleanupCodeTool,
  figmaExtractComponentsTool,
  getStoredMappings,
  setStoredMappings,
} from './tools';

export {
  FigmaToReact,
  convertFigmaToReact,
  FigmaToHTML,
  FigmaToTailwindConverter,
  transformJsx,
  cleanupGeneratedCode,
} from './converter';
export type { FigmaToHTMLOptions, FigmaToReactOptions, FigmaToReactResult } from './converter';

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
