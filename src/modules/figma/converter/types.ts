import type { Config } from 'tailwindcss';

export interface FigmaToHTMLOptions {
  useAbsolutePositioning?: boolean;
  generateClasses?: boolean;
  classPrefix?: string;
  includeFonts?: boolean;
  imageUrls?: Record<string, string>;
  responsive?: boolean;
  useTailwind?: boolean;
  tailwindConfig?: Config;
  keepFallbackStyles?: boolean;
  returnTSX?: boolean;
  [key: string]: any;
}

export interface FigmaToReactOptions extends FigmaToHTMLOptions {
  optimizeComponents?: boolean;
  useCodeCleaner?: boolean;
}

export interface FigmaToReactResult {
  jsx: string;
  assets: Record<string, string>;
  componentName: string;
  fonts: string;
  css: string;
}
