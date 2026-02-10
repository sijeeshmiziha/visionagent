/**
 * Figma analysis types
 */

import type { Model } from './model';
import type { ImageInput } from './common';

/**
 * Supported image extensions for Figma exports
 */
export const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const;

/**
 * Maximum number of images to process
 */
export const MAX_IMAGES = 20;

/**
 * Configuration for Figma analysis
 */
export interface FigmaAnalysisConfig {
  /** The model to use for vision analysis */
  model: Model;
  /** Source: folder path or array of file paths */
  source: string | string[];
  /** Maximum number of images to process */
  maxImages?: number;
  /** Detail level for image analysis */
  detail?: 'low' | 'high' | 'auto';
  /** Custom analysis prompt (optional) */
  customPrompt?: string;
}

/**
 * Result of Figma design analysis
 */
export interface FigmaAnalysisResult {
  /** Detailed analysis in markdown format */
  analysis: string;
  /** Number of images analyzed */
  imageCount: number;
  /** Paths to the analyzed images */
  imagePaths: string[];
}

/**
 * Validation result for a Figma folder
 */
export interface FigmaFolderValidation {
  isValid: boolean;
  imageCount: number;
  error?: string;
}

/**
 * Loaded images ready for analysis
 */
export interface LoadedImages {
  images: ImageInput[];
  paths: string[];
}

/**
 * Configuration for code-oriented Figma analysis
 */
export interface CodeAnalysisConfig {
  /** API key for the AI provider */
  apiKey: string;
  /** AI provider to use */
  provider: 'openai' | 'anthropic' | 'google';
  /** Model name (optional - uses smart defaults per provider) */
  model?: string;
  /** Source: folder path or array of file paths */
  images: string | string[];
  /** Maximum number of images to process */
  maxImages?: number;
  /** Detail level for image analysis */
  detail?: 'low' | 'high' | 'auto';
}

/**
 * Identified screen information
 */
export interface ScreenIdentification {
  /** Name of the screen (e.g., "Login Screen", "Dashboard") */
  screenName: string;
  /** Type of screen (e.g., "Authentication", "Data Display") */
  screenType: string;
  /** Detailed description of the screen */
  description: string;
  /** Purpose of the screen */
  purpose: string;
  /** Target user type (e.g., "Admin", "Customer", "Guest") */
  userType: string;
  /** Path to the original image */
  imagePath: string;
}

/**
 * UI Component information
 */
export interface Component {
  /** Component name (e.g., "LoginButton", "EmailInput") */
  name: string;
  /** Component type (e.g., "Button", "TextInput", "Card") */
  type: string;
  /** Component props (e.g., ["label", "onClick", "disabled"]) */
  props: string[];
  /** Description of the component */
  description: string;
}

/**
 * Component extraction result for a screen
 */
export interface ComponentExtraction {
  /** Name of the screen */
  screenName: string;
  /** List of identified components */
  components: Component[];
  /** Path to the original image */
  imagePath: string;
}

/**
 * API Endpoint specification
 */
export interface APIEndpoint {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Endpoint path (e.g., "/api/auth/login") */
  path: string;
  /** Description of the endpoint */
  description: string;
  /** Example request body */
  requestBody?: Record<string, unknown>;
  /** Example response body */
  responseBody?: Record<string, unknown>;
  /** Whether authentication is required */
  authentication: boolean;
  /** Related screen name */
  relatedScreen: string;
}

/**
 * List of API endpoints
 */
export interface APIEndpointList {
  /** Array of API endpoints */
  endpoints: APIEndpoint[];
}

/**
 * Complete code analysis result
 */
export interface CodeAnalysisResult {
  /** Identified screens */
  screens: ScreenIdentification[];
  /** Extracted components per screen */
  components: ComponentExtraction[];
  /** Generated API endpoints */
  apiEndpoints: APIEndpointList;
  /** Requirements in markdown format (from existing analyzer) */
  requirements: string;
}

// --- New types for expanded Figma module ---

/**
 * Nested layout node for layout analysis
 */
export interface LayoutNode {
  type: string;
  direction?: 'row' | 'column';
  children?: LayoutNode[];
  flex?: number;
  spacing?: number;
}

/**
 * Layout analysis for a screen
 */
export interface LayoutAnalysis {
  screenName: string;
  imagePath: string;
  layoutType: 'grid' | 'flex' | 'stack' | 'sidebar-main' | 'split' | 'list' | 'other';
  columns?: number;
  spacing?: number;
  responsiveHints?: string[];
  structure?: LayoutNode;
}

/**
 * Design token for colors
 */
export interface ColorToken {
  name: string;
  value: string;
  usage?: string;
}

/**
 * Typography token
 */
export interface TypographyToken {
  name: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  usage?: string;
}

/**
 * Spacing token
 */
export interface SpacingToken {
  name: string;
  value: string;
  usage?: string;
}

/**
 * Extracted style guide from designs
 */
export interface StyleGuide {
  colors: {
    primary?: ColorToken[];
    secondary?: ColorToken[];
    background?: ColorToken[];
    text?: ColorToken[];
    accent?: ColorToken[];
    semantic?: ColorToken[];
  };
  typography?: TypographyToken[];
  spacing?: SpacingToken[];
  borderRadius?: { name: string; value: string }[];
  shadows?: { name: string; value: string }[];
}

/**
 * Navigation item (tab, menu item, link)
 */
export interface NavigationItem {
  id: string;
  label: string;
  targetScreen?: string;
  icon?: string;
  children?: NavigationItem[];
}

