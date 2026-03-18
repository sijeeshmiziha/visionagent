import type { Config } from 'tailwindcss';

// ─── Figma API node types ────────────────────────────────────────────────────

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface FigmaGradientStop {
  color: FigmaColor;
  position: number;
}

export interface FigmaFill {
  type:
    | 'SOLID'
    | 'GRADIENT_LINEAR'
    | 'GRADIENT_RADIAL'
    | 'GRADIENT_ANGULAR'
    | 'GRADIENT_DIAMOND'
    | 'IMAGE'
    | 'EMOJI'
    | 'VIDEO';
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  gradientHandlePositions?: Array<{ x: number; y: number }>;
  gradientStops?: FigmaGradientStop[];
  imageRef?: string;
  scaleMode?: 'FILL' | 'FIT' | 'CROP' | 'TILE' | 'STRETCH';
}

/** Strokes share the same shape as fills */
export type FigmaStroke = FigmaFill;

export interface FigmaEffect {
  type: 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  spread?: number;
  color?: FigmaColor;
  offset?: { x: number; y: number };
}

export interface FigmaBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaGeometrySegment {
  path: string;
  windingRule?: string;
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  italic?: boolean;
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  textAlignHorizontal?: string;
  textDecoration?: string;
  textCase?: string;
}

export type FigmaNodeType =
  | 'FRAME'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE'
  | 'GROUP'
  | 'TEXT'
  | 'VECTOR'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'STAR'
  | 'POLYGON'
  | 'LINE'
  | 'BOOLEAN_OPERATION'
  | 'SECTION'
  | 'SLICE'
  | string;

export interface FigmaNode {
  id: string;
  name: string;
  type: FigmaNodeType;
  visible?: boolean;
  children?: FigmaNode[];
  absoluteBoundingBox?: FigmaBoundingBox;
  absoluteRenderBounds?: FigmaBoundingBox;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  strokeCap?: string | string[];
  strokeJoin?: string;
  strokeDashes?: number[];
  strokeDashOffset?: number;
  strokeMiterAngle?: number;
  dashPattern?: number[];
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutAlign?: 'MIN' | 'MAX' | 'CENTER' | 'STRETCH' | 'INHERIT';
  layoutGrow?: number;
  layoutPositioning?: 'AUTO' | 'ABSOLUTE';
  opacity?: number;
  rotation?: number;
  blendMode?: string;
  effects?: FigmaEffect[];
  style?: FigmaTextStyle;
  characters?: string;
  fillGeometry?: FigmaGeometrySegment[];
  strokeGeometry?: FigmaGeometrySegment[];
  backgroundColor?: FigmaColor;
  clipsContent?: boolean;
}

/** CSS property map used throughout the converter */
export type CSSStyles = Record<string, string | number>;

// ─── Converter option types ──────────────────────────────────────────────────

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
