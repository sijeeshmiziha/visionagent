/**
 * Figma module - Analyze Figma designs to extract requirements
 */

// Legacy analyzer (markdown output)
export { analyzeFigmaDesigns, analyzeFigmaFiles, analyzeFigmaFolder } from './analyzer';
export { loadImagesFromFolder, loadImagesFromPaths } from './loader';
export { validateFigmaFolder, validateImagePaths } from './validator';
export { figmaAnalysisPrompt, figmaSystemPrompt } from './prompts';

// New code-oriented analyzers (structured JSON output)
export { identifyScreens } from './screen-identifier';
export { extractComponents } from './component-extractor';
export { generateAPIEndpoints } from './api-generator';
export { analyzeFigmaForCode } from './code-analyzer';

// Types
export type {
  FigmaAnalysisConfig,
  FigmaAnalysisResult,
  FigmaFolderValidation,
  LoadedImages,
  CodeAnalysisConfig,
  CodeAnalysisResult,
  ScreenIdentification,
  ComponentExtraction,
  Component,
  APIEndpointList,
  APIEndpoint,
} from '../types/figma';
export { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGES } from '../types/figma';
