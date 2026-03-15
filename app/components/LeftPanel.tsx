'use client';
import { useState } from 'react';
import { AppState, DrawTool, ColorFilterType, CodeBlock, CodeLang, CodeTheme } from '../types';
import { BACKGROUNDS, FRAMES, STYLE_PRESETS, SHADOW_PRESETS, COLOR_FILTERS, getBgCSSPreview } from '../data';
import Section from './Section';
import Slider from './Slider';
import UploadZone from './UploadZone';
import ColorDots from './ColorDots';
import SocialCardPanel from './SocialCardPanel';

interface Props {
  state: AppState;
  onChange: (p: Partial<AppState>) => void;
  onImage: (img: HTMLImageElement, name: string) => void;
}

type TabType = 'Design' | 'BG' | 'Add';

const LANGS: { id: CodeLang; short: string }[] = [
  { id:'javascript', short:'JS'   }, { id:'typescript', short:'TS'   },
  { id:'python',     short:'PY'   }, { id:'html',        short:'HTML' },
  { id:'css',        short:'CSS'  }, { id:'bash',        short:'SH'  },
  { id:'json',       short:'JSON' }, { id:'rust',        short:'RS'  },
  { id:'go',         short:'GO'   }, { id:'java',        short:'JAV' },
  { id:'cpp',        short:'C++'  }, { id:'plain',       short:'TXT' },
];

const CODE_THEMES: { id: CodeTheme; label: string }[] = [
  { id:'dark',    label:'Dark'    }, { id:'dracula', label:'Dracula' },
  { id:'monokai', label:'Monokai' }, { id:'nord',    label:'Nord'    },
  { id:'light',   label:'Light'   }, { id:'github',  label:'GitHub'  },
];

const CODE_SAMPLES: Record<CodeLang, string> = {
  javascript: `function greet(name) {\n  return \`Hello, \${name}!\`\n}\n\nconsole.log(greet('World'))`,
  typescript: `interface User {\n  name: string\n  age: number\n}\n\nconst greet = (u: User): string =>\n  \`Hello, \${u.name}!\``,
  python:     `def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("World"))`,
  html:       `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>My App</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`,
  css:        `.card {\n  display: flex;\n  align-items: center;\n  background: #1a1a2e;\n  border-radius: 12px;\n  padding: 24px;\n}`,
  bash:       `#!/bin/bash\nnpm install\nnpm run build\nnpm start`,
  json:       `{\n  "name": "my-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build"\n  }\n}`,
  rust:       `fn main() {\n    let msg = String::from("Hello!");\n    println!("{}", msg);\n}`,
  go:         `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  java:       `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello!");\n  }\n}`,
  cpp:        `#include <iostream>\n\nint main() {\n  std::cout << "Hello!" << std::endl;\n  return 0;\n}`,
  plain:      `Paste your code here\nIt will appear as a\nbeautiful code block`,
};

