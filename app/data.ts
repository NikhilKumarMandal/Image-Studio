import { Background, FrameType, EffectType, StylePreset, ShadowPreset } from './types';

export const BACKGROUNDS: Background[] = [
  // Gradients
  { id: 'purple-blue',   type: 'gradient', label: 'Aurora',    stops: ['#667eea', '#764ba2'] },
  { id: 'pink-red',      type: 'gradient', label: 'Bloom',     stops: ['#f093fb', '#f5576c'] },
  { id: 'cyan-blue',     type: 'gradient', label: 'Ocean',     stops: ['#4facfe', '#00f2fe'] },
  { id: 'green-teal',    type: 'gradient', label: 'Mint',      stops: ['#43e97b', '#38f9d7'] },
  { id: 'orange-pink',   type: 'gradient', label: 'Sunset',    stops: ['#fa709a', '#fee140'] },
  { id: 'indigo-violet', type: 'gradient', label: 'Galaxy',    stops: ['#4776e6', '#8e54e9'] },
  { id: 'warm-peach',    type: 'gradient', label: 'Peach',     stops: ['#ffecd2', '#fcb69f'] },
  { id: 'rose-gold',     type: 'gradient', label: 'Rose',      stops: ['#ff9a9e', '#fecfef'] },
  { id: 'fire',          type: 'gradient', label: 'Fire',      stops: ['#f7971e', '#ffd200'] },
  { id: 'arctic',        type: 'gradient', label: 'Arctic',    stops: ['#a8edea', '#fed6e3'] },
  // Mesh
  { id: 'dark-mesh',     type: 'mesh',     label: 'Nebula',    colors: ['#7c6af7', '#f56060', '#43e97b'] },
  { id: 'blue-mesh',     type: 'mesh',     label: 'Prism',     colors: ['#4facfe', '#764ba2', '#f093fb'] },
  { id: 'red-mesh',      type: 'mesh',     label: 'Ember',     colors: ['#f56060', '#ff9a00', '#1a0010'] },
  { id: 'green-mesh',    type: 'mesh',     label: 'Forest',    colors: ['#11998e', '#38ef7d', '#0d1b2a'] },
  // Solid
  { id: 'dark-solid',    type: 'solid',    label: 'Obsidian',  color: '#0d0d14' },
  { id: 'slate-solid',   type: 'solid',    label: 'Slate',     color: '#1e1e2e' },
  { id: 'white-solid',   type: 'solid',    label: 'White',     color: '#f8f8fc' },
  { id: 'cream-solid',   type: 'solid',    label: 'Cream',     color: '#faf6f0' },
  // Noise
  { id: 'noise-dark',    type: 'noise',    label: 'Grain',     base: '#1a1a2a' },
  { id: 'noise-warm',    type: 'noise',    label: 'Linen',     base: '#2a2018' },
  // Image backgrounds
  {
    id: "1", type: "image", label: "1", imgUrl:"/1.png"
  },
  {
    id: "2",type: "image",label: "2",imgUrl: "/2.png"
  },
  {
    id:"3",type: "image",label: "3",imgUrl: "/3.png"
  },
  {
    id:"44",type: "image",label: "4",imgUrl: "/44.webp"
  },
  {
    id:"5",type: "image",label: "5",imgUrl: "/5.webp"
  },
  {
    id: "6", type: "image", label: "6", imgUrl: "/6.webp"
  },
  {
    id: "7", type: "image", label: "7", imgUrl: "/7.webp"
  },
  {
    id: "8", type: "image", label: "8", imgUrl: "/8.webp"
  },
  {
    id: "9", type: "image", label: "5", imgUrl: "/9.webp"
  },

  // Patterns
  { id: 'pattern-dots',   type: 'pattern', label: 'Dots',     pattern: 'dots',   base: '#0f1117', accent: 'rgba(255,255,255,0.15)' },
  { id: 'pattern-grid',   type: 'pattern', label: 'Grid',     pattern: 'grid',   base: '#0a0f1a', accent: 'rgba(99,179,237,0.2)'   },
  { id: 'pattern-cross',  type: 'pattern', label: 'Cross',    pattern: 'cross',  base: '#120a1e', accent: 'rgba(167,139,250,0.2)'  },
  { id: 'pattern-diag',   type: 'pattern', label: 'Lines',    pattern: 'diag',   base: '#1a160a', accent: 'rgba(251,191,36,0.15)'  },
  { id: 'pattern-wave',   type: 'pattern', label: 'Wave',     pattern: 'wave',   base: '#0a1520', accent: 'rgba(96,165,250,0.18)'  },
  { id: 'pattern-clouds', type: 'pattern', label: 'Clouds',   pattern: 'clouds', base: '#1a2030', accent: 'rgba(255,255,255,0.08)' },
];

