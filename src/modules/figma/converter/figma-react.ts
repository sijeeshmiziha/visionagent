import { FigmaClient } from '../client';
import { parseFigmaUrl, formatNodeIdForApi } from '../utils';
import { FigmaToHTML } from './figma-to-html';
import { transformJsx } from './transform-jsx';
import type { FigmaToReactOptions, FigmaToReactResult } from './types';

export class FigmaToReact {
  private client: FigmaClient;
  private options: FigmaToReactOptions;

  constructor(options: FigmaToReactOptions = {}, apiKey?: string) {
    this.client = new FigmaClient({ apiKey });
    this.options = options;
  }

  async convertFromUrl(
    figmaUrl: string
  ): Promise<{ success: true; data: FigmaToReactResult } | { success: false; error: string }> {
    try {
      const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

      let documentNode: any;

      if (nodeId) {
        const apiNodeId = formatNodeIdForApi(nodeId);
        const res = await this.client.getFileNodes(fileKey, [apiNodeId], {
          geometry: 'paths',
        });
        const entry = res.nodes?.[apiNodeId.replace(':', '-')];
        documentNode = entry?.document;
      } else {
        const file = await this.client.getFile(fileKey, { geometry: 'paths' });
        documentNode = file.document;
      }

      if (!documentNode) {
        throw new Error('No document found in Figma data');
      }

      const preConverter = new FigmaToHTML(this.options);
      preConverter.convertNode(documentNode);

      let imageUrlToFilename: Map<string, string> = new Map();
      let assets: Record<string, string> = {};
      let imageRefToFilename: Map<string, string> = new Map();

      if (preConverter.imageNodes.size > 0) {
        const nodeIds = Array.from(preConverter.imageNodes.keys());
        const imageResponse = await this.client.getImage(fileKey, nodeIds, {
          format: 'png',
        });

        if (imageResponse.images) {
          const imageMap: Record<string, string> = {};
          for (const [imgNodeId, imgUrl] of Object.entries(imageResponse.images)) {
            const imageRef = preConverter.imageNodes.get(imgNodeId);
            if (imageRef && imgUrl) {
              imageMap[imageRef] = imgUrl;
            }
          }

          const downloadResult = await this.downloadAndConvertImages(imageMap);
          imageUrlToFilename = downloadResult.urlToFilename;
          imageRefToFilename = downloadResult.imageRefToFilename;
          assets = downloadResult.assets;
        }
      }

      const imageUrls: Record<string, string> = {};
      for (const [imageRef, filename] of imageRefToFilename.entries()) {
        imageUrls[imageRef] = `/${filename}`;
      }

      const converterOptions = { ...this.options, imageUrls };
      const converter = new FigmaToHTML(converterOptions);
      const jsxResult = await converter.convertJSX(documentNode);

      let jsx = jsxResult.jsx as string;
      jsx = this.replaceImageUrls(jsx, imageUrlToFilename);

      if (this.options.optimizeComponents) {
        try {
          const optimized = transformJsx(jsx);
          jsx = optimized.code;
        } catch {
          // fall through with unoptimized JSX
        }
      }

      return {
        success: true,
        data: {
          jsx,
          assets,
          componentName: jsxResult.componentName,
          fonts: jsxResult.fonts,
          css: jsxResult.css,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: `Error converting Figma to React: ${message}` };
    }
  }

  async convertFromFileKey(
    fileKey: string,
    nodeId?: string
  ): Promise<{ success: true; data: FigmaToReactResult } | { success: false; error: string }> {
    const url = nodeId
      ? `https://www.figma.com/design/${fileKey}/?node-id=${nodeId.replace(':', '-')}`
      : `https://www.figma.com/design/${fileKey}/`;
    return this.convertFromUrl(url);
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private imageToBase64(buffer: Buffer, mimeType = 'image/png'): string {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  private getMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.split('?')[0]?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return mimeTypes[extension || 'png'] || 'image/png';
  }

  private async downloadAndConvertImages(imageMap: Record<string, string>): Promise<{
    urlToFilename: Map<string, string>;
    imageRefToFilename: Map<string, string>;
    assets: Record<string, string>;
  }> {
    const urlToFilename = new Map<string, string>();
    const imageRefToFilename = new Map<string, string>();
    const assetsOut: Record<string, string> = {};
    const entries = Object.entries(imageMap);

    const downloadPromises = entries.map(async ([imageRef, url], index) => {
      try {
        let extension = url.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
        const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
        if (!validExtensions.includes(extension)) {
          extension = 'png';
        }
        const filename = `image-${String(index + 1).padStart(3, '0')}.${extension}`;

        const buffer = await this.downloadImage(url);
        const mimeType = this.getMimeTypeFromUrl(url);
        const base64 = this.imageToBase64(buffer, mimeType);

        urlToFilename.set(url, filename);
        imageRefToFilename.set(imageRef, filename);
        assetsOut[filename] = base64;
      } catch {
        // skip failed downloads
      }
    });

    await Promise.all(downloadPromises);
    return { urlToFilename, imageRefToFilename, assets: assetsOut };
  }

  private replaceImageUrls(jsx: string, imageUrlToFilename: Map<string, string>): string {
    let result = jsx;
    for (const [url, filename] of imageUrlToFilename.entries()) {
      const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedUrl, 'g'), `/${filename}`);
      result = result.replace(
        new RegExp(`url\\(["']?${escapedUrl}["']?\\)`, 'g'),
        `url("/${filename}")`
      );
      result = result.replace(new RegExp(`src=["']${escapedUrl}["']`, 'g'), `src="/${filename}"`);
      result = result.replace(new RegExp(`href=["']${escapedUrl}["']`, 'g'), `href="/${filename}"`);
    }
    return result;
  }
}

export async function convertFigmaToReact(
  figmaUrl: string,
  options: FigmaToReactOptions = {},
  apiKey?: string
): Promise<{ success: true; data: FigmaToReactResult } | { success: false; error: string }> {
  const converter = new FigmaToReact(options, apiKey);
  return converter.convertFromUrl(figmaUrl);
}