/**
 * Navigation structure analysis
 */
export interface NavigationStructure {
  navigationType: 'tab-bar' | 'sidebar' | 'drawer' | 'breadcrumb' | 'top-nav' | 'mixed' | 'other';
  items: NavigationItem[];
  routes: { fromScreen: string; toScreen: string; trigger?: string }[];
  parentChildRelations?: { parent: string; children: string[] }[];
}

/**
 * Form field definition
 */
export interface FormField {
  name: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'file'
    | 'other';
  label?: string;
  required?: boolean;
  validationHints?: string[];
  placeholder?: string;
}

/**
 * Form analysis for a screen
 */
export interface FormAnalysis {
  screenName: string;
  imagePath: string;
  formName?: string;
  fields: FormField[];
  submitAction?: string;
  isMultiStep?: boolean;
  steps?: string[];
}

/**
 * Responsive design analysis
 */
export interface ResponsiveAnalysis {
  primaryPlatform: 'mobile' | 'tablet' | 'desktop';
  breakpoints?: { name: string; minWidth?: number; maxWidth?: number }[];
  approach: 'responsive' | 'adaptive' | 'mobile-first' | 'desktop-first';
  suggestions?: string[];
}

/**
 * State variable definition
 */
export interface StateVariable {
  name: string;
  type: string;
  scope: 'local' | 'global' | 'server';
  description?: string;
}

/**
 * State management plan per screen
 */
export interface StateManagementPlan {
  screenName: string;
  imagePath: string;
  state: StateVariable[];
}

/**
 * Database entity field
 */
export interface EntityField {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  default?: string;
}

/**
 * Entity relationship
 */
export interface EntityRelationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  foreignKey?: string;
}

/**
 * Database entity
 */
export interface DatabaseEntity {
  name: string;
  fields: EntityField[];
  primaryKey?: string;
  indexes?: string[];
}

/**
 * Database schema
 */
export interface DatabaseSchema {
  entities: DatabaseEntity[];
  relationships: EntityRelationship[];
}

/**
 * Auth flow analysis
 */
export interface AuthFlowAnalysis {
  methods: ('email-password' | 'oauth' | 'mfa' | 'magic-link' | 'sso')[];
  flows: { name: string; steps: string[] }[];
  protectedRoutes?: string[];
  roles?: string[];
  permissionModel?: string;
}

/**
 * Data flow for a screen
 */
export interface ScreenDataFlow {
  screenName: string;
  reads: string[];
  writes: string[];
  passesViaNavigation?: string[];
  dataSources?: string[];
}

/**
 * Data flow analysis
 */
export interface DataFlowAnalysis {
  screens: ScreenDataFlow[];
  crudMapping?: {
    entity: string;
    create?: string;
    read?: string;
    update?: string;
    delete?: string;
  }[];
}

/**
 * User flow step
 */
export interface UserFlowStep {
  order: number;
  screenOrAction: string;
  description?: string;
  isDecision?: boolean;
  branches?: { condition: string; nextStep: number }[];
}

/**
 * User flow
 */
export interface UserFlow {
  name: string;
  description?: string;
  steps: UserFlowStep[];
  startScreen?: string;
  endScreen?: string;
}

/**
 * User story
 */
export interface UserStory {
  id: string;
  epic?: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  priority?: 'high' | 'medium' | 'low';
}

/**
 * User story collection
 */
export interface UserStoryCollection {
  stories: UserStory[];
  epics?: string[];
}

/**
 * Product requirements document
 */
export interface ProductRequirementsDocument {
  overview: string;
  goals: string[];
  userPersonas?: { name: string; description: string }[];
  features: { name: string; description: string; priority: 'high' | 'medium' | 'low' }[];
  nonFunctionalRequirements?: string[];
}

/**
 * Project structure node (file or directory)
 */
export interface ProjectStructureNode {
  name: string;
  type: 'file' | 'directory';
  description?: string;
  children?: ProjectStructureNode[];
}

/**
 * Project structure
 */
export interface ProjectStructure {
  root: ProjectStructureNode;
  framework?: string;
  conventions?: string[];
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  component?: string;
  name?: string;
  authRequired?: boolean;
  params?: string[];
  children?: RouteConfig[];
}

/**
 * Tech stack category recommendation
 */
export interface TechStackCategory {
  category: string;
  recommendation: string;
  rationale?: string;
  alternatives?: string[];
}

/**
 * Tech stack recommendation
 */
export interface TechStackRecommendation {
  frontend?: TechStackCategory;
  backend?: TechStackCategory;
  database?: TechStackCategory;
  auth?: TechStackCategory;
  deployment?: TechStackCategory;
  other?: TechStackCategory[];
}

/**
 * Complete design analysis (all analyzers combined)
 */
export interface CompleteDesignAnalysis {
  screens: ScreenIdentification[];
  components: ComponentExtraction[];
  apiEndpoints: APIEndpointList;
  requirements: string;
  layouts?: LayoutAnalysis[];
  styleGuide?: StyleGuide;
  navigation?: NavigationStructure;
  forms?: FormAnalysis[];
  responsive?: ResponsiveAnalysis;
  stateManagement?: StateManagementPlan[];
  databaseSchema?: DatabaseSchema;
  authFlow?: AuthFlowAnalysis;
  dataFlow?: DataFlowAnalysis;
  userFlows?: UserFlow[];
  userStories?: UserStoryCollection;
  prd?: ProductRequirementsDocument;
  projectStructure?: ProjectStructure;
  routes?: RouteConfig[];
  techStack?: TechStackRecommendation;
}
