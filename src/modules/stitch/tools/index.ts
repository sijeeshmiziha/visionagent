/**
 * Stitch tools - re-exports all 8 tools and createStitchToolSet
 */

import { createToolSet } from '../../../lib/tools';
import type { StitchConfig } from '../types';
import { stitchCreateProjectTool, createCreateProjectTool } from './create-project';
import { stitchGetProjectTool, createGetProjectTool } from './get-project';
import { stitchListProjectsTool, createListProjectsTool } from './list-projects';
import { stitchListScreensTool, createListScreensTool } from './list-screens';
import { stitchGetScreenTool, createGetScreenTool } from './get-screen';
import { stitchGenerateScreenTool, createGenerateScreenTool } from './generate-screen';
import { stitchEditScreensTool, createEditScreensTool } from './edit-screens';
import { stitchGenerateVariantsTool, createGenerateVariantsTool } from './generate-variants';
import { stitchAnalyzeDesignTool, createAnalyzeDesignTool } from './analyze-design';

export { stitchCreateProjectTool } from './create-project';
export { stitchGetProjectTool } from './get-project';
export { stitchListProjectsTool } from './list-projects';
export { stitchListScreensTool } from './list-screens';
export { stitchGetScreenTool } from './get-screen';
export { stitchGenerateScreenTool } from './generate-screen';
export { stitchEditScreensTool } from './edit-screens';
export { stitchGenerateVariantsTool } from './generate-variants';
export { stitchAnalyzeDesignTool } from './analyze-design';
export type { ScreenDesignSummary } from './analyze-design';

export function createStitchToolSet(config?: StitchConfig) {
  if (!config) {
    return createToolSet({
      stitch_create_project: stitchCreateProjectTool,
      stitch_get_project: stitchGetProjectTool,
      stitch_list_projects: stitchListProjectsTool,
      stitch_list_screens: stitchListScreensTool,
      stitch_get_screen: stitchGetScreenTool,
      stitch_generate_screen: stitchGenerateScreenTool,
      stitch_edit_screens: stitchEditScreensTool,
      stitch_generate_variants: stitchGenerateVariantsTool,
      stitch_analyze_design: stitchAnalyzeDesignTool,
    });
  }
  return createToolSet({
    stitch_create_project: createCreateProjectTool(config),
    stitch_get_project: createGetProjectTool(config),
    stitch_list_projects: createListProjectsTool(config),
    stitch_list_screens: createListScreensTool(config),
    stitch_get_screen: createGetScreenTool(config),
    stitch_generate_screen: createGenerateScreenTool(config),
    stitch_edit_screens: createEditScreensTool(config),
    stitch_generate_variants: createGenerateVariantsTool(config),
    stitch_analyze_design: createAnalyzeDesignTool(config),
  });
}

/** Read-only Stitch tools for subagents: get_project, list_screens, get_screen, analyze_design. */
export function createStitchReadOnlyToolSet(config?: StitchConfig) {
  if (!config) {
    return createToolSet({
      stitch_get_project: stitchGetProjectTool,
      stitch_list_screens: stitchListScreensTool,
      stitch_get_screen: stitchGetScreenTool,
      stitch_analyze_design: stitchAnalyzeDesignTool,
    });
  }
  return createToolSet({
    stitch_get_project: createGetProjectTool(config),
    stitch_list_screens: createListScreensTool(config),
    stitch_get_screen: createGetScreenTool(config),
    stitch_analyze_design: createAnalyzeDesignTool(config),
  });
}