export interface FrameOption { id: FrameType; label: string; }
export const FRAMES: FrameOption[] = [
  { id: 'none',      label: 'None' },
  { id: 'polaroid',       label: 'Polaroid' },
  { id: 'polaroid-color', label: 'Polaroid Color' },
  { id: 'mac',       label: 'macOS Dark' },
  { id: 'mac-light', label: 'macOS Light' },
  { id: 'chrome',    label: 'Chrome' },
  { id: 'arc',       label: 'Arc' },
  { id: 'phone',     label: 'iPhone' },
  { id: 'border',    label: 'Border' },
];

export interface StyleOption { id: StylePreset; label: string; }
export const STYLE_PRESETS: StyleOption[] = [
  { id: 'default',     label: 'Default' },
  { id: 'glass-light', label: 'Glass ☀' },
  { id: 'glass-dark',  label: 'Glass 🌙' },
  { id: 'outline',     label: 'Outline' },
  { id: 'border',      label: 'Border' },
  { id: 'border-dark', label: 'Border Dark' },
];

export interface ShadowOption { id: ShadowPreset; label: string; values: { blur: number; y: number; x: number; op: number } }
export const SHADOW_PRESETS: ShadowOption[] = [
  { id: 'none',     label: 'None',     values: { blur: 0,  y: 0,  x: 0, op: 0  } },
  { id: 'soft',     label: 'Soft',     values: { blur: 40, y: 16, x: 0, op: 40 } },
  { id: 'strong',   label: 'Strong',   values: { blur: 60, y: 24, x: 0, op: 70 } },
  { id: 'dramatic', label: 'Dramatic', values: { blur: 80, y: 40, x: 0, op: 80 } },
  { id: 'colored',  label: 'Colored',  values: { blur: 50, y: 20, x: 0, op: 60 } },
];

export interface EffectOption { id: EffectType; label: string; presets: { rotX: number; rotY: number; rotZ: number; scale: number } }
export const EFFECTS: EffectOption[] = [
  { id: 'flat',        label: 'Flat',        presets: { rotX: 0,  rotY: 0,   rotZ: 0, scale: 78 } },
  { id: 'tilt-left',   label: 'Tilt Left',   presets: { rotX: 6,  rotY: -18, rotZ: 0, scale: 72 } },
  { id: 'tilt-right',  label: 'Tilt Right',  presets: { rotX: 6,  rotY: 18,  rotZ: 0, scale: 72 } },
  { id: 'float',       label: 'Float',       presets: { rotX: 10, rotY: 0,   rotZ: 0, scale: 76 } },
  { id: 'perspective', label: 'Cinematic',   presets: { rotX: 12, rotY: -8,  rotZ: 0, scale: 70 } },
];

export const CAPTION_COLORS = [
  '#ffffff', '#0a0a14', '#7c6af7', '#f472b6',
  '#34d399', '#60a5fa', '#fbbf24', '#f87171',
  '#a78bfa', '#6ee7b7', '#fdba74', '#f9a8d4',
];

