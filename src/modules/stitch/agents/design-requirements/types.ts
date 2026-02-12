/**
 * Types for Design-to-Requirements agent output
 */

/** Structured summary of one screen from the screen-summarizer agent (HTML analysis) */
export interface ScreenSummary {
  /** Short label for the screen (e.g. "Job Listings", "Job Detail") */
  screenName?: string;
  /** Screen purpose or description */
  purpose?: string;
  /** Heading text (h1, h2, …) */
  headings?: string[];
  /** Key interactive elements: buttons, links, form labels */
  keyElements?: ({ type?: string; label?: string } | string)[];
  /** Form fields and submit action if present */
  forms?: { fields?: string[]; submitAction?: string };
  /** Region/section labels */
  sections?: string[];
  /** Flattened readable text (truncated) */
  rawTextSummary?: string;
}

/** Output of the screen-summarizer agent: screenId + structured screenSummary */
export interface ScreenSummarizerOutput {
  screenId: string;
  screenSummary: ScreenSummary;
}

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