export default function LeftPanel({ state, onChange, onImage }: Props) {
  const [tab,     setTab]     = useState<TabType>('Design');
  const [section, setSection] = useState('style');

  const tabBtn = (t: TabType): React.CSSProperties => ({
    flex: 1, padding: '10px 0', background: 'none', border: 'none',
    borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
    color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
    fontSize: 12, fontWeight: tab === t ? 600 : 400,
    cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s',
  });

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '5px 8px', borderRadius: 6,
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: 11, fontWeight: active ? 500 : 400,
    cursor: 'pointer', fontFamily: 'DM Sans,sans-serif',
    transition: 'all 0.12s', textAlign: 'center' as const,
  });

  const SUB = [
    { id:'style',   label:'Style'   },
    { id:'frame',   label:'Frame'   },
    { id:'shadow',  label:'Shadow'  },
    { id:'draw',    label:'Draw'    },
    { id:'caption', label:'Caption' },
    { id:'filters', label:'Filters' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {(['Design','BG','Add'] as TabType[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabBtn(t)}>
            {t === 'Add' ? '＋ Add' : t}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>

        {/* ── DESIGN ── */}
        {tab === 'Design' && (
          <div className="animate-fadein">
            <Section title="Screenshot">
              <UploadZone hasImage={!!state.img} imageName={state.imageName} onImage={onImage} />
            </Section>

            {/* Sub-nav pills */}
            <div style={{ padding:'8px 12px 6px', borderBottom:'1px solid var(--border)', display:'flex', gap:4, flexWrap:'wrap' }}>
              {SUB.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)}
                  style={{ padding:'4px 9px', borderRadius:20, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.12s', whiteSpace:'nowrap', border:`1px solid ${section===s.id?'var(--accent)':'var(--border)'}`, background:section===s.id?'var(--accent-dim)':'transparent', color:section===s.id?'var(--accent)':'var(--text-muted)' }}>
                  {s.label}
                </button>
              ))}
            </div>

            {section === 'style' && (
              <Section title="Style Preset">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5, marginBottom:12 }}>
                  {STYLE_PRESETS.map(s => <button key={s.id} onClick={() => onChange({ stylePreset:s.id })} style={pill(state.stylePreset===s.id)}>{s.label}</button>)}
                </div>
                <Slider label="Padding" value={state.padding}  min={0}  max={150} onChange={v => onChange({ padding:v })} />
                <Slider label="Radius"  value={state.radius}   min={0}  max={40}  onChange={v => onChange({ radius:v })} />
                <Slider label="Opacity" value={state.opacity}  min={0}  max={100} unit="%" onChange={v => onChange({ opacity:v })} />
                <Slider label="Scale"   value={state.scale}    min={20} max={100} unit="%" onChange={v => onChange({ scale:v })} />
              </Section>
            )}

            {section === 'frame' && <FramePanel state={state} onChange={onChange} pill={pill} />}

            {section === 'shadow' && (
              <Section title="Shadow">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5, marginBottom:10 }}>
                  {SHADOW_PRESETS.map(s => (
                    <button key={s.id} onClick={() => onChange({ shadowPreset:s.id, shadowBlur:s.values.blur, shadowY:s.values.y, shadowX:s.values.x, shadowOpacity:s.values.op })} style={pill(state.shadowPreset===s.id)}>{s.label}</button>
                  ))}
                </div>
                <Slider label="Blur"    value={state.shadowBlur}    min={0}   max={120} onChange={v => onChange({ shadowBlur:v })} />
                <Slider label="Y Pos"   value={state.shadowY}       min={-60} max={80}  onChange={v => onChange({ shadowY:v })} />
                <Slider label="X Pos"   value={state.shadowX}       min={-60} max={60}  onChange={v => onChange({ shadowX:v })} />
                <Slider label="Opacity" value={state.shadowOpacity} min={0}   max={100} unit="%" onChange={v => onChange({ shadowOpacity:v })} />
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                  <span style={{ fontSize:12, color:'var(--text-secondary)', minWidth:56, flexShrink:0 }}>Color</span>
                  <input type="color" value={state.shadowColor} onChange={e => onChange({ shadowColor:e.target.value })}
                    style={{ width:34, height:26, borderRadius:6, border:'1px solid var(--border)', background:'none', cursor:'pointer', padding:2 }} />
                  <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'DM Mono,monospace' }}>{state.shadowColor}</span>
                </div>
              </Section>
            )}

            {section === 'draw'    && <DrawPanel    state={state} onChange={onChange} />}
            {section === 'caption' && <CaptionPanel state={state} onChange={onChange} />}
            {section === 'filters' && <FiltersPanel state={state} onChange={onChange} />}
          </div>
        )}

        {/* ── BG ── */}
        {tab === 'BG' && (
          <div className="animate-fadein">
            {[
              { label:'Images',    types:['image']    },
              { label:'Gradients', types:['gradient'] },
              { label:'Mesh',      types:['mesh']     },
              { label:'Solid',     types:['solid']    },
              { label:'Noise',     types:['noise']    },
              { label:'Patterns',  types:['pattern']  },
            ].map(cat => (
              <Section key={cat.label} title={cat.label} defaultOpen={cat.label==='Images'||cat.label==='Gradients'||cat.label==='Patterns'}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
                  {BACKGROUNDS.filter(b => cat.types.includes(b.type)).map(bg => (
                    <div key={bg.id} onClick={() => onChange({ bg:bg.id })} title={bg.label}
                      style={{ aspectRatio:'1', borderRadius:7, cursor:'pointer', background:getBgCSSPreview(bg), border:`2px solid ${state.bg===bg.id?'var(--accent)':'transparent'}`, boxShadow:state.bg===bg.id?'0 0 0 1px var(--accent)':'none', transition:'all 0.12s', transform:state.bg===bg.id?'scale(1.1)':'scale(1)' }} />
                  ))}
                </div>
              </Section>
            ))}
          </div>
        )}

        {/* ── ADD ── */}
        {tab === 'Add' && (
          <div className="animate-fadein">
            {/* <Section title="Tweet Card">
              <SocialCardPanel state={state} onChange={onChange} />
            </Section> */}
            <CodePanel state={state} onChange={onChange} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Frame + URL ── */
function FramePanel({ state, onChange, pill }: { state:AppState; onChange:(p:Partial<AppState>)=>void; pill:(a:boolean)=>React.CSSProperties }) {
  const hasUrl = ['mac','mac-light','chrome','arc'].includes(state.frame);
  return (
    <>
      <Section title="Frame / Mockup">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:5 }}>
          {FRAMES.map(f => <button key={f.id} onClick={() => onChange({ frame:f.id })} style={pill(state.frame===f.id)}>{f.label}</button>)}
        </div>
      </Section>
      {hasUrl && (
        <Section title="Browser URL">
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:11, color:'var(--text-secondary)', display:'block', marginBottom:5 }}>Address bar URL</label>
            <input type="text" value={state.frameUrl} onChange={e => onChange({ frameUrl:e.target.value })}
              placeholder="https://example.com"
              style={{ width:'100%', padding:'8px 10px', fontSize:12, fontFamily:'DM Mono,monospace' }} />
          </div>
          {(state.frame==='mac'||state.frame==='mac-light') && (
            <div>
              <label style={{ fontSize:11, color:'var(--text-secondary)', display:'block', marginBottom:5 }}>Window title</label>
              <input type="text" value={state.frameTitle} onChange={e => onChange({ frameTitle:e.target.value })}
                placeholder="My App" style={{ width:'100%', padding:'8px 10px', fontSize:12 }} />
            </div>
          )}
        </Section>
      )}
    </>
  );
}

