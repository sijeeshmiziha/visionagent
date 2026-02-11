/**
 * Stitch module types - MCP tool schemas and response shapes
 * See: https://stitch.withgoogle.com/docs/mcp
 */

/**
 * Module config for Stitch tools (MCP only; no apiKey/baseUrl).
 * Use STITCH_MCP_URL or STITCH_MCP_COMMAND + STITCH_MCP_ARGS in env if not passed.
 */
export interface StitchConfig {
  /** Streamable HTTP URL for the Stitch MCP server. */
  url?: string;
  /** When using url: sent as Authorization Bearer (set STITCH_MCP_API_KEY in .env). */
  apiKey?: string;
  /** For stdio: command to run (e.g. "npx"). */
  command?: string;
  /** For stdio: args (e.g. ["-y", "@google/stitch-mcp"]). */
  args?: string[];
}

/** Device type for screen generation. */
export type DeviceType = 'DEVICE_TYPE_UNSPECIFIED' | 'MOBILE' | 'DESKTOP' | 'TABLET' | 'AGNOSTIC';

/** Model for generation. */
export type ModelId = 'MODEL_ID_UNSPECIFIED' | 'GEMINI_3_PRO' | 'GEMINI_3_FLASH';

/** Creative range for variant generation. */
export type CreativeRange = 'CREATIVE_RANGE_UNSPECIFIED' | 'REFINE' | 'EXPLORE' | 'REIMAGINE';

/** Aspect to focus on when generating variants. */
export type VariantAspect =
  | 'VARIANT_ASPECT_UNSPECIFIED'
  | 'LAYOUT'
  | 'COLOR_SCHEME'
  | 'IMAGES'
  | 'TEXT_FONT'
  | 'TEXT_CONTENT';

/** Options for generate_variants. */
export interface VariantOptions {
  variantCount?: number;
  creativeRange?: CreativeRange;
  aspects?: VariantAspect[];
}

/** Stitch project - container for UI designs. */
export interface StitchProject {
  name: string;
  title?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: unknown;
}

/** Stitch screen - a single UI design. */
export interface StitchScreen {
  name: string;
  projectId?: string;
  screenId?: string;
  design?: unknown;
  createTime?: string;
  updateTime?: string;
  [key: string]: unknown;
}

export interface CreateProjectResponse {
  name: string;
  title?: string;
  [key: string]: unknown;
}

export interface ListProjectsResponse {
  projects?: StitchProject[];
  nextPageToken?: string;
  [key: string]: unknown;
}

export interface ListScreensResponse {
  screens?: StitchScreen[];
  nextPageToken?: string;
  [key: string]: unknown;
}

export interface GenerateScreenResponse {
  screen?: StitchScreen;
  outputComponents?: string | string[];
  [key: string]: unknown;
}

export interface EditScreensResponse {
  screens?: StitchScreen[];
  [key: string]: unknown;
}

export interface GenerateVariantsResponse {
  screens?: StitchScreen[];
  [key: string]: unknown;
}