export interface CanvasPreset { label: string; sub: string; w: number; h: number; category: string }
export const CANVAS_PRESETS: CanvasPreset[] = [
  // Standard
  { label: '16:9',  sub: 'Widescreen',    w: 1920, h: 1080, category: 'Standard' },
  { label: '3:2',   sub: 'Classic',       w: 1500, h: 1000, category: 'Standard' },
  { label: '4:3',   sub: 'Traditional',   w: 1400, h: 1050, category: 'Standard' },
  { label: '5:4',   sub: 'Square-ish',    w: 1250, h: 1000, category: 'Standard' },
  { label: '1:1',   sub: 'Square',        w: 1080, h: 1080, category: 'Standard' },
  { label: '4:5',   sub: 'Portrait',      w: 1080, h: 1350, category: 'Standard' },
  { label: '3:4',   sub: 'Tall',          w: 1050, h: 1400, category: 'Standard' },
  { label: '2:3',   sub: 'Tall Classic',  w: 1000, h: 1500, category: 'Standard' },
  { label: '9:16',  sub: 'Mobile',        w: 1080, h: 1920, category: 'Standard' },
];

export function getBgCSSPreview(bg: Background): string {
  if (bg.type === 'gradient' && bg.stops) return `linear-gradient(135deg, ${bg.stops[0]}, ${bg.stops[1]})`;
  if (bg.type === 'solid' && bg.color) return bg.color;
  if (bg.type === 'mesh' && bg.colors) return `radial-gradient(circle at 25% 25%, ${bg.colors[0]}99, transparent 55%), radial-gradient(circle at 75% 75%, ${bg.colors[1]}99, transparent 55%), ${bg.colors[2] ?? '#0d0d1a'}`;
  if (bg.type === 'noise' && bg.base) return bg.base;
  if (bg.type === 'image' && bg.imgUrl) return `url(${bg.imgUrl}) center/cover`;
  if (bg.type === 'pattern' && bg.base) return bg.base;
  return '#0d0d14';
}

// 3D Sticker library — SVG data URIs embedded as base64 stickers
// We use emoji rendered to canvas for sticker thumbnails
export const STICKER_PACKS = [
  {
    pack: '3D Objects',
    items: [
      { id: 's1', label: 'Sphere',   emoji: '🔵', color: '#4facfe' },
      { id: 's2', label: 'Cube',     emoji: '📦', color: '#7c6af7' },
      { id: 's3', label: 'Gem',      emoji: '💎', color: '#00f2fe' },
      { id: 's4', label: 'Star',     emoji: '⭐', color: '#fee140' },
      { id: 's5', label: 'Heart',    emoji: '❤️', color: '#f56060' },
      { id: 's6', label: 'Crown',    emoji: '👑', color: '#fbbf24' },
      { id: 's7', label: 'Fire',     emoji: '🔥', color: '#f97316' },
      { id: 's8', label: 'Lightning',emoji: '⚡', color: '#facc15' },
      { id: 's9', label: 'Moon',     emoji: '🌙', color: '#a78bfa' },
      { id: 's10',label: 'Sun',      emoji: '☀️', color: '#fbbf24' },
      { id: 's11',label: 'Rainbow',  emoji: '🌈', color: '#34d399' },
      { id: 's12',label: 'Sparkles', emoji: '✨', color: '#e879f9' },
      { id: 's13',label: 'Rocket',   emoji: '🚀', color: '#60a5fa' },
      { id: 's14',label: 'Planet',   emoji: '🪐', color: '#c084fc' },
      { id: 's15',label: 'Comet',    emoji: '☄️', color: '#fb923c' },
      { id: 's16',label: 'Diamond',  emoji: '💠', color: '#22d3ee' },
      { id: 's17',label: 'Clover',   emoji: '🍀', color: '#4ade80' },
      { id: 's18',label: 'Butterfly',emoji: '🦋', color: '#f0abfc' },
    ]
  }
];

export const COLOR_FILTERS = [
  { id: 'none',      label: 'Original' },
  { id: 'vivid',     label: 'Vivid' },
  { id: 'warm',      label: 'Warm' },
  { id: 'cool',      label: 'Cool' },
  { id: 'fade',      label: 'Fade' },
  { id: 'grayscale', label: 'B&W' },
  { id: 'sepia',     label: 'Sepia' },
  { id: 'noir',      label: 'Noir' },
  { id: 'invert',    label: 'Invert' },
] as const;

export const DRAW_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6',
  '#8b5cf6','#ec4899','#f43f5e','#000000','#6b7280','#ffffff','#ff0000',
];
