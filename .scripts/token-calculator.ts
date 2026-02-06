#!/usr/bin/env tsx
/**
 * Token Calculator for VisionAgent Project
 *
 * Scans the entire project and estimates the total token count
 * using character-based heuristics (no external tokenizer dependency).
 *
 * Usage:
 *   npx tsx .scripts/token-calculator.ts
 *   npm run tokens
 *
 * Flags:
 *   --verbose    Show every file with its token count
 *   --top=N      Show top N largest files (default: 15)
 *   --json       Output results as JSON
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname, basename } from 'node:path';

// ── Configuration ──────────────────────────────────────────────────────

const PROJECT_ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

/** Directories to skip entirely */
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.husky', '.changeset']);

/** Files to skip */
const SKIP_FILES = new Set(['package-lock.json', '.DS_Store', 'Thumbs.db']);

/** File extensions to include */
const INCLUDE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.graphql',
  '.gql',
  '.css',
  '.html',
  '.env.example',
]);

/** Also include these exact filenames (no extension match needed) */
const INCLUDE_FILENAMES = new Set([
  '.env.example',
  '.prettierrc',
  '.prettierignore',
  '.editorconfig',
  '.gitignore',
]);

// ── Token estimation ───────────────────────────────────────────────────

/**
 * Estimates token count from text content.
 *
 * Uses a hybrid approach:
 * - Code files: ~1 token per 3.5 characters (accounts for syntax, camelCase, etc.)
 * - Prose/markdown: ~1 token per 4 characters
 * - JSON/config: ~1 token per 4.5 characters (lots of punctuation = fewer tokens)
 *
 * These ratios are calibrated against OpenAI's tiktoken for TypeScript code.
 */
function estimateTokens(content: string, ext: string): number {
  const len = content.length;
  if (len === 0) return 0;

  switch (ext) {
    case '.ts':
    case '.tsx':
    case '.js':
    case '.jsx':
      return Math.ceil(len / 3.5);

    case '.md':
      return Math.ceil(len / 4);

    case '.json':
    case '.yml':
    case '.yaml':
      return Math.ceil(len / 4.5);

    case '.graphql':
    case '.gql':
      return Math.ceil(len / 3.8);

    default:
      return Math.ceil(len / 4);
  }
}

// ── File scanning ──────────────────────────────────────────────────────

interface FileInfo {
  path: string;
  relativePath: string;
  bytes: number;
  lines: number;
  tokens: number;
  extension: string;
  directory: string;
}

function shouldIncludeFile(name: string): boolean {
  if (SKIP_FILES.has(name)) return false;
  if (INCLUDE_FILENAMES.has(name)) return true;
  const ext = extname(name);
  return INCLUDE_EXTENSIONS.has(ext);
}

async function scanDirectory(dir: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) {
        // Allow .scripts and .vscode but skip other dot dirs
        if (entry.name !== '.scripts' && entry.name !== '.vscode') {
          continue;
        }
      }
      const subFiles = await scanDirectory(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && shouldIncludeFile(entry.name)) {
      try {
        const content = await readFile(fullPath, 'utf-8');
        const fileStat = await stat(fullPath);
        const ext = extname(entry.name);
        const rel = relative(PROJECT_ROOT, fullPath);

        // Determine the top-level directory bucket
        const topDir = rel.includes('/') ? (rel.split('/')[0] ?? '(root)') : '(root)';

        files.push({
          path: fullPath,
          relativePath: rel,
          bytes: fileStat.size,
          lines: content.split('\n').length,
          tokens: estimateTokens(content, ext),
          extension: ext || basename(entry.name),
          directory: topDir,
        });
      } catch {
        // Skip files that can't be read
      }
    }
  }

  return files;
}

// ── Formatting helpers ─────────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  return str.length >= len ? str : ' '.repeat(len - str.length) + str;
}

function printSeparator(char = '─', len = 80): void {
  console.log(char.repeat(len));
}

// ── CLI flag parsing ───────────────────────────────────────────────────

