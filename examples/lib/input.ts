/**
 * Read input from environment or CLI params (--KEY=value or --key=value).
 * Params take precedence over env. Use when running examples directly or via run.ts (which sets env).
 */

const argvMap = ((): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--') && arg.includes('=')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      if (!key) continue;
      const value = parts.slice(1).join('=').trim();
      const normalized = key.replace(/-/g, '_').toUpperCase();
      out[normalized] = value;
    }
  }
  return out;
})();

/**
 * Get a string value from env or CLI param. CLI param key is normalized to UPPER_SNAKE_CASE.
 */
export function getInput(name: string): string | undefined {
  const envVal = process.env[name];
  if (envVal !== undefined && envVal !== '') return envVal;
  const paramKey = name.replace(/-/g, '_').toUpperCase();
  return argvMap[paramKey];
}

/**
 * Require a string input; exit with message if missing.
 */
export function requireInput(
  name: string,
  example = `Set ${name} in env or pass --${name.replace(/_/g, '-').toLowerCase()}=value`
): string {
  const v = getInput(name);
  if (v === undefined || v === '') {
    console.error(example);
    process.exit(1);
  }
  return v;
}
