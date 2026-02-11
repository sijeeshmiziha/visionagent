/**
 * Stitch module - MCP-only client, tools, and agent for Google Stitch
 * See: https://stitch.withgoogle.com/docs/mcp/setup
 */

export { runStitchAgent } from './agents';
export type { StitchAgentConfig } from './agents';
export {
  stitchCreateProjectTool,
  stitchGetProjectTool,
  stitchListProjectsTool,
  stitchListScreensTool,
  stitchGetScreenTool,
  stitchGenerateScreenTool,
  stitchEditScreensTool,
  stitchGenerateVariantsTool,
  createStitchToolSet,
} from './tools';
export { StitchClient } from './client';
export type {
  StitchConfig,
  DeviceType,
  ModelId,
  CreativeRange,
  VariantAspect,
  VariantOptions,
  StitchProject,
  StitchScreen,
  CreateProjectResponse,
  ListProjectsResponse,
  ListScreensResponse,
  GenerateScreenResponse,
  EditScreensResponse,
  GenerateVariantsResponse,
} from './types';
export {
  parseProjectName,
  parseScreenName,
  buildProjectResourceName,
  buildScreenResourceName,
  formatDeviceType,
} from './utils';
