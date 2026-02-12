/**
 * Design requirements subagents - exports all analyzer definitions
 */

export { userPersonaAnalyzerDef } from './user-persona';
export { userFlowAnalyzerDef } from './user-flow';
export { userStoryGeneratorDef } from './user-story';
export { apiRequirementsAnalyzerDef } from './api-requirements';
export { screenSummarizerDef } from './screen-summarizer';

import { userPersonaAnalyzerDef } from './user-persona';
import { userFlowAnalyzerDef } from './user-flow';
import { userStoryGeneratorDef } from './user-story';
import { apiRequirementsAnalyzerDef } from './api-requirements';
import { screenSummarizerDef } from './screen-summarizer';
import type { SubagentDefinition } from '../../../../../lib/types/subagent';

/** All design-requirements subagent definitions for createSubagentToolSet */
export const designRequirementsSubagentDefs: SubagentDefinition[] = [
  userPersonaAnalyzerDef,
  userFlowAnalyzerDef,
  userStoryGeneratorDef,
  apiRequirementsAnalyzerDef,
  screenSummarizerDef,
];
