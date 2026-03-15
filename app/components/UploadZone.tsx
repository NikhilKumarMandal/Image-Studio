'use client';
import { useRef, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
interface Props { hasImage: boolean; imageName?: string; onImage: (img: HTMLImageElement, name: string) => void; }
export default function UploadZone({ hasImage, imageName, onImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => { const img = new Image(); img.onload = () => onImage(img, file.name); img.src = ev.target?.result as string; };
    reader.readAsDataURL(file);
  }
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
      <div onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) loadFile(f); }}
        style={{ border:`1.5px dashed ${dragging?'var(--accent)':hasImage?'var(--border-strong)':'var(--border)'}`, borderRadius:9, padding:hasImage?'9px 12px':'20px 12px', textAlign:'center', cursor:'pointer', background:dragging?'var(--accent-dim)':'var(--bg-elevated)', transition:'all 0.15s' }}>
        {hasImage ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <ImageIcon size={13} style={{ color:'var(--accent)', flexShrink:0 }} />
            <span style={{ fontSize:12, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{imageName ?? 'Image loaded'}</span>
            <span style={{ fontSize:11, color:'var(--accent)', marginLeft:'auto', flexShrink:0 }}>Change</span>
          </div>
        ) : (
          <>
            <Upload size={18} style={{ color:'var(--text-muted)', margin:'0 auto 7px' }} />
            <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 3px' }}><span style={{ color:'var(--accent)', fontWeight:500 }}>Click to upload</span> or drag & drop</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', margin:0 }}>PNG · JPG · WEBP · GIF</p>
          </>
        )}
      </div>
    </div>
  );
}
