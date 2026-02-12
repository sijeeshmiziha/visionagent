/**
 * Types for Design-to-Requirements agent output
 */

/** User persona identified from design analysis */
export interface UserPersona {
  id: string;
  name: string;
  description: string;
  goals: string[];
  screenInteractions: string[];
}

/** Single step in a user flow */
export interface FlowStep {
  order: number;
  screenId: string;
  screenName: string;
  action: string;
  nextScreenId?: string;
}

/** User flow - navigation path through screens */
export interface UserFlow {
  id: string;
  name: string;
  description: string;
  persona: string;
  steps: FlowStep[];
}

/** User story in standard format */
export interface UserStory {
  id: string;
  persona: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  relatedScreens: string[];
  priority: 'high' | 'medium' | 'low';
}

/** API requirement for a screen */
export interface ApiRequirement {
  id: string;
  screenId: string;
  screenName: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  authentication: boolean;
  relatedStories: string[];
}

/** Summary counts for the requirements output */
export interface DesignRequirementsSummary {
  totalScreens: number;
  totalPersonas: number;
  totalFlows: number;
  totalStories: number;
  totalApis: number;
}

/** Final design requirements output */
export interface DesignRequirementsOutput {
  projectId: string;
  projectName: string;
  analyzedAt: string;
  personas: UserPersona[];
  userFlows: UserFlow[];
  userStories: UserStory[];
  apiRequirements: ApiRequirement[];
  summary: DesignRequirementsSummary;
}