function parseArgs(): { verbose: boolean; top: number; json: boolean } {
  const args = process.argv.slice(2);
  let verbose = false;
  let top = 15;
  let json = false;

  for (const arg of args) {
    if (arg === '--verbose' || arg === '-v') verbose = true;
    else if (arg === '--json') json = true;
    else if (arg.startsWith('--top=')) {
      const n = parseInt(arg.split('=')[1] ?? '', 10);
      if (!isNaN(n) && n > 0) top = n;
    }
  }

  return { verbose, top, json };
}

// ── Main ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { verbose, top, json } = parseArgs();

  console.log('\n🔍 Scanning project files...\n');

  const files = await scanDirectory(PROJECT_ROOT);

  if (files.length === 0) {
    console.log('No files found to analyze.');
    process.exit(1);
  }

  // Sort by tokens descending
  files.sort((a, b) => b.tokens - a.tokens);

  // ── Aggregates ─────────────────────────────────────────────────────

  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, f) => sum + f.bytes, 0);
  const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0);

  // By directory
  const dirMap = new Map<string, { files: number; bytes: number; lines: number; tokens: number }>();
  for (const f of files) {
    const existing = dirMap.get(f.directory) ?? { files: 0, bytes: 0, lines: 0, tokens: 0 };
    existing.files++;
    existing.bytes += f.bytes;
    existing.lines += f.lines;
    existing.tokens += f.tokens;
    dirMap.set(f.directory, existing);
  }

  // By extension
  const extMap = new Map<string, { files: number; tokens: number }>();
  for (const f of files) {
    const existing = extMap.get(f.extension) ?? { files: 0, tokens: 0 };
    existing.files++;
    existing.tokens += f.tokens;
    extMap.set(f.extension, existing);
  }

  // ── JSON output ────────────────────────────────────────────────────

  if (json) {
    const output = {
      summary: {
        totalFiles,
        totalBytes,
        totalLines,
        totalTokens,
      },
      byDirectory: Object.fromEntries(
        [...dirMap.entries()].sort((a, b) => b[1].tokens - a[1].tokens)
      ),
      byExtension: Object.fromEntries(
        [...extMap.entries()].sort((a, b) => b[1].tokens - a[1].tokens)
      ),
      topFiles: files.slice(0, top).map(f => ({
        path: f.relativePath,
        tokens: f.tokens,
        lines: f.lines,
        bytes: f.bytes,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // ── Pretty output ──────────────────────────────────────────────────

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          VISIONAGENT — PROJECT TOKEN CALCULATOR             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Overall summary
  console.log('┌──────────────────────────────────────────┐');
  console.log('│            OVERALL SUMMARY               │');
  console.log('├──────────────────────────────────────────┤');
  console.log(`│  Total Files      ${padLeft(formatNumber(totalFiles), 20)}  │`);
  console.log(`│  Total Lines      ${padLeft(formatNumber(totalLines), 20)}  │`);
  console.log(`│  Total Size       ${padLeft(formatBytes(totalBytes), 20)}  │`);
  console.log(`│  Estimated Tokens ${padLeft(formatNumber(totalTokens), 20)}  │`);
  console.log('└──────────────────────────────────────────┘\n');

  // Context window comparison
  const contextWindows = [
    ['GPT-4o (128K)', 128_000],
    ['Claude Sonnet 4 (200K)', 200_000],
    ['Claude Opus 4 (200K)', 200_000],
    ['Gemini 2.0 (1M)', 1_000_000],
    ['Gemini 2.0 (2M)', 2_000_000],
  ] as const;

  console.log('  Context Window Fit:');
  printSeparator('─', 52);
  for (const [model, limit] of contextWindows) {
    const pct = ((totalTokens / limit) * 100).toFixed(1);
    const fits = totalTokens <= limit;
    const bar = '█'.repeat(Math.min(20, Math.round((totalTokens / limit) * 20)));
    const empty = '░'.repeat(20 - bar.length);
    const icon = fits ? '✅' : '❌';
    console.log(
      `  ${icon} ${padRight(model as string, 24)} ${bar}${empty} ${padLeft(pct + '%', 6)}`
    );
  }
  console.log();

  // By directory
  console.log('  BREAKDOWN BY DIRECTORY');
  printSeparator('─', 72);
  console.log(
    `  ${padRight('Directory', 24)}  ${padLeft('Files', 6)}  ${padLeft('Lines', 8)}  ${padLeft('Size', 10)}  ${padLeft('Tokens', 10)}`
  );
  printSeparator('─', 72);

  const sortedDirs = [...dirMap.entries()].sort((a, b) => b[1].tokens - a[1].tokens);
  for (const [dir, data] of sortedDirs) {
    console.log(
      `  ${padRight(dir, 24)}  ${padLeft(String(data.files), 6)}  ${padLeft(formatNumber(data.lines), 8)}  ${padLeft(formatBytes(data.bytes), 10)}  ${padLeft(formatNumber(data.tokens), 10)}`
    );
  }
  printSeparator('─', 72);
  console.log(
    `  ${padRight('TOTAL', 24)}  ${padLeft(String(totalFiles), 6)}  ${padLeft(formatNumber(totalLines), 8)}  ${padLeft(formatBytes(totalBytes), 10)}  ${padLeft(formatNumber(totalTokens), 10)}`
  );
  console.log();

  // By extension
  console.log('  BREAKDOWN BY FILE TYPE');
  printSeparator('─', 50);
  console.log(
    `  ${padRight('Extension', 16)}  ${padLeft('Files', 6)}  ${padLeft('Tokens', 10)}  ${padLeft('Share', 8)}`
  );
  printSeparator('─', 50);

  const sortedExts = [...extMap.entries()].sort((a, b) => b[1].tokens - a[1].tokens);
  for (const [ext, data] of sortedExts) {
    const share = ((data.tokens / totalTokens) * 100).toFixed(1) + '%';
    console.log(
      `  ${padRight(ext, 16)}  ${padLeft(String(data.files), 6)}  ${padLeft(formatNumber(data.tokens), 10)}  ${padLeft(share, 8)}`
    );
  }
  console.log();

  // Top files
  console.log(`  TOP ${top} LARGEST FILES`);
  printSeparator('─', 78);
  console.log(
    `  ${padLeft('#', 3)}  ${padRight('File', 45)}  ${padLeft('Lines', 7)}  ${padLeft('Tokens', 10)}`
  );
  printSeparator('─', 78);

  const topFiles = files.slice(0, top);
  topFiles.forEach((f, i) => {
    console.log(
      `  ${padLeft(String(i + 1), 3)}  ${padRight(f.relativePath, 45)}  ${padLeft(formatNumber(f.lines), 7)}  ${padLeft(formatNumber(f.tokens), 10)}`
    );
  });
  console.log();

  // Verbose: all files
  if (verbose) {
    console.log('  ALL FILES');
    printSeparator('─', 78);
    console.log(
      `  ${padLeft('#', 4)}  ${padRight('File', 45)}  ${padLeft('Lines', 7)}  ${padLeft('Tokens', 10)}`
    );
    printSeparator('─', 78);
    files.forEach((f, i) => {
      console.log(
        `  ${padLeft(String(i + 1), 4)}  ${padRight(f.relativePath, 45)}  ${padLeft(formatNumber(f.lines), 7)}  ${padLeft(formatNumber(f.tokens), 10)}`
      );
    });
    console.log();
  }

  // Summary note
  console.log('  ℹ️  Token estimates use character-based heuristics:');
  console.log('     Code (.ts/.js) ≈ 1 token per 3.5 chars');
  console.log('     Prose (.md)    ≈ 1 token per 4 chars');
  console.log('     Config (.json) ≈ 1 token per 4.5 chars');
  console.log();
  console.log(
    '  💡 Use --verbose to see all files, --top=N to change top list, --json for JSON output'
  );
  console.log();
}

main().catch((err: unknown) => {
  console.error('Error:', err);
  process.exit(1);
});