/* ── Code block ── */
function CodePanel({ state, onChange }: { state:AppState; onChange:(p:Partial<AppState>)=>void }) {
  const cb = state.codeBlock;

  function upsert(patch: Partial<CodeBlock>) {
    if (cb) {
      onChange({ codeBlock:{ ...cb, ...patch } });
    } else {
      const lang = (patch.lang ?? 'javascript') as CodeLang;
      onChange({
        codeBlock: {
          id: Date.now().toString(), code:CODE_SAMPLES[lang],
          lang, theme:'dark', x:0.5, y:0.5, scale:0.85,
          showLineNumbers:true, fileName:'',
          ...patch,
        },
      });
    }
  }

  const p2 = (active: boolean): React.CSSProperties => ({
    padding:'5px 4px', borderRadius:5,
    border:`1px solid ${active?'var(--accent)':'var(--border)'}`,
    background:active?'var(--accent-dim)':'var(--bg-elevated)',
    color:active?'var(--accent)':'var(--text-secondary)',
    fontSize:10, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
    transition:'all 0.12s', textAlign:'center' as const,
  });

  return (
    <Section title="Code Snippet">
      {!cb ? (
        <>
          <p style={{ fontSize:11, color:'var(--text-muted)', margin:'0 0 12px', lineHeight:1.6 }}>
            Add a syntax-highlighted code block to your canvas.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, marginBottom:12 }}>
            {LANGS.map(l => (
              <button key={l.id} onClick={() => upsert({ lang:l.id, code:CODE_SAMPLES[l.id] })} style={p2(false)}>{l.short}</button>
            ))}
          </div>
          <button onClick={() => upsert({ lang:'javascript' })}
            style={{ width:'100%', padding:'10px', borderRadius:8, border:'none', background:'var(--accent)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            ✦ Add Code Block
          </button>
        </>
      ) : (
        <>
          <textarea value={cb.code} onChange={e => upsert({ code:e.target.value })} rows={8}
            style={{ width:'100%', padding:'8px 10px', fontSize:11, fontFamily:'DM Mono,monospace', resize:'vertical', marginBottom:10, lineHeight:1.6 }} />

          <label style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>Language</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, marginBottom:10 }}>
            {LANGS.map(l => <button key={l.id} onClick={() => upsert({ lang:l.id })} style={p2(cb.lang===l.id)}>{l.short}</button>)}
          </div>

          <label style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>Theme</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, marginBottom:10 }}>
            {CODE_THEMES.map(t => <button key={t.id} onClick={() => upsert({ theme:t.id })} style={p2(cb.theme===t.id)}>{t.label}</button>)}
          </div>

          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:11, color:'var(--text-secondary)', display:'block', marginBottom:5 }}>File name (optional)</label>
            <input type="text" value={cb.fileName} onChange={e => upsert({ fileName:e.target.value })}
              placeholder="index.js" style={{ width:'100%', padding:'6px 9px', fontSize:12, fontFamily:'DM Mono,monospace' }} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <input type="checkbox" checked={cb.showLineNumbers} onChange={e => upsert({ showLineNumbers:e.target.checked })} id="ln" style={{ cursor:'pointer' }} />
            <label htmlFor="ln" style={{ fontSize:12, color:'var(--text-secondary)', cursor:'pointer' }}>Show line numbers</label>
          </div>

          <Slider label="Scale" value={Math.round(cb.scale*100)} min={30} max={150} unit="%" onChange={v => upsert({ scale:v/100 })} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginBottom:3 }}>X — {Math.round(cb.x*100)}%</label>
              <input type="range" min={0.05} max={0.95} step={0.01} value={cb.x} onChange={e => upsert({ x:Number(e.target.value) })} style={{ width:'100%' }} />
            </div>
            <div>
              <label style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginBottom:3 }}>Y — {Math.round(cb.y*100)}%</label>
              <input type="range" min={0.05} max={0.95} step={0.01} value={cb.y} onChange={e => upsert({ y:Number(e.target.value) })} style={{ width:'100%' }} />
            </div>
          </div>

          <button onClick={() => onChange({ codeBlock:null })}
            style={{ width:'100%', padding:'7px', borderRadius:6, border:'1px solid var(--danger)', background:'transparent', color:'var(--danger)', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            🗑 Remove Code Block
          </button>
        </>
      )}
    </Section>
  );
}

