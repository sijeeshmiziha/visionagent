/**
 * Load images from folders or file paths
 */

import type { ImageInput } from '../types/common';
import type { LoadedImages } from '../types/figma';
import { SUPPORTED_IMAGE_EXTENSIONS, MAX_IMAGES } from '../types/figma';
import { FigmaError } from '../core/errors';
import {
  fileExists,
  isDirectory,
  readFileAsBase64,
  getFileExtension,
  readDirectory,
  joinPaths,
} from '../core/utils';
import { createLogger } from '../core/logger';

const logger = createLogger({ prefix: 'figma-loader' });

/**
 * Check if a file is a supported image format
 */
export function isSupportedImage(filename: string): boolean {
  const ext = getFileExtension(filename);
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext as (typeof SUPPORTED_IMAGE_EXTENSIONS)[number]);
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): ImageInput['mimeType'] {
  const ext = getFileExtension(filename);
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/png';
  }
}

/**
 * Load images from a folder
 *
 * @param folderPath - Path to the folder containing images
 * @param maxImages - Maximum number of images to load
 * @returns Loaded images with their paths
 */
export function loadImagesFromFolder(
  folderPath: string,
  maxImages: number = MAX_IMAGES
): LoadedImages {
  // Validate folder exists
  if (!fileExists(folderPath)) {
    throw new FigmaError(`Folder not found: ${folderPath}`);
  }

  if (!isDirectory(folderPath)) {
    throw new FigmaError(`Path is not a directory: ${folderPath}`);
  }

  // Read and filter image files
  const files = readDirectory(folderPath);
  const imageFiles = files.filter(isSupportedImage);

  if (imageFiles.length === 0) {
    throw new FigmaError(
      `No supported images found in folder. Supported formats: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`
    );
  }

  // Warn if too many images
  if (imageFiles.length > maxImages) {
    logger.warn(`Found ${imageFiles.length} images, processing only first ${maxImages}`);
  }

  const filesToProcess = imageFiles.slice(0, maxImages);

  // Load images
  const images: ImageInput[] = [];
  const paths: string[] = [];

  for (const filename of filesToProcess) {
    const filePath = joinPaths(folderPath, filename);

    try {
      const base64 = readFileAsBase64(filePath);
      const mimeType = getMimeType(filename);

      images.push({ base64, mimeType, path: filePath });
      paths.push(filePath);

      logger.debug(`Loaded image: ${filename}`);
    } catch (error) {
      logger.warn(`Failed to load image: ${filename}`, { error });
    }
  }

  if (images.length === 0) {
    throw new FigmaError('Failed to load any images from folder');
  }

  return { images, paths };
}

/**
 * Load images from an array of file paths
 *
 * @param filePaths - Array of file paths to images
 * @param maxImages - Maximum number of images to load
 * @returns Loaded images with their valid paths
 */
export function loadImagesFromPaths(
  filePaths: string[],
  maxImages: number = MAX_IMAGES
): LoadedImages {
  const images: ImageInput[] = [];
  const paths: string[] = [];

  for (const filePath of filePaths) {
    // Stop if we've reached the max
    if (images.length >= maxImages) {
      logger.warn(`Maximum image count (${maxImages}) reached, skipping remaining files`);
      break;
    }

    // Skip if file doesn't exist
    if (!fileExists(filePath)) {
      logger.warn(`File not found, skipping: ${filePath}`);
      continue;
    }

    // Skip if not a supported image format
    if (!isSupportedImage(filePath)) {
      logger.warn(`Unsupported format, skipping: ${filePath}`);
      continue;
    }

    try {
      const base64 = readFileAsBase64(filePath);
      const mimeType = getMimeType(filePath);

      images.push({ base64, mimeType, path: filePath });
      paths.push(filePath);

      logger.debug(`Loaded image: ${filePath}`);
    } catch (error) {
      logger.warn(`Failed to load image: ${filePath}`, { error });
    }
  }

  if (images.length === 0) {
    throw new FigmaError(
      `No valid images found. Supported formats: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`
    );
  }

  return { images, paths };
}
