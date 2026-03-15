'use client';
import { Camera, Download, RotateCcw, Undo2, Redo2 } from 'lucide-react';
import { AppState } from '../types';
import Image from 'next/image';

interface Props {
  state: AppState; canUndo: boolean; canRedo: boolean;
  onReset: () => void; onExport: () => void; onUndo: () => void; onRedo: () => void;
}

export default function TopBar({ state, canUndo, canRedo, onReset, onExport, onUndo, onRedo }: Props) {
  const iconBtn = (active: boolean): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:4, padding:'5px 8px',
    borderRadius:6, border:'1px solid var(--border)', background:'transparent',
    color: active?'var(--text-secondary)':'var(--text-muted)',
    fontSize:12, cursor:active?'pointer':'not-allowed',
    fontFamily:'DM Sans,sans-serif', opacity:active?1:0.35,
    transition:'all 0.15s', minHeight:32, flexShrink:0,
  });

  return (
    <div className="topbar">
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Camera size={14} color="white" />
        </div>
        <span className="topbar-title" style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.4px', whiteSpace:'nowrap' }}>
          Image Studio
        </span>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
        <button onClick={onUndo} disabled={!canUndo} style={iconBtn(canUndo)} title="Undo (Ctrl+Z)">
          <Undo2 size={13} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} style={iconBtn(canRedo)} title="Redo (Ctrl+Y)">
          <Redo2 size={13} />
        </button>

        <div className="topbar-sep" style={{ width:1, height:18, background:'var(--border)', flexShrink:0 }} />
        <span className="topbar-dims" style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'DM Mono,monospace', whiteSpace:'nowrap', flexShrink:0 }}>
          {state.canvasW}×{state.canvasH}
        </span>
        <div className="topbar-sep" style={{ width:1, height:18, background:'var(--border)', flexShrink:0 }} />

        <button onClick={onReset} style={{ ...iconBtn(true), gap:5 }}>
          <RotateCcw size={12} />
          <span className="label-reset">Reset</span>
        </button>

        <button onClick={onExport} className="btn-export"
          style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:7, border:'none', background:'linear-gradient(135deg,#3b82f6,#60a5fa)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap', minHeight:32, flexShrink:0 }}>
          <Download size={13} />
          <span>Export PNG</span>
        </button>
      </div>
    </div>
  );
}
