'use client';
import { useState, ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
}

export default function Section({ title, children, defaultOpen = true, action }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px 10px' }}>
        <button onClick={() => setOpen(!open)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'DM Sans,sans-serif', padding:0 }}>
          <span style={{ fontSize:9, transition:'transform 0.2s', display:'inline-block', transform: open?'rotate(90deg)':'rotate(0deg)' }}>▶</span>
          {title}
        </button>
        {action}
      </div>
      {open && <div style={{ padding:'0 14px 12px' }}>{children}</div>}
    </div>
  );
}
