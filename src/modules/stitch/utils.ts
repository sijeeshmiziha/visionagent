/**
 * Stitch module utilities - resource name parsing and formatting
 */

const PROJECT_NAME_REGEX = /^projects\/(.+)$/;
const SCREEN_NAME_REGEX = /^projects\/([^/]+)\/screens\/([^/]+)$/;

/**
 * Extract projectId from a Stitch resource name (projects/{projectId}).
 */
export function parseProjectName(name: string): string | null {
  const trimmed = name.trim();
  const match = PROJECT_NAME_REGEX.exec(trimmed);
  return match ? (match[1] ?? null) : null;
}

/**
 * Extract projectId and screenId from a screen resource name (projects/{projectId}/screens/{screenId}).
 */
export function parseScreenName(name: string): { projectId: string; screenId: string } | null {
  const trimmed = name.trim();
  const match = SCREEN_NAME_REGEX.exec(trimmed);
  if (!match?.[1] || !match?.[2]) return null;
  return { projectId: match[1], screenId: match[2] };
}

/**
 * Build a project resource name from projectId.
 */
export function buildProjectResourceName(projectId: string): string {
  return `projects/${projectId.trim()}`;
}

/**
 * Build a screen resource name from projectId and screenId.
 */
export function buildScreenResourceName(projectId: string, screenId: string): string {
  return `projects/${projectId.trim()}/screens/${screenId.trim()}`;
}

/**
 * Normalize device type string to Stitch API format.
 */
export function formatDeviceType(
  type: string
): 'MOBILE' | 'DESKTOP' | 'TABLET' | 'AGNOSTIC' | 'DEVICE_TYPE_UNSPECIFIED' {
  const upper = type.trim().toUpperCase();
  if (upper === 'MOBILE') return 'MOBILE';
  if (upper === 'DESKTOP') return 'DESKTOP';
  if (upper === 'TABLET') return 'TABLET';
  if (upper === 'AGNOSTIC') return 'AGNOSTIC';
  return 'DEVICE_TYPE_UNSPECIFIED';
}
