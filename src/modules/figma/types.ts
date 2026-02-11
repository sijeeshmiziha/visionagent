/**
 * Figma module types - API response shapes and module interfaces
 */

/**
 * Module config for Figma tools (apiKey can come from env)
 */
export interface FigmaConfig {
  apiKey?: string;
  fileKey?: string;
  nodeId?: string;
}

/**
 * Figma REST API: GET /v1/me response
 */
export interface FigmaUserResponse {
  id: string;
  email: string;
  handle: string;
  img_url?: string;
  team_id?: string;
}

/**
 * Figma REST API: node in document tree (simplified)
 */
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  absoluteRenderBounds?: { x: number; y: number; width: number; height: number };
  fills?: {
    type: string;
    color?: { r: number; g: number; b: number; a: number };
    blendMode?: string;
  }[];
  strokes?: unknown[];
  strokeWeight?: number;
  cornerRadius?: number;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  style?: {
    fontFamily?: string;
    fontPostScriptName?: string;
    fontWeight?: number;
    fontSize?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
  };
  characters?: string;
  [key: string]: unknown;
}

/**
 * Figma REST API: GET /v1/files/:file_key response
 */
export interface FigmaFileResponse {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl?: string;
  version: string;
  document: FigmaNode;
  components?: Record<string, FigmaComponentMeta>;
  styles?: Record<string, FigmaStyleMeta>;
  schemaVersion?: number;
}

/**
 * Component metadata from file
 */
export interface FigmaComponentMeta {
  key: string;
  name: string;
  description?: string;
  componentSetId?: string;
  documentationLinks?: { uri: string }[];
}

/**
 * Style metadata from file
 */
export interface FigmaStyleMeta {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description?: string;
}

/**
 * Figma REST API: GET /v1/files/:file_key/nodes response
 */
export interface FigmaFileNodesResponse {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  nodes: Record<
    string,
    { document: FigmaNode; components?: Record<string, unknown>; styles?: Record<string, unknown> }
  >;
}

/**
 * Figma REST API: GET /v1/images/:file_key response
 */
export interface FigmaImageResponse {
  err?: string;
  images?: Record<string, string>;
  status?: number;
}

/**
 * Figma REST API: variables (local or published)
 */
export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  valueType: string;
  valuesByMode: Record<string, unknown>;
  resolvedType?: string;
  description?: string;
  hiddenFromPublishing?: boolean;
  scopes?: string[];
  codeSyntax?: Record<string, string>;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: { modeId: string; name: string }[];
  defaultModeId: string;
  hiddenFromPublishing?: boolean;
  variableIds: string[];
}

export interface FigmaVariablesResponse {
  status?: number;
  error?: boolean;
  meta?: {
    variableCollections: Record<string, FigmaVariableCollection>;
    variables: Record<string, FigmaVariable>;
  };
}

/**
 * Processed design context (layout, styles, typography) for code generation
 */
export interface DesignContext {
  nodeId: string;
  name: string;
  type: string;
  layout?: {
    mode?: string;
    padding?: { top: number; right: number; bottom: number; left: number };
    itemSpacing?: number;
    alignment?: string;
  };
  bounds?: { x: number; y: number; width: number; height: number };
  fills?: { type: string; color?: string; opacity?: number }[];
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    letterSpacing?: number;
  };
  text?: string;
  children?: DesignContext[];
  cornerRadius?: number;
  strokes?: unknown[];
}

/**
 * Code Connect mapping: Figma node to code component
 */
export interface CodeConnectMapping {
  nodeId: string;
  codeConnectSrc: string;
  codeConnectName: string;
  label?: string;
}

/**
 * Suggestion for mapping a Figma node to a code component
 */
export interface CodeConnectSuggestion {
  nodeId: string;
  componentName: string;
  source: string;
  label: string;
}
