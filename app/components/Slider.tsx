'use client';
interface SliderProps {
  label: string; value: number; min: number; max: number;
  step?: number; unit?: string; onChange: (v: number) => void;
}
export default function Slider({ label, value, min, max, step=1, unit='', onChange }: SliderProps) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
      <span style={{ fontSize:12, color:'var(--text-secondary)', minWidth:62, flexShrink:0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{ flex:1 }} />
      <span style={{ fontSize:11, color:'var(--text-muted)', minWidth:34, textAlign:'right', fontFamily:'DM Mono,monospace' }}>{value}{unit}</span>
    </div>
  );
}
