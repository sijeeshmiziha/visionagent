/**
 * Stitch MCP client. Configure via STITCH_MCP_URL or STITCH_MCP_COMMAND + STITCH_MCP_ARGS.
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
const RESOLVE_OPTS = {
  envPrefix: 'STITCH_MCP',
  serverLabel: 'Stitch',
  apiKeyHeader: 'X-Goog-Api-Key',
} as const;

const DEFAULT_GEN = {
  deviceType: 'DEVICE_TYPE_UNSPECIFIED' as DeviceType,
  modelId: 'MODEL_ID_UNSPECIFIED' as ModelId,
};

/** Google Stitch via MCP. Extends BaseMcpClient with project/screen/generation methods. */
export class StitchClient extends BaseMcpClient {
  constructor(options?: McpClientConfig) {
    super(CLIENT_INFO, BaseMcpClient.resolveConfig(options, RESOLVE_OPTS));
  }

  async createProject(title?: string): Promise<CreateProjectResponse & StitchProject> {
    const out = await this.callTool<CreateProjectResponse & StitchProject>('create_project', {
      title: title ?? undefined,
    });
    return out ?? ({} as CreateProjectResponse & StitchProject);
  }

  async getProject(name: string): Promise<StitchProject> {
    const out = await this.callTool<StitchProject>('get_project', { name });
    return out ?? ({} as StitchProject);
  }

  async listProjects(filter?: string): Promise<ListProjectsResponse> {
    const out = await this.callTool<ListProjectsResponse>('list_projects', {
      filter: filter ?? undefined,
    });
    return out ?? { projects: [] };
  }

  async listScreens(projectId: string): Promise<ListScreensResponse> {
    const out = await this.callTool<ListScreensResponse>('list_screens', { projectId });
    return out ?? { screens: [] };
  }

  async getScreen(name: string): Promise<StitchScreen> {
    const out = await this.callTool<StitchScreen>('get_screen', { name });
    return out ?? ({} as StitchScreen);
  }

  async generateScreenFromText(
    projectId: string,
    prompt: string,
    opts?: { deviceType?: DeviceType; modelId?: ModelId }
  ): Promise<GenerateScreenResponse> {
    const out = await this.callTool<GenerateScreenResponse>('generate_screen_from_text', {
      projectId,
      prompt,
      deviceType: opts?.deviceType ?? DEFAULT_GEN.deviceType,
      modelId: opts?.modelId ?? DEFAULT_GEN.modelId,
    });
    return out ?? {};
  }

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
      deviceType: opts?.deviceType ?? DEFAULT_GEN.deviceType,
      modelId: opts?.modelId ?? DEFAULT_GEN.modelId,
    });
    return out ?? { screens: [] };
  }

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
      deviceType: opts?.deviceType ?? DEFAULT_GEN.deviceType,
      modelId: opts?.modelId ?? DEFAULT_GEN.modelId,
    });
    return out ?? { screens: [] };
  }
}
