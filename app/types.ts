export type BackgroundType  = 'gradient' | 'solid' | 'mesh' | 'noise' | 'pattern' | 'image';
export type FrameType       = 'none' | 'mac' | 'mac-light' | 'chrome' | 'phone' | 'border' | 'arc' | 'polaroid' | 'polaroid-color';
export type EffectType      = 'flat' | 'tilt-left' | 'tilt-right' | 'float' | 'perspective';
export type StylePreset     = 'default' | 'glass-light' | 'glass-dark' | 'outline' | 'border' | 'border-dark';
export type ShadowPreset    = 'none' | 'soft' | 'strong' | 'dramatic' | 'colored';
export type AlignType       = 'top-left'|'top-center'|'top-right'|'left'|'center'|'right'|'bottom-left'|'bottom-center'|'bottom-right';
export type CaptionPosType  = 'top' | 'bottom';
export type DrawTool        = 'none' | 'arrow' | 'curve' | 'line' | 'rect' | 'circle' | 'blur' | 'text';
export type ColorFilterType = 'none' | 'grayscale' | 'sepia' | 'invert' | 'warm' | 'cool' | 'vivid' | 'fade' | 'noir';
export type CodeTheme       = 'dark' | 'light' | 'monokai' | 'github' | 'dracula' | 'nord';
export type CodeLang        = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'bash' | 'json' | 'rust' | 'go' | 'java' | 'cpp' | 'plain';
export type TweetTheme      = 'dark' | 'dim' | 'light';

export interface Background {
  id: string; type: BackgroundType; label: string;
  stops?: string[]; color?: string; colors?: string[];
  base?: string; pattern?: string; accent?: string;
  imgUrl?: string;
}

export interface DrawShape {
  id: string; tool: DrawTool;
  points: { x: number; y: number }[];
  color: string; strokeWidth: number;
  text?: string; fontSize?: number;
}

export interface CodeBlock {
  id: string;
  code: string;
  lang: CodeLang;
  theme: CodeTheme;
  x: number; y: number;
  scale: number;
  showLineNumbers: boolean;
  fileName: string;
}

export interface TweetCard {
  id: string;
  theme: TweetTheme;
  avatarUrl?: string;
  authorName: string;
  authorHandle: string;
  verified: boolean;
  content: string;
  date: string;
  likes: number;
  reposts: number;
  replies: number;
  x: number; y: number;
  scale: number;
}

export interface AppState {
  img: HTMLImageElement | null;
  imageName: string;
  bg: string;
  frame: FrameType;
  frameUrl: string;
  frameTitle: string;
  stylePreset: StylePreset;
  padding: number; radius: number; scale: number; opacity: number;
  shadowPreset: ShadowPreset;
  shadowBlur: number; shadowY: number; shadowX: number; shadowOpacity: number; shadowColor: string;
  effect: EffectType;
  rotX: number; rotY: number; rotZ: number; depth: number;
  align: AlignType; offsetX: number; offsetY: number;
  caption: string; captionColor: string; captionSize: number; captionPos: CaptionPosType;
  canvasW: number; canvasH: number;
  shapes: DrawShape[];
  activeTool: DrawTool;
  drawColor: string;
  drawStroke: number;
  colorFilter: ColorFilterType;
  filterIntensity: number;
  codeBlock: CodeBlock | null;
  tweetCard: TweetCard | null;
}

export const DEFAULT_STATE: AppState = {
  img: null, imageName: '',
  bg: 'purple-blue', frame: 'none',
  frameUrl: 'https://example.com', frameTitle: 'My App',
  stylePreset: 'default',
  padding: 60, radius: 14, scale: 78, opacity: 100,
  shadowPreset: 'soft', shadowBlur: 40, shadowY: 16, shadowX: 0, shadowOpacity: 55, shadowColor: '#000000',
  effect: 'flat', rotX: 0, rotY: 0, rotZ: 0, depth: 2400,
  align: 'center', offsetX: 0, offsetY: 0,
  caption: '', captionColor: '#ffffff', captionSize: 24, captionPos: 'bottom',
  canvasW: 1400, canvasH: 900,
  shapes: [], activeTool: 'none', drawColor: '#ff4444', drawStroke: 3,
  colorFilter: 'none', filterIntensity: 100,
  codeBlock: null,
  tweetCard: null,
};
