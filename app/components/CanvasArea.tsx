'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { AppState, DrawShape } from '../types';
import { renderCanvas, screenToCanvas, drawShape } from '../renderer';

interface Props { state: AppState; onChange: (p: Partial<AppState>) => void; }
type DragMode = 'none' | 'move-img' | 'draw';

export default function CanvasArea({ state, onChange }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const [zoom, setZoom] = useState(60);

  const drag = useRef<{
    mode: DragMode; sx: number; sy: number;
    origOffX?: number; origOffY?: number;
    shape?: DrawShape;
  }>({ mode: 'none', sx: 0, sy: 0 });

  /* ── Render main canvas ── */
  const render = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const c = canvasRef.current;
      if (!c) return;
      c.width  = state.canvasW;
      c.height = state.canvasH;
      renderCanvas(c, state);
    });
  }, [state]);

  useEffect(() => {
    render();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [render]);

  /* ── Image bounds for drag hit-test ── */
  function getImgBounds() {
    if (!state.img) return null;
    const W = state.canvasW, H = state.canvasH, pad = state.padding;
    const natW = state.img.naturalWidth  || state.img.width;
    const natH = state.img.naturalHeight || state.img.height;
    const textH = state.caption.trim() ? state.captionSize + 32 : 0;
    const fit  = Math.min((W - pad * 2) / natW, (H - pad * 2 - textH) / natH);
    const imgW = natW * fit * (state.scale / 100);
    const imgH = natH * fit * (state.scale / 100);
    const capTopH = state.captionPos === 'top' && state.caption.trim() ? textH : 0;
    const capBotH = state.captionPos === 'bottom' && state.caption.trim() ? textH : 0;
    const amap: Record<string, [number,number]> = {
      'top-left':      [pad+imgW/2,     pad+capTopH+imgH/2],
      'top-center':    [W/2,            pad+capTopH+imgH/2],
      'top-right':     [W-pad-imgW/2,   pad+capTopH+imgH/2],
      'left':          [pad+imgW/2,     H/2+(capTopH-capBotH)/2],
      'center':        [W/2,            H/2+(capTopH-capBotH)/2],
      'right':         [W-pad-imgW/2,   H/2+(capTopH-capBotH)/2],
      'bottom-left':   [pad+imgW/2,     H-pad-capBotH-imgH/2],
      'bottom-center': [W/2,            H-pad-capBotH-imgH/2],
      'bottom-right':  [W-pad-imgW/2,   H-pad-capBotH-imgH/2],
    };
    const [cx,cy] = amap[state.align] ?? [W/2,H/2];
    const fcx = cx+state.offsetX, fcy = cy+state.offsetY;
    return { x:fcx-imgW/2, y:fcy-imgH/2, w:imgW, h:imgH };
  }

  function getCursor(cx: number, cy: number) {
    if (state.activeTool !== 'none') return 'crosshair';
    const ib = getImgBounds();
    if (ib && cx>=ib.x && cx<=ib.x+ib.w && cy>=ib.y && cy<=ib.y+ib.h) return 'move';
    return 'default';
  }

  const toCanvas = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    return screenToCanvas(e.clientX, e.clientY, canvasRef.current);
  };

  const onDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x: cx, y: cy } = toCanvas(e);

    if (state.activeTool !== 'none') {
      if (state.activeTool === 'text') {
        const t = window.prompt('Enter text:');
        if (t) onChange({ shapes: [...state.shapes, { id: Date.now().toString(), tool: 'text', points: [{x:cx,y:cy}], color: state.drawColor, strokeWidth: state.drawStroke, text: t, fontSize: 24 }] });
        return;
      }
      drag.current = { mode: 'draw', sx: cx, sy: cy, shape: { id: Date.now().toString(), tool: state.activeTool, points: [{x:cx,y:cy}], color: state.drawColor, strokeWidth: state.drawStroke } };
      return;
    }

    const ib = getImgBounds();
    if (ib && cx>=ib.x && cx<=ib.x+ib.w && cy>=ib.y && cy<=ib.y+ib.h) {
      drag.current = { mode: 'move-img', sx: cx, sy: cy, origOffX: state.offsetX, origOffY: state.offsetY };
    }
  }, [state, onChange]);

  const onMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: cx, y: cy } = toCanvas(e);
    const ov = overlayRef.current;
    if (ov) ov.style.cursor = getCursor(cx, cy);

    const d = drag.current;
    if (d.mode === 'none') return;
    const dx = cx - d.sx, dy = cy - d.sy;

    if (d.mode === 'move-img') {
      onChange({ offsetX: (d.origOffX ?? 0) + dx, offsetY: (d.origOffY ?? 0) + dy });
      return;
    }
    if (d.mode === 'draw' && d.shape) {
      const tool = d.shape.tool;
      const pts = tool === 'curve'
        ? [...d.shape.points, { x: cx, y: cy }]
        : [d.shape.points[0], { x: cx, y: cy }];
      const updated = { ...d.shape, points: pts };
      d.shape = updated;
      const mc = canvasRef.current;
      if (ov && mc) {
        ov.width = mc.width; ov.height = mc.height;
        const oct = ov.getContext('2d')!;
        oct.clearRect(0, 0, ov.width, ov.height);
        drawShape(oct, updated);
      }
    }
  }, [state, onChange]);

  const onUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (d.mode === 'draw' && d.shape && canvasRef.current) {
      const { x: cx, y: cy } = toCanvas(e);
      const tool = d.shape.tool;
      const pts = tool === 'curve'
        ? [...d.shape.points, { x: cx, y: cy }]
        : [d.shape.points[0], { x: cx, y: cy }];
      onChange({ shapes: [...state.shapes, { ...d.shape, points: pts }] });
      const ov = overlayRef.current;
      if (ov) ov.getContext('2d')!.clearRect(0, 0, ov.width, ov.height);
    }
    drag.current = { mode: 'none', sx: 0, sy: 0 };
  }, [state, onChange]);

  const scaleF = zoom / 100;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1a1a1a', position: 'relative', minHeight: 0 }}>

      {/* Scrollable canvas viewport */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 60px' }}>
        <div style={{ position: 'relative', flexShrink: 0, transform: `scale(${scaleF})`, transformOrigin: 'center center', transition: 'transform 0.12s' }}>
          {/* Checkerboard bg */}
          <div style={{ position: 'absolute', inset: -1, borderRadius: 11, background: 'repeating-conic-gradient(#222 0% 25%,#1c1c1c 0% 50%)', backgroundSize: '14px 14px', zIndex: 0, boxShadow: '0 0 0 1px #2a2a2a' }} />

          {/* Main canvas */}
          <canvas ref={canvasRef} width={state.canvasW} height={state.canvasH}
            style={{ display: 'block', position: 'relative', zIndex: 1, borderRadius: 10, width: state.canvasW, height: state.canvasH }} />
          {/* Interaction overlay */}
          <canvas ref={overlayRef} width={state.canvasW} height={state.canvasH}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            style={{ position: 'absolute', inset: 0, zIndex: 4, borderRadius: 10, width: state.canvasW, height: state.canvasH }} />
        </div>
      </div>

      {/* Zoom bar — fixed at bottom of canvas area, never overlaps panels */}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(18,18,18,0.96)', border: '1px solid #2e2e2e',
        borderRadius: 24, padding: '5px 12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'all',
        userSelect: 'none',
      }}>
        <button onClick={() => setZoom(z => Math.max(20, z - 10))} style={zBtn()}>−</button>
        <input type="range" min={20} max={200} value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          style={{ width: 80 }} />
        <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={zBtn()}>+</button>
        <span style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono,monospace', minWidth: 34, textAlign: 'center' }}>{zoom}%</span>
        <button onClick={() => setZoom(60)} style={{ ...zBtn(), fontSize: 10, padding: '2px 8px', borderRadius: 12 }}>Fit</button>
      </div>
    </div>
  );
}

const zBtn = (): React.CSSProperties => ({
  width: 22, height: 22, borderRadius: 6,
  border: '1px solid #2e2e2e', background: 'transparent',
  color: '#888', fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1, padding: 0, fontFamily: 'monospace', flexShrink: 0,
});
