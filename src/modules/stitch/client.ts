/**
 * Stitch MCP client - domain-specific wrapper around BaseMcpClient.
 *
 * Configure via env vars (STITCH_MCP_URL or STITCH_MCP_COMMAND + STITCH_MCP_ARGS)
 * or pass config explicitly.
 *
 * @see https://stitch.withgoogle.com/docs/mcp/setup
 */

import { BaseMcpClient } from '../../lib/mcp';
import type { McpClientConfig } from '../../lib/mcp';
import type {
  StitchProject,
  StitchScreen,
  CreateProjectResponse,
  ListProjectsResponse,
  ListScreensResponse,
  GenerateScreenResponse,
  EditScreensResponse,
  GenerateVariantsResponse,
  VariantOptions,
  DeviceType,
  ModelId,
} from './types';

const CLIENT_INFO = { name: 'visionagent-stitch', version: '1.0.0' } as const;
const ENV_PREFIX = 'STITCH_MCP';
const SERVER_LABEL = 'Stitch';

/**
 * Client for Google Stitch via MCP.
 *
 * Inherits lazy connection, transport management, and `callTool` from
 * {@link BaseMcpClient}. This class only adds Stitch-specific API methods.
 *
 * @example
 * ```ts
 * const client = new StitchClient();
 * const project = await client.createProject('My App');
 * const screens = await client.listScreens(project.name.split('/')[1]);
 * await client.close();
 * ```
 */
export class StitchClient extends BaseMcpClient {
  constructor(options?: McpClientConfig) {
    const config = BaseMcpClient.resolveConfig(options, {
      envPrefix: ENV_PREFIX,
      serverLabel: SERVER_LABEL,
      apiKeyHeader: 'X-Goog-Api-Key',
    });
    super(CLIENT_INFO, config);
  }

  // -----------------------------------------------------------------------
  // Projects
  // -----------------------------------------------------------------------

  /** Create a new Stitch project (optional title). */
  async createProject(title?: string): Promise<CreateProjectResponse & StitchProject> {
    const out = await this.callTool<CreateProjectResponse & StitchProject>('create_project', {
      title: title ?? undefined,
    });
    return out ?? ({} as CreateProjectResponse & StitchProject);
  }

  /** Get a project by its resource name (`projects/{id}`). */
  async getProject(name: string): Promise<StitchProject> {
    const out = await this.callTool<StitchProject>('get_project', { name });
    return out ?? ({} as StitchProject);
  }

  /** List projects. Pass `"view=owned"` or `"view=shared"` as filter. */
  async listProjects(filter?: string): Promise<ListProjectsResponse> {
    const out = await this.callTool<ListProjectsResponse>('list_projects', {
      filter: filter ?? undefined,
    });
    return out ?? { projects: [] };
  }

  // -----------------------------------------------------------------------
  // Screens
  // -----------------------------------------------------------------------

  /** List screens in a project (pass the bare project ID, not the resource name). */
  async listScreens(projectId: string): Promise<ListScreensResponse> {
    const out = await this.callTool<ListScreensResponse>('list_screens', { projectId });
    return out ?? { screens: [] };
  }

  /** Get a screen by its resource name (`projects/{p}/screens/{s}`). */
  async getScreen(name: string): Promise<StitchScreen> {
    const out = await this.callTool<StitchScreen>('get_screen', { name });
    return out ?? ({} as StitchScreen);
  }

  // -----------------------------------------------------------------------
  // Generation
  // -----------------------------------------------------------------------

  /** Generate a new screen from a text prompt. May take several minutes. */
  async generateScreenFromText(
    projectId: string,
    prompt: string,
    opts?: { deviceType?: DeviceType; modelId?: ModelId }
  ): Promise<GenerateScreenResponse> {
    const out = await this.callTool<GenerateScreenResponse>('generate_screen_from_text', {
      projectId,
      prompt,
      deviceType: opts?.deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: opts?.modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return out ?? {};
  }

  /** Edit existing screens with a text prompt. */
  async editScreens(
    projectId: string,
    selectedScreenIds: string[],
    prompt: string,
    opts?: { deviceType?: DeviceType; modelId?: ModelId }
  ): Promise<EditScreensResponse> {
    const out = await this.callTool<EditScreensResponse>('edit_screens', {
      projectId,
      selectedScreenIds,
      prompt,
      deviceType: opts?.deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: opts?.modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return out ?? { screens: [] };
  }

  /** Generate design variants for existing screens. */
  async generateVariants(
    projectId: string,
    selectedScreenIds: string[],
    prompt: string,
    variantOptions: VariantOptions,
    opts?: { deviceType?: DeviceType; modelId?: ModelId }
  ): Promise<GenerateVariantsResponse> {
    const out = await this.callTool<GenerateVariantsResponse>('generate_variants', {
      projectId,
      selectedScreenIds,
      prompt,
      variantOptions: {
        variantCount: variantOptions.variantCount ?? 3,
        creativeRange: variantOptions.creativeRange ?? 'EXPLORE',
        aspects: variantOptions.aspects ?? [],
      },
      deviceType: opts?.deviceType ?? 'DEVICE_TYPE_UNSPECIFIED',
      modelId: opts?.modelId ?? 'MODEL_ID_UNSPECIFIED',
    });
    return out ?? { screens: [] };
  }
}
