/**
 * Tests for Stitch module utilities
 */

import { describe, it, expect } from 'vitest';
import {
  parseProjectName,
  parseScreenName,
  buildProjectResourceName,
  buildScreenResourceName,
  formatDeviceType,
} from '../../src/modules/stitch/utils';

describe('parseProjectName', () => {
  it('should extract projectId from valid format', () => {
    expect(parseProjectName('projects/12345')).toBe('12345');
    expect(parseProjectName('projects/my-project-id')).toBe('my-project-id');
  });

  it('should return null for invalid format', () => {
    expect(parseProjectName('screens/123')).toBeNull();
    expect(parseProjectName('projects/')).toBeNull();
    expect(parseProjectName('invalid')).toBeNull();
  });

  it('should trim whitespace', () => {
    expect(parseProjectName('  projects/abc  ')).toBe('abc');
  });
});

describe('parseScreenName', () => {
  it('should extract projectId and screenId from valid format', () => {
    expect(parseScreenName('projects/p1/screens/s1')).toEqual({
      projectId: 'p1',
      screenId: 's1',
    });
    expect(parseScreenName('projects/4044680601076201931/screens/98b50e2ddc9943ef')).toEqual({
      projectId: '4044680601076201931',
      screenId: '98b50e2ddc9943ef',
    });
  });

  it('should return null for invalid format', () => {
    expect(parseScreenName('projects/p1')).toBeNull();
    expect(parseScreenName('projects/p1/screens')).toBeNull();
    expect(parseScreenName('screens/s1')).toBeNull();
  });

  it('should trim whitespace', () => {
    expect(parseScreenName('  projects/a/screens/b  ')).toEqual({
      projectId: 'a',
      screenId: 'b',
    });
  });
});

describe('buildProjectResourceName', () => {
  it('should format project resource name', () => {
    expect(buildProjectResourceName('12345')).toBe('projects/12345');
    expect(buildProjectResourceName('my-id')).toBe('projects/my-id');
  });

  it('should trim projectId', () => {
    expect(buildProjectResourceName('  abc  ')).toBe('projects/abc');
  });
});

describe('buildScreenResourceName', () => {
  it('should format screen resource name', () => {
    expect(buildScreenResourceName('p1', 's1')).toBe('projects/p1/screens/s1');
  });

  it('should trim projectId and screenId', () => {
    expect(buildScreenResourceName('  p  ', '  s  ')).toBe('projects/p/screens/s');
  });
});

describe('formatDeviceType', () => {
  it('should return MOBILE for mobile', () => {
    expect(formatDeviceType('MOBILE')).toBe('MOBILE');
    expect(formatDeviceType('mobile')).toBe('MOBILE');
  });

  it('should return DESKTOP for desktop', () => {
    expect(formatDeviceType('DESKTOP')).toBe('DESKTOP');
    expect(formatDeviceType('desktop')).toBe('DESKTOP');
  });

  it('should return TABLET for tablet', () => {
    expect(formatDeviceType('TABLET')).toBe('TABLET');
    expect(formatDeviceType('tablet')).toBe('TABLET');
  });

  it('should return AGNOSTIC for agnostic', () => {
    expect(formatDeviceType('AGNOSTIC')).toBe('AGNOSTIC');
    expect(formatDeviceType('agnostic')).toBe('AGNOSTIC');
  });

  it('should return DEVICE_TYPE_UNSPECIFIED for unknown type', () => {
    expect(formatDeviceType('unknown')).toBe('DEVICE_TYPE_UNSPECIFIED');
    expect(formatDeviceType('')).toBe('DEVICE_TYPE_UNSPECIFIED');
    expect(formatDeviceType('PHONE')).toBe('DEVICE_TYPE_UNSPECIFIED');
  });

  it('should trim whitespace', () => {
    expect(formatDeviceType('  mobile  ')).toBe('MOBILE');
  });
});
