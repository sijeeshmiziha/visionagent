/**
 * Design requirements subagents - exports all analyzer definitions
 */

import { userPersonaAnalyzerDef } from './user-persona';
import { userFlowAnalyzerDef } from './user-flow';
import { userStoryGeneratorDef } from './user-story';
import { apiRequirementsAnalyzerDef } from './api-requirements';
import { screenSummarizerDef } from './screen-summarizer';
import type { SubagentDefinition } from '../../../../../lib/types/subagent';

export {
  userPersonaAnalyzerDef,
  userFlowAnalyzerDef,
  userStoryGeneratorDef,
  apiRequirementsAnalyzerDef,
  screenSummarizerDef,
};

/** All design-requirements subagent definitions for createSubagentToolSet */
export const designRequirementsSubagentDefs: SubagentDefinition[] = [
  userPersonaAnalyzerDef,
  userFlowAnalyzerDef,
  userStoryGeneratorDef,
  apiRequirementsAnalyzerDef,
  screenSummarizerDef,
];
