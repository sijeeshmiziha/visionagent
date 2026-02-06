/**
 * Validate Figma folders and image paths
 */

import type { FigmaFolderValidation } from '../types/figma';
import { SUPPORTED_IMAGE_EXTENSIONS } from '../types/figma';
import { fileExists, isDirectory, readDirectory, getFileExtension } from '../core/utils';

/**
 * Check if a file is a supported image format
 */
function isSupportedImage(filename: string): boolean {
  const ext = getFileExtension(filename);
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext as (typeof SUPPORTED_IMAGE_EXTENSIONS)[number]);
}

/**
 * Validate a folder for Figma design images
 *
 * @param folderPath - Path to the folder to validate
 * @returns Validation result with image count and any errors
 *
 * @example
 * ```typescript
 * const validation = validateFigmaFolder('/path/to/exports');
 * if (validation.isValid) {
 *   console.log(`Found ${validation.imageCount} images`);
 * } else {
 *   console.error(validation.error);
 * }
 * ```
 */
export function validateFigmaFolder(folderPath: string): FigmaFolderValidation {
  try {
    // Check if path exists
    if (!fileExists(folderPath)) {
      return {
        isValid: false,
        imageCount: 0,
        error: 'Folder does not exist',
      };
    }

    // Check if path is a directory
    if (!isDirectory(folderPath)) {
      return {
        isValid: false,
        imageCount: 0,
        error: 'Path is not a directory',
      };
    }

    // Read directory and count images
    const files = readDirectory(folderPath);
    const imageFiles = files.filter(isSupportedImage);

    if (imageFiles.length === 0) {
      return {
        isValid: false,
        imageCount: 0,
        error: `No supported images found. Supported formats: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`,
      };
    }

    return {
      isValid: true,
      imageCount: imageFiles.length,
    };
  } catch (error) {
    return {
      isValid: false,
      imageCount: 0,
      error: `Failed to validate folder: ${(error as Error).message}`,
    };
  }
}

/**
 * Validate an array of image paths
 *
 * @param filePaths - Array of file paths to validate
 * @returns Validation result with valid image count
 */
export function validateImagePaths(filePaths: string[]): FigmaFolderValidation {
  try {
    if (!filePaths.length) {
      return {
        isValid: false,
        imageCount: 0,
        error: 'No file paths provided',
      };
    }

    let validCount = 0;
    const invalidPaths: string[] = [];

    for (const filePath of filePaths) {
      if (!fileExists(filePath)) {
        invalidPaths.push(`Not found: ${filePath}`);
        continue;
      }

      if (!isSupportedImage(filePath)) {
        invalidPaths.push(`Unsupported format: ${filePath}`);
        continue;
      }

      validCount++;
    }

    if (validCount === 0) {
      return {
        isValid: false,
        imageCount: 0,
        error: `No valid images found. Issues: ${invalidPaths.join('; ')}`,
      };
    }

    return {
      isValid: true,
      imageCount: validCount,
      error: invalidPaths.length > 0 ? `Some files skipped: ${invalidPaths.length}` : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      imageCount: 0,
      error: `Failed to validate paths: ${(error as Error).message}`,
    };
  }
}
