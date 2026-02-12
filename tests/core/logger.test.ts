/**
 * Tests for createLogger
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../../src/lib/utils/logger';

describe('createLogger', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use default config (prefix empty, level info, no timestamps)', () => {
    const logger = createLogger();
    logger.info('hello');
    expect(infoSpy).toHaveBeenCalledWith('[INFO] hello', '');
    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('should not output debug when level is info', () => {
    const logger = createLogger({ level: 'info' });
    logger.debug('hidden');
    expect(debugSpy).not.toHaveBeenCalled();
    logger.info('visible');
    expect(infoSpy).toHaveBeenCalled();
  });

  it('should output all four log methods when level is debug', () => {
    const logger = createLogger({ level: 'debug' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'), '');
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), '');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), '');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), '');
  });

  it('should include custom prefix in output', () => {
    const logger = createLogger({ prefix: 'Agent', level: 'debug' });
    logger.info('test');
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/\[Agent\].*test/), '');
  });

  it('should include timestamp when timestamps is true', () => {
    const logger = createLogger({ timestamps: true, level: 'info' });
    logger.info('msg');
    const call = infoSpy.mock.calls[0]![0] as string;
    expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(call).toContain('[INFO]');
    expect(call).toContain('msg');
  });

  it('should pass data to debug', () => {
    const logger = createLogger({ level: 'debug' });
    logger.debug('msg', { key: 'value' });
    expect(debugSpy).toHaveBeenCalledWith(expect.any(String), { key: 'value' });
  });

  it('should call error with Error object', () => {
    const logger = createLogger({ level: 'error' });
    const err = new Error('fail');
    logger.error('message', err);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('message'), err);
  });

  it('should call error with Record data', () => {
    const logger = createLogger({ level: 'error' });
    logger.error('message', { code: 500 });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('message'), {
      code: 500,
    });
  });

  it('should respect level hierarchy: error only', () => {
    const logger = createLogger({ level: 'error' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('should respect level hierarchy: warn and above', () => {
    const logger = createLogger({ level: 'warn' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
