import { TweetCard, TweetTheme } from './types';

// ── Theme definitions ──────────────────────────────────────────────
const THEMES: Record<TweetTheme, {
  bg: string; border: string; text: string; sub: string;
}> = {
  dark: { bg: '#000000', border: '#2f3336', text: '#e7e9ea', sub: '#71767b' },
  dim: { bg: '#15202b', border: '#38444d', text: '#ffffff', sub: '#8b98a5' },
  light: { bg: '#ffffff', border: '#cfd9de', text: '#0f1419', sub: '#536471' },
};

const ACCENT = '#1d9bf0';

// ── Avatar cache ───────────────────────────────────────────────────
const avatarCache = new Map<string, HTMLImageElement>();

function loadAvatar(url: string): HTMLImageElement | null {

  if (avatarCache.has(url)) {
    const img = avatarCache.get(url)!;
    return img.complete ? img : null;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;

  avatarCache.set(url, img);

  return null;
}

// ── Main renderer ──────────────────────────────────────────────────
export function drawTweetCard(
  ctx: CanvasRenderingContext2D,
  card: TweetCard,
  W: number,
  H: number
) {

  const theme = THEMES[card.theme];

  const fontBase = Math.round(W * 0.018 * card.scale);
  const cardW = Math.round(W * 0.52 * card.scale);

  const padding = fontBase * 1.6;
  const avatar = fontBase * 2.2;

  const cx = card.x * W;
  const cy = card.y * H;

  const bx = cx - cardW / 2;

  ctx.save();

  ctx.font = `${fontBase * 1.25}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;

  const lines = wrapText(ctx, card.content, cardW - avatar - padding * 3);

  const lineH = fontBase * 1.6;

  const tweetHeight = lines.length * lineH;

  const cardH =
    padding * 2 +
    avatar +
    tweetHeight +
    fontBase * 3;

  const by = cy - cardH / 2;

  // background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(bx, by, cardW, cardH);

  // avatar
  const avX = bx + padding;
  const avY = by + padding;

  const avatarImg = card.avatarUrl ? loadAvatar(card.avatarUrl) : null;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avX + avatar / 2, avY + avatar / 2, avatar / 2, 0, Math.PI * 2);
  ctx.clip();

  if (avatarImg && avatarImg.complete) {

    ctx.drawImage(avatarImg, avX, avY, avatar, avatar);

  } else {

    ctx.fillStyle = ACCENT;
    ctx.fillRect(avX, avY, avatar, avatar);

  }

  ctx.restore();

  const textX = avX + avatar + padding * 0.9;

  // name
  ctx.fillStyle = theme.text;
  ctx.font = `700 ${fontBase * 1.1}px -apple-system`;
  ctx.fillText(card.authorName, textX, avY + fontBase);

  // verified
  if (card.verified) {

    const nameWidth = ctx.measureText(card.authorName).width;

    drawVerifiedBadge(
      ctx,
      textX + nameWidth + fontBase * 0.8,
      avY + fontBase,
      fontBase * 0.5
    );

  }

  // handle + date
  ctx.font = `400 ${fontBase}px -apple-system`;
  ctx.fillStyle = theme.sub;

  const meta =
    `@${card.authorHandle} · ${card.date}`;

  ctx.fillText(meta, textX, avY + fontBase * 2.2);

  // tweet text
  ctx.fillStyle = theme.text;

  lines.forEach((line, i) => {

    ctx.fillText(
      line,
      textX,
      avY + avatar + padding * 0.8 + i * lineH
    );

  });

  // footer icons
  const footerY =
    avY +
    avatar +
    padding * 0.8 +
    tweetHeight +
    fontBase * 1.8;

  ctx.font = `${fontBase}px -apple-system`;

  ctx.fillStyle = theme.sub;

  const stats = [
    ['💬', card.replies],
    ['🔁', card.reposts],
    ['♥', card.likes],
  ];

  let x = textX;

  stats.forEach(([icon, n]) => {

    ctx.fillText(`${icon} ${fmtN(Number(n))}`, x, footerY);

    x += fontBase * 6;

  });

  ctx.restore();

}

// ── Rich text ─────────────────────────────────────────────────────
function renderRichLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  size: number,
  color: string
) {

  const tokens = line.split(/(\s+)/);

  ctx.font = `400 ${size}px -apple-system`;
  ctx.textBaseline = 'top';

  let cx = x;

  for (const token of tokens) {

    const special = /^[#@]\w+/.test(token);

    ctx.fillStyle = special ? ACCENT : color;

    ctx.fillText(token, cx, y);

    cx += ctx.measureText(token).width;

  }

}

// ── X logo ────────────────────────────────────────────────────────
function drawXLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {

  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.18;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - size * 0.9, cy - size * 0.9);
  ctx.lineTo(cx + size * 0.9, cy + size * 0.9);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + size * 0.9, cy - size * 0.9);
  ctx.lineTo(cx - size * 0.9, cy + size * 0.9);
  ctx.stroke();

  ctx.restore();

}

// ── Verified badge ────────────────────────────────────────────────
function drawVerifiedBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {

  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = ACCENT;
  ctx.fill();

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = r * 0.28;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.48);
  ctx.lineTo(cx + r * 0.55, cy - r * 0.45);
  ctx.stroke();

  ctx.restore();

}

// ── Rounded rect ──────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {

  ctx.beginPath();

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);

  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);

  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);

  ctx.closePath();

}

// ── Wrap text ─────────────────────────────────────────────────────
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number
): string[] {

  const out: string[] = [];

  for (const paragraph of text.split('\n')) {

    let line = '';

    for (const word of paragraph.split(' ')) {

      const test = line ? line + ' ' + word : word;

      if (ctx.measureText(test).width > maxW && line) {

        out.push(line);
        line = word;

      } else {

        line = test;

      }

    }

    if (line) out.push(line);

  }

  return out.slice(0, 10);

}

// ── Trim text ─────────────────────────────────────────────────────
function trimText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number
): string {

  if (ctx.measureText(text).width <= maxW) return text;

  while (text.length > 1 && ctx.measureText(text + '…').width > maxW) {
    text = text.slice(0, -1);
  }

  return text + '…';

}

// ── Format numbers ────────────────────────────────────────────────
function fmtN(n: number): string {

  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';

  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';

  return String(n);

}

// ── Parse tweet URL ───────────────────────────────────────────────
export function parseTweetUrl(url: string): string | null {

  url = url.trim();

  const m = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);

  if (m) return m[1];

  if (/^\d{10,}$/.test(url)) return url;

  return null;

}