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