/* ── Draw ── */
function DrawPanel({ state, onChange }: { state:AppState; onChange:(p:Partial<AppState>)=>void }) {
  const tools: { id:DrawTool; label:string; icon:string }[] = [
    { id:'none',   label:'Off',    icon:'✋' }, { id:'arrow',  label:'Arrow',  icon:'↗' },
    { id:'curve',  label:'Curve',  icon:'↪' }, { id:'line',   label:'Line',   icon:'╱' },
    { id:'rect',   label:'Rect',   icon:'▭' }, { id:'circle', label:'Circle', icon:'○' },
    { id:'blur',   label:'Blur',   icon:'◌' },
  ];
  const c = (a:boolean): React.CSSProperties => ({ padding:'8px 4px', borderRadius:6, border:`1px solid ${a?'var(--accent)':'var(--border)'}`, background:a?'var(--accent-dim)':'var(--bg-elevated)', color:a?'var(--accent)':'var(--text-secondary)', fontSize:10, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.12s', display:'flex', flexDirection:'column' as const, alignItems:'center', gap:3 });
  return (
    <Section title="Draw & Markup">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginBottom:12 }}>
        {tools.map(t => <button key={t.id} onClick={() => onChange({ activeTool:t.id })} style={c(state.activeTool===t.id)}><span style={{ fontSize:15 }}>{t.icon}</span><span>{t.label}</span></button>)}
      </div>
      <ColorDots label="Color" value={state.drawColor} onChange={v => onChange({ drawColor:v })} />
      <div style={{ marginTop:10 }}>
        <Slider label="Stroke" value={state.drawStroke} min={1} max={20} onChange={v => onChange({ drawStroke:v })} />
      </div>
      {state.shapes.length > 0 && (
        <div style={{ display:'flex', gap:6, marginTop:10 }}>
          <button onClick={() => onChange({ shapes:state.shapes.slice(0,-1) })} style={{ flex:1, padding:'6px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-secondary)', fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>↩ Undo</button>
          <button onClick={() => onChange({ shapes:[] })} style={{ flex:1, padding:'6px', borderRadius:6, border:'1px solid var(--danger)', background:'transparent', color:'var(--danger)', fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Clear</button>
        </div>
      )}
    </Section>
  );
}

/* ── Caption ── */
function CaptionPanel({ state, onChange }: { state:AppState; onChange:(p:Partial<AppState>)=>void }) {
  return (
    <Section title="Caption">
      <textarea value={state.caption} onChange={e => onChange({ caption:e.target.value })} rows={3} placeholder="Add a caption..."
        style={{ width:'100%', padding:'8px 10px', fontSize:13, resize:'none', marginBottom:10 }} />
      <ColorDots label="Color" value={state.captionColor} onChange={v => onChange({ captionColor:v })} />
      <div style={{ marginTop:10 }}>
        <Slider label="Font Size" value={state.captionSize} min={12} max={60} onChange={v => onChange({ captionSize:v })} />
      </div>
      <div style={{ display:'flex', gap:6, marginTop:8 }}>
        {(['top','bottom'] as const).map(pos => (
          <button key={pos} onClick={() => onChange({ captionPos:pos })}
            style={{ flex:1, padding:'7px', borderRadius:6, border:`1px solid ${state.captionPos===pos?'var(--accent)':'var(--border)'}`, background:state.captionPos===pos?'var(--accent-dim)':'var(--bg-elevated)', color:state.captionPos===pos?'var(--accent)':'var(--text-secondary)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif', textTransform:'capitalize', transition:'all 0.12s' }}>
            {pos}
          </button>
        ))}
      </div>
    </Section>
  );
}

/* ── Filters ── */
function FiltersPanel({ state, onChange }: { state:AppState; onChange:(p:Partial<AppState>)=>void }) {
  const labels: Record<string,string> = { none:'Original', vivid:'🌈 Vivid', warm:'🔆 Warm', cool:'❄️ Cool', fade:'🌫 Fade', grayscale:'◑ B&W', sepia:'🟤 Sepia', noir:'⬛ Noir', invert:'🔄 Invert' };
  const c = (a:boolean): React.CSSProperties => ({ padding:'7px 4px', borderRadius:6, border:`1px solid ${a?'var(--accent)':'var(--border)'}`, background:a?'var(--accent-dim)':'var(--bg-elevated)', color:a?'var(--accent)':'var(--text-secondary)', fontSize:10, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.12s' });
  return (
    <Section title="Color Filters">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5, marginBottom:10 }}>
        {COLOR_FILTERS.map(f => <button key={f.id} onClick={() => onChange({ colorFilter:f.id as ColorFilterType })} style={c(state.colorFilter===f.id)}>{labels[f.id]??f.label}</button>)}
      </div>
      {state.colorFilter !== 'none' && <Slider label="Intensity" value={state.filterIntensity} min={0} max={100} unit="%" onChange={v => onChange({ filterIntensity:v })} />}
    </Section>
  );
}
