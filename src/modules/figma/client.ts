/**
 * Figma REST API client - wraps api.figma.com
 */

import { ToolError } from '../../lib/utils/errors';
import type {
  FigmaFileResponse,
  FigmaFileNodesResponse,
  FigmaImageResponse,
  FigmaUserResponse,
  FigmaVariablesResponse,
} from './types';

const FIGMA_API_BASE = 'https://api.figma.com';

export interface FigmaClientOptions {
  apiKey?: string;
}

/**
 * Client for Figma REST API. Uses FIGMA_API_KEY from env if apiKey not provided.
 */
export class FigmaClient {
  private readonly apiKey: string;

  constructor(options: FigmaClientOptions = {}) {
    const key = options.apiKey ?? process.env.FIGMA_API_KEY;
    if (!key || typeof key !== 'string') {
      throw new ToolError(
        'Figma API key is required. Set FIGMA_API_KEY or pass apiKey in options.',
        'figma_client'
      );
    }
    this.apiKey = key;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${FIGMA_API_BASE}${path}`;
    const headers: Record<string, string> = {
      'X-FIGMA-TOKEN': this.apiKey,
      'Content-Type': 'application/json',
    };
    if (
      init.headers &&
      !Array.isArray(init.headers) &&
      init.headers instanceof Object &&
      !(init.headers instanceof Headers)
    ) {
      Object.assign(headers, init.headers as Record<string, string>);
    }
    const res = await fetch(url, { ...init, headers });
    const text = await res.text();
    if (!res.ok) {
      let message = `Figma API ${res.status}: ${res.statusText}`;
      try {
        const body = JSON.parse(text) as { message?: string; err?: string };
        if (body.message) message = body.message;
        else if (body.err) message = body.err;
      } catch {
        if (text) message = text.slice(0, 200);
      }
      throw new ToolError(message, 'figma_client');
    }
    if (!text) return {} as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ToolError(`Invalid JSON from Figma API: ${text.slice(0, 100)}`, 'figma_client');
    }
  }

  /**
   * GET /v1/me - Current user (whoami)
   */
  async getMe(): Promise<FigmaUserResponse> {
    return this.request<FigmaUserResponse>('/v1/me');
  }

  /**
   * GET /v1/files/:file_key - Full file with document tree
   */
  async getFile(fileKey: string): Promise<FigmaFileResponse> {
    return this.request<FigmaFileResponse>(`/v1/files/${encodeURIComponent(fileKey)}`);
  }

  /**
   * GET /v1/files/:file_key/nodes?ids=... - Specific nodes
   * nodeIds should be in API form (e.g. "1:2")
   */
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<FigmaFileNodesResponse> {
    const ids = nodeIds.map(id => id.replace(':', '-')).join(',');
    return this.request<FigmaFileNodesResponse>(
      `/v1/files/${encodeURIComponent(fileKey)}/nodes?ids=${encodeURIComponent(ids)}`
    );
  }

  /**
   * GET /v1/images/:file_key - Rendered image URLs for nodes
   */
  async getImage(
    fileKey: string,
    nodeIds: string[],
    opts: { format?: 'png' | 'jpg' | 'svg'; scale?: number } = {}
  ): Promise<FigmaImageResponse> {
    const ids = nodeIds.map(id => id.replace(':', '-')).join(',');
    const params = new URLSearchParams({ ids });
    if (opts.format) params.set('format', opts.format);
    if (opts.scale != null) params.set('scale', String(opts.scale));
    return this.request<FigmaImageResponse>(
      `/v1/images/${encodeURIComponent(fileKey)}?${params.toString()}`
    );
  }

  /**
   * GET /v1/files/:file_key/styles - Local styles
   */
  async getFileStyles(
    fileKey: string
  ): Promise<{ status?: number; error?: boolean; meta?: { styles: unknown[] } }> {
    return this.request(`/v1/files/${encodeURIComponent(fileKey)}/styles`);
  }

  /**
   * GET /v1/files/:file_key/variables/local - Local variables
   */
  async getLocalVariables(fileKey: string): Promise<FigmaVariablesResponse> {
    return this.request<FigmaVariablesResponse>(
      `/v1/files/${encodeURIComponent(fileKey)}/variables/local`
    );
  }

  /**
   * GET /v1/files/:file_key/variables/published - Published variables
   */
  async getPublishedVariables(fileKey: string): Promise<FigmaVariablesResponse> {
    return this.request<FigmaVariablesResponse>(
      `/v1/files/${encodeURIComponent(fileKey)}/variables/published`
    );
  }

  /**
   * GET /v1/files/:file_key/components - Component metadata
   */
  async getFileComponents(
    fileKey: string
  ): Promise<{ status?: number; error?: boolean; meta?: { components: unknown[] } }> {
    return this.request(`/v1/files/${encodeURIComponent(fileKey)}/components`);
  }
}
