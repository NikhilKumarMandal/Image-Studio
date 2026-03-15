'use client';
import { useState } from 'react';
import { AppState, AlignType } from '../types';
import { EFFECTS, CANVAS_PRESETS } from '../data';
import Section from './Section';
import Slider from './Slider';

interface Props { state: AppState; onChange: (p: Partial<AppState>) => void; }
type Tab = 'Effects' | 'Position' | 'Canvas';

const ALIGN_GRID: { id: AlignType; s: string }[] = [
  { id:'top-left',      s:'↖' }, { id:'top-center',   s:'↑' }, { id:'top-right',     s:'↗' },
  { id:'left',          s:'←' }, { id:'center',        s:'⊙' }, { id:'right',         s:'→' },
  { id:'bottom-left',   s:'↙' }, { id:'bottom-center', s:'↓' }, { id:'bottom-right',  s:'↘' },
];

export default function RightPanel({ state, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('Effects');

  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex:1, padding:'9px 4px', background:'none', border:'none',
    borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`,
    color: tab===t?'var(--accent)':'var(--text-muted)',
    fontSize:11, fontWeight:tab===t?600:400,
    cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.15s',
    whiteSpace:'nowrap',
  });

  const chip = (active: boolean): React.CSSProperties => ({
    padding:'7px 6px', borderRadius:6,
    border:`1px solid ${active?'var(--accent)':'var(--border)'}`,
    background: active?'var(--accent-dim)':'var(--bg-elevated)',
    color: active?'var(--accent)':'var(--text-secondary)',
    fontSize:11, fontWeight:active?500:400,
    cursor:'pointer', fontFamily:'DM Sans,sans-serif',
    transition:'all 0.15s', textAlign:'center' as const,
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {(['Effects','Position','Canvas'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{t}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>

        {/* ── EFFECTS ── */}
        {tab === 'Effects' && (
          <div className="animate-fadein">
            <Section title="3D Style">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:5, marginBottom:10 }}>
                {EFFECTS.map(e => (
                  <button key={e.id} onClick={() => onChange({ effect:e.id, rotX:e.presets.rotX, rotY:e.presets.rotY, rotZ:e.presets.rotZ, scale:e.presets.scale })} style={chip(state.effect===e.id)}>{e.label}</button>
                ))}
              </div>
            </Section>
            <Section title="Fine Tune">
              <Slider label="Rotate X" value={state.rotX}  min={-30} max={30} unit="°" onChange={v => onChange({ rotX:v })} />
              <Slider label="Rotate Y" value={state.rotY}  min={-30} max={30} unit="°" onChange={v => onChange({ rotY:v })} />
              <Slider label="Rotate Z" value={state.rotZ}  min={-30} max={30} unit="°" onChange={v => onChange({ rotZ:v })} />
              <Slider label="Scale"    value={state.scale} min={20}  max={100} unit="%" onChange={v => onChange({ scale:v })} />
            </Section>
          </div>
        )}

        {/* ── POSITION ── */}
        {tab === 'Position' && (
          <div className="animate-fadein">
            <Section title="Alignment">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, marginBottom:10 }}>
                {ALIGN_GRID.map(a => (
                  <button key={a.id} onClick={() => onChange({ align:a.id })}
                    style={{ padding:'10px', borderRadius:6, border:`1px solid ${state.align===a.id?'var(--accent)':'var(--border)'}`, background:state.align===a.id?'var(--accent-dim)':'var(--bg-elevated)', color:state.align===a.id?'var(--accent)':'var(--text-muted)', fontSize:16, cursor:'pointer', fontFamily:'DM Mono,monospace', transition:'all 0.15s', textAlign:'center' }}>
                    {a.s}
                  </button>
                ))}
              </div>
            </Section>
            <Section title="Manual Offset">
              <Slider label="Offset X" value={state.offsetX} min={-300} max={300} onChange={v => onChange({ offsetX:v })} />
              <Slider label="Offset Y" value={state.offsetY} min={-300} max={300} onChange={v => onChange({ offsetY:v })} />
            </Section>
          </div>
        )}

        {/* ── CANVAS ── */}
        {tab === 'Canvas' && (
          <div className="animate-fadein">
            <Section title="Custom Size">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <label style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Width</label>
                  <input type="number" value={state.canvasW} min={200} max={4000}
                    onChange={e => onChange({ canvasW:Math.max(200,Number(e.target.value)) })}
                    style={{ width:'100%', padding:'7px 8px', fontSize:13, fontFamily:'DM Mono,monospace' }} />
                </div>
                <span style={{ color:'var(--text-muted)', fontSize:18, marginTop:16, flexShrink:0 }}>×</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <label style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Height</label>
                  <input type="number" value={state.canvasH} min={200} max={4000}
                    onChange={e => onChange({ canvasH:Math.max(200,Number(e.target.value)) })}
                    style={{ width:'100%', padding:'7px 8px', fontSize:13, fontFamily:'DM Mono,monospace' }} />
                </div>
              </div>
              <p style={{ fontSize:10, color:'var(--text-muted)', margin:'4px 0 0' }}>{state.canvasW} × {state.canvasH} px</p>
            </Section>

            {(['Standard'] as const).map(cat => (
              <Section key={cat} title={cat} defaultOpen={cat==='Standard'}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {CANVAS_PRESETS.filter(p => p.category===cat).map(p => {
                    const active = state.canvasW===p.w && state.canvasH===p.h;
                    const aspect = p.w/p.h;
                    const maxPx  = 28;
                    const tw     = aspect>=1 ? maxPx : Math.round(maxPx*aspect);
                    const th     = aspect<1  ? maxPx : Math.round(maxPx/aspect);
                    return (
                      <button key={`${cat}-${p.label}-${p.w}`} onClick={() => onChange({ canvasW:p.w, canvasH:p.h })}
                        style={{ padding:'8px 4px', borderRadius:8, border:`1.5px solid ${active?'var(--accent)':'var(--border)'}`, background:active?'var(--accent-dim)':'var(--bg-elevated)', color:active?'var(--accent)':'var(--text-secondary)', cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:5, minWidth:0 }}>
                        <div style={{ width:tw, height:th, border:`1.5px solid ${active?'var(--accent)':'var(--border-strong)'}`, borderRadius:2, background:active?'var(--accent-dim)':'transparent', flexShrink:0 }} />
                        <span style={{ fontSize:11, fontWeight:600, lineHeight:1 }}>{p.label}</span>
                        <span style={{ fontSize:9, color:active?'var(--accent)':'var(--text-muted)', lineHeight:1 }}>{p.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
