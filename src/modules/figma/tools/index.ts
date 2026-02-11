/**
 * Figma tools - re-exports all 12 tools and createFigmaToolSet
 */

import { createToolSet } from '../../../lib/tools';
import type { FigmaConfig } from '../types';
import { figmaWhoamiTool } from './whoami';
import { figmaGetScreenshotTool } from './get-screenshot';
import { figmaGetDesignContextTool } from './get-design-context';
import { figmaGetMetadataTool } from './get-metadata';
import { figmaGetVariableDefsTool } from './get-variable-defs';
import { figmaGetCodeConnectMapTool } from './get-code-connect-map';
import { figmaAddCodeConnectMapTool } from './add-code-connect-map';
import { figmaGetCodeConnectSuggestionsTool } from './get-code-connect-suggestions';
import { figmaSendCodeConnectMappingsTool } from './send-code-connect-mappings';
import { figmaCreateDesignSystemRulesTool } from './create-design-system-rules';
import { figmaGetFigjamTool } from './get-figjam';
import { figmaGenerateDiagramTool } from './generate-diagram';

export { figmaWhoamiTool } from './whoami';
export { figmaGetScreenshotTool } from './get-screenshot';
export { figmaGetDesignContextTool } from './get-design-context';
export { figmaGetMetadataTool } from './get-metadata';
export { figmaGetVariableDefsTool } from './get-variable-defs';
export { figmaGetCodeConnectMapTool } from './get-code-connect-map';
export {
  figmaAddCodeConnectMapTool,
  getStoredMappings,
  setStoredMappings,
} from './add-code-connect-map';
export { figmaGetCodeConnectSuggestionsTool } from './get-code-connect-suggestions';
export { figmaSendCodeConnectMappingsTool } from './send-code-connect-mappings';
export { figmaCreateDesignSystemRulesTool } from './create-design-system-rules';
export { figmaGetFigjamTool } from './get-figjam';
export { figmaGenerateDiagramTool } from './generate-diagram';

export function createFigmaToolSet(_config?: FigmaConfig) {
  return createToolSet({
    figma_whoami: figmaWhoamiTool,
    figma_get_screenshot: figmaGetScreenshotTool,
    figma_get_design_context: figmaGetDesignContextTool,
    figma_get_metadata: figmaGetMetadataTool,
    figma_get_variable_defs: figmaGetVariableDefsTool,
    figma_get_code_connect_map: figmaGetCodeConnectMapTool,
    figma_add_code_connect_map: figmaAddCodeConnectMapTool,
    figma_get_code_connect_suggestions: figmaGetCodeConnectSuggestionsTool,
    figma_send_code_connect_mappings: figmaSendCodeConnectMappingsTool,
    figma_create_design_system_rules: figmaCreateDesignSystemRulesTool,
    figma_get_figjam: figmaGetFigjamTool,
    figma_generate_diagram: figmaGenerateDiagramTool,
  });
}
