import { AppState, FrameType, DrawShape, ColorFilterType, CodeBlock, CodeLang, CodeTheme } from './types';
import { BACKGROUNDS } from './data';
import { drawTweetCard } from './socialRenderer';

// ── Code syntax tokens ─────────────────────────────────────────────
const KEYWORDS: Record<string, string[]> = {
  javascript: ['function','return','const','let','var','if','else','for','while','class','import','export','from','async','await','new','this','true','false','null','undefined','typeof','instanceof','=>'],
  typescript: ['function','return','const','let','var','if','else','for','while','class','import','export','from','async','await','new','this','true','false','null','undefined','interface','type','string','number','boolean','any','void','enum'],
  python:     ['def','return','import','from','class','if','elif','else','for','while','in','not','and','or','True','False','None','lambda','with','as','try','except','finally','pass','break','continue','print'],
  html:       ['html','head','body','div','span','p','a','img','input','button','form','script','link','meta','style','class','id','href','src','type'],
  css:        ['color','background','margin','padding','border','font','display','flex','grid','width','height','position','top','left','right','bottom','transform','transition','animation'],
  bash:       ['echo','cd','ls','mkdir','rm','cp','mv','grep','find','cat','chmod','sudo','apt','npm','git','curl','wget','export','source'],
  json:       [],
  rust:       ['fn','let','mut','use','mod','pub','struct','enum','impl','trait','where','match','if','else','for','while','loop','return','true','false','None','Some','Ok','Err'],
  go:         ['func','var','const','type','struct','interface','import','package','return','if','else','for','range','go','chan','defer','select','switch','case'],
  java:       ['public','private','protected','class','interface','extends','implements','return','void','int','String','boolean','new','this','super','static','final','import','package'],
  cpp:        ['int','float','double','bool','char','void','class','struct','return','if','else','for','while','include','using','namespace','public','private','new','delete','const','auto'],
  plain:      [],
};

const THEMES: Record<CodeTheme, { bg:string; border:string; headerBg:string; text:string; comment:string; keyword:string; string:string; number:string; fn:string; lineNum:string }> = {
  dark:     { bg:'#1e1e2e', border:'#313244', headerBg:'#181825', text:'#cdd6f4', comment:'#6c7086', keyword:'#cba6f7', string:'#a6e3a1', number:'#fab387', fn:'#89b4fa', lineNum:'#45475a' },
  dracula:  { bg:'#282a36', border:'#44475a', headerBg:'#21222c', text:'#f8f8f2', comment:'#6272a4', keyword:'#ff79c6', string:'#50fa7b', number:'#ffb86c', fn:'#8be9fd', lineNum:'#44475a' },
  monokai:  { bg:'#272822', border:'#3e3d32', headerBg:'#1e1f1c', text:'#f8f8f2', comment:'#75715e', keyword:'#f92672', string:'#a6e22e', number:'#ae81ff', fn:'#66d9e8', lineNum:'#3e3d32' },
  nord:     { bg:'#2e3440', border:'#3b4252', headerBg:'#242933', text:'#d8dee9', comment:'#4c566a', keyword:'#81a1c1', string:'#a3be8c', number:'#b48ead', fn:'#88c0d0', lineNum:'#434c5e' },
  light:    { bg:'#fafafa', border:'#e1e4e8', headerBg:'#f0f0f0', text:'#24292e', comment:'#6a737d', keyword:'#d73a49', string:'#032f62', number:'#005cc5', fn:'#6f42c1', lineNum:'#959da5' },
  github:   { bg:'#ffffff', border:'#d0d7de', headerBg:'#f6f8fa', text:'#24292f', comment:'#8b949e', keyword:'#cf222e', string:'#0a3069', number:'#0550ae', fn:'#8250df', lineNum:'#8c959f' },
};

// ── Main render ────────────────────────────────────────────────────
export function renderCanvas(canvas: HTMLCanvasElement, state: AppState): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, W, H, state);

  if (state.img) {
    const pad    = state.padding;
    const textH  = state.caption.trim() ? state.captionSize + 32 : 0;
    const capTopH = state.captionPos === 'top'    && state.caption.trim() ? textH : 0;
    const capBotH = state.captionPos === 'bottom' && state.caption.trim() ? textH : 0;
    const availW = W - pad * 2, availH = H - pad * 2 - textH;
    const natW   = state.img.naturalWidth  || state.img.width;
    const natH   = state.img.naturalHeight || state.img.height;
    const fit    = Math.min(availW / natW, availH / natH);
    const imgW   = natW * fit * (state.scale / 100);
    const imgH   = natH * fit * (state.scale / 100);

    const amap: Record<string, [number, number]> = {
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
    const [cx, cy] = amap[state.align] ?? [W/2, H/2];
    const fcx = cx + state.offsetX, fcy = cy + state.offsetY;
    const fd  = getFrameDims(state.frame, imgW, imgH);

    // Shadow
    if (state.shadowOpacity > 0 && state.shadowBlur > 0) {
      ctx.save();
      ctx.globalAlpha   = state.opacity / 100;
      ctx.translate(fcx, fcy); applyTransform(ctx, state);
      ctx.shadowColor   = hexToRgba(state.shadowColor, state.shadowOpacity / 100);
      ctx.shadowBlur    = state.shadowBlur;
      ctx.shadowOffsetX = state.shadowX;
      ctx.shadowOffsetY = state.shadowY;
      ctx.fillStyle     = '#000';
      rrPath(ctx, -fd.w/2, -fd.h/2, fd.w, fd.h, state.radius);
      ctx.fill(); ctx.restore();
    }

    // Image
    ctx.save();
    ctx.globalAlpha = state.opacity / 100;
    ctx.translate(fcx, fcy); applyTransform(ctx, state);
    drawFramedImage(ctx, state.img, imgW, imgH, state.frame, state.radius, state.stylePreset, state.colorFilter, state.filterIntensity, state.frameUrl, state.frameTitle);
    ctx.restore();

    // Caption
    if (state.caption.trim()) {
      ctx.save();
      ctx.font          = `600 ${state.captionSize}px DM Sans,sans-serif`;
      ctx.fillStyle     = state.captionColor;
      ctx.textAlign     = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor   = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
      ctx.fillText(state.caption, W/2, state.captionPos === 'top' ? pad/2+state.captionSize/2 : H-pad/2-state.captionSize/2);
      ctx.restore();
    }
  }

  // Code block
  if (state.codeBlock) drawCodeBlock(ctx, state.codeBlock, W, H);

  // Tweet card
  if (state.tweetCard) drawTweetCard(ctx, state.tweetCard, W, H);

  // Draw shapes
  state.shapes.forEach(s => drawShape(ctx, s));
}

// ── Draw shapes ────────────────────────────────────────────────────
export function drawShape(ctx: CanvasRenderingContext2D, shape: DrawShape) {
  if (!shape.points.length) return;
  ctx.save();
  ctx.strokeStyle = shape.color; ctx.fillStyle = shape.color;
  ctx.lineWidth   = shape.strokeWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const p = shape.points, p0 = p[0], pL = p[p.length-1];
  if (shape.tool === 'line')   { ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(pL.x,pL.y); ctx.stroke(); }
  else if (shape.tool === 'arrow')  { ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(pL.x,pL.y); ctx.stroke(); drawArrow(ctx,p0,pL,shape.strokeWidth,shape.color); }
  else if (shape.tool === 'curve')  { ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); for(let i=1;i<p.length-1;i++){const mx=(p[i].x+p[i+1].x)/2,my=(p[i].y+p[i+1].y)/2;ctx.quadraticCurveTo(p[i].x,p[i].y,mx,my);} ctx.lineTo(pL.x,pL.y); ctx.stroke(); }
  else if (shape.tool === 'rect')   { const x=Math.min(p0.x,pL.x),y=Math.min(p0.y,pL.y),w=Math.abs(pL.x-p0.x),h=Math.abs(pL.y-p0.y); ctx.beginPath(); ctx.roundRect(x,y,w,h,4); ctx.stroke(); }
  else if (shape.tool === 'circle') { const cx=(p0.x+pL.x)/2,cy=(p0.y+pL.y)/2,rx=Math.abs(pL.x-p0.x)/2,ry=Math.abs(pL.y-p0.y)/2; ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.stroke(); }
  else if (shape.tool === 'blur')   { if(p.length>=2){const x=Math.min(p0.x,pL.x),y=Math.min(p0.y,pL.y),w=Math.abs(pL.x-p0.x),h=Math.abs(pL.y-p0.y);if(w>4&&h>4){ctx.filter=`blur(${shape.strokeWidth*2}px)`;ctx.drawImage(ctx.canvas,x,y,w,h,x,y,w,h);ctx.filter='none';}} }
  else if (shape.tool === 'text' && shape.text) { ctx.font=`600 ${shape.fontSize||24}px DM Sans,sans-serif`; ctx.textBaseline='top'; ctx.fillText(shape.text,p0.x,p0.y); }
  ctx.restore();
}

function drawArrow(ctx:CanvasRenderingContext2D,from:{x:number;y:number},to:{x:number;y:number},sw:number,color:string){
  const angle=Math.atan2(to.y-from.y,to.x-from.x),size=Math.max(14,sw*5);
  ctx.save();ctx.fillStyle=color;ctx.beginPath();ctx.translate(to.x,to.y);ctx.rotate(angle);
  ctx.moveTo(0,0);ctx.lineTo(-size,-size/2.5);ctx.lineTo(-size,size/2.5);ctx.closePath();ctx.fill();ctx.restore();
}

// ── Color filter ──────────────────────────────────────────────────
function applyColorFilter(ctx:CanvasRenderingContext2D,filter:ColorFilterType,intensity:number){
  if(filter==='none'||intensity===0)return;
  const a=intensity/100;
  const map:Record<string,string>={grayscale:`grayscale(${a})`,sepia:`sepia(${a})`,invert:`invert(${a})`,warm:`sepia(${a*0.4}) saturate(${1+a*0.5}) hue-rotate(-10deg)`,cool:`saturate(${1-a*0.2}) hue-rotate(${a*20}deg)`,vivid:`saturate(${1+a*1.5}) contrast(${1+a*0.2})`,fade:`brightness(${1+a*0.15}) contrast(${1-a*0.25}) saturate(${1-a*0.4})`,noir:`grayscale(${a}) contrast(${1+a*0.5})`};
  ctx.filter=map[filter]||'none';
}

// ── Frame drawing ─────────────────────────────────────────────────
function drawFramedImage(ctx:CanvasRenderingContext2D,img:HTMLImageElement,imgW:number,imgH:number,frame:FrameType,radius:number,style:string,colorFilter:ColorFilterType,filterIntensity:number,frameUrl:string,frameTitle:string){
  const hw=imgW/2,hh=imgH/2;
  const drawImg=(x:number,y:number,w:number,h:number)=>{applyColorFilter(ctx,colorFilter,filterIntensity);ctx.drawImage(img,x,y,w,h);ctx.filter='none';};

  if(frame==='mac'||frame==='mac-light'){
    const barH=40,dark=frame==='mac',tw=imgW,th=imgH+barH;
    ctx.fillStyle=dark?'#1e1e28':'#e8e8ee';rrPath(ctx,-tw/2,-th/2,tw,th,10);ctx.fill();
    ctx.fillStyle=dark?'#2a2a38':'#d0d0d8';rrPath(ctx,-tw/2,-th/2,tw,barH,{tl:10,tr:10,bl:0,br:0});ctx.fill();
    ['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{ctx.beginPath();ctx.arc(-tw/2+18+i*20,-th/2+barH/2,5.5,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();});
    if(frameUrl){const pw=Math.min(tw*0.5,280),ph=22;ctx.fillStyle=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)';rrPath(ctx,-pw/2,-th/2+(barH-ph)/2,pw,ph,11);ctx.fill();ctx.font='400 11px DM Mono,monospace';ctx.fillStyle=dark?'rgba(255,255,255,0.45)':'rgba(0,0,0,0.45)';ctx.textAlign='center';ctx.textBaseline='middle';const u=frameUrl.length>38?frameUrl.slice(0,38)+'…':frameUrl;ctx.fillText(u,0,-th/2+barH/2);}
    else{ctx.font='500 12px DM Sans,sans-serif';ctx.fillStyle=dark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(frameTitle||'screenshot',0,-th/2+barH/2);}
    ctx.save();rrPath(ctx,-tw/2,-th/2+barH,tw,imgH,{tl:0,tr:0,bl:10,br:10});ctx.clip();drawImg(-hw,-hh+barH/2,imgW,imgH);ctx.restore();

  }else if(frame==='chrome'){
    const barH=52,tw=imgW,th=imgH+barH;
    ctx.fillStyle='#292929';rrPath(ctx,-tw/2,-th/2,tw,th,10);ctx.fill();
    ctx.fillStyle='#1e1e1e';rrPath(ctx,-tw/2,-th/2,tw,barH,{tl:10,tr:10,bl:0,br:0});ctx.fill();
    ['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{ctx.beginPath();ctx.arc(-tw/2+18+i*18,-th/2+barH/2,5,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();});
    const ubW=tw*0.55,ubH=26;ctx.fillStyle='rgba(255,255,255,0.07)';rrPath(ctx,-ubW/2,-th/2+(barH-ubH)/2,ubW,ubH,13);ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;rrPath(ctx,-ubW/2,-th/2+(barH-ubH)/2,ubW,ubH,13);ctx.stroke();
    ctx.beginPath();ctx.arc(-ubW/2+14,-th/2+barH/2,4,0,Math.PI*2);ctx.fillStyle='#4ade80';ctx.fill();
    ctx.font='400 11px DM Mono,monospace';ctx.fillStyle='rgba(255,255,255,0.55)';ctx.textAlign='left';ctx.textBaseline='middle';
    const url=(frameUrl||'https://example.com').replace(/^https?:\/\//,'');const mc=Math.floor(ubW/7.5)-4;ctx.fillText(url.length>mc?url.slice(0,mc)+'…':url,-ubW/2+26,-th/2+barH/2);
    ctx.save();rrPath(ctx,-tw/2,-th/2+barH,tw,imgH,{tl:0,tr:0,bl:10,br:10});ctx.clip();drawImg(-hw,-hh+barH/2,imgW,imgH);ctx.restore();

  }else if(frame==='arc'){
    const barH=48,tw=imgW,th=imgH+barH,arcR=14;
    ctx.fillStyle='#1c1c28';rrPath(ctx,-tw/2,-th/2,tw,th,arcR);ctx.fill();
    const g=ctx.createLinearGradient(-tw/2,-th/2,tw/2,-th/2+barH);g.addColorStop(0,'#3a3060');g.addColorStop(1,'#1c1c28');ctx.fillStyle=g;
    rrPath(ctx,-tw/2,-th/2,tw,barH,{tl:arcR,tr:arcR,bl:0,br:0});ctx.fill();
    const ubW2=Math.min(tw*0.5,240),ubH2=24;ctx.fillStyle='rgba(255,255,255,0.1)';rrPath(ctx,-ubW2/2,-th/2+(barH-ubH2)/2,ubW2,ubH2,12);ctx.fill();
    ctx.beginPath();ctx.arc(-tw/2+20,-th/2+barH/2,6,0,Math.PI*2);ctx.fillStyle='#7c6af7';ctx.fill();
    ctx.font='400 11px DM Mono,monospace';ctx.fillStyle='rgba(255,255,255,0.55)';ctx.textAlign='center';ctx.textBaseline='middle';
    const arcUrl=(frameUrl||'https://example.com').replace(/^https?:\/\//,'');ctx.fillText(arcUrl.length>30?arcUrl.slice(0,30)+'…':arcUrl,0,-th/2+barH/2);
    ctx.save();rrPath(ctx,-tw/2,-th/2+barH,tw,imgH,{tl:0,tr:0,bl:arcR,br:arcR});ctx.clip();drawImg(-hw,-hh+barH/2,imgW,imgH);ctx.restore();

  }else if(frame==='phone'){
    const bw=14,bh=28,bR=38,tw=imgW+bw*2,th=imgH+bh*2;
    ctx.fillStyle='#111116';rrPath(ctx,-tw/2,-th/2,tw,th,bR);ctx.fill();
    ctx.strokeStyle='#2a2a3a';ctx.lineWidth=1;rrPath(ctx,-tw/2,-th/2,tw,th,bR);ctx.stroke();
    ctx.fillStyle='#111116';rrPath(ctx,-36,-th/2+12,72,20,10);ctx.fill();
    ctx.save();rrPath(ctx,-hw,-hh,imgW,imgH,radius);ctx.clip();drawImg(-hw,-hh,imgW,imgH);ctx.restore();

  }else if(frame==='border'){
    ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;rrPath(ctx,-hw-6,-hh-6,imgW+12,imgH+12,radius+6);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;rrPath(ctx,-hw-14,-hh-14,imgW+28,imgH+28,radius+14);ctx.stroke();
    ctx.save();rrPath(ctx,-hw,-hh,imgW,imgH,radius);ctx.clip();drawImg(-hw,-hh,imgW,imgH);ctx.restore();

  }else if(frame==='polaroid'||frame==='polaroid-color'){
    drawPolaroidFrame(ctx,img,imgW,imgH,radius,frame,colorFilter,filterIntensity);
  }else{
    ctx.save();rrPath(ctx,-hw,-hh,imgW,imgH,radius);ctx.clip();drawImg(-hw,-hh,imgW,imgH);ctx.restore();
    applyStyleOverlay(ctx,-hw,-hh,imgW,imgH,radius,style);
  }
}

function applyStyleOverlay(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,style:string){
  if(style==='glass-light'||style==='glass-dark'){ctx.save();rrPath(ctx,x,y,w,h,r);ctx.fillStyle=style==='glass-light'?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.15)';ctx.fill();ctx.strokeStyle=style==='glass-light'?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.stroke();ctx.restore();}
  else if(style==='outline'){ctx.save();rrPath(ctx,x-2,y-2,w+4,h+4,r+2);ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=2;ctx.stroke();ctx.restore();}
  else if(style==='border'||style==='border-dark'){ctx.save();rrPath(ctx,x-3,y-3,w+6,h+6,r+3);ctx.strokeStyle=style==='border'?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.6)';ctx.lineWidth=3;ctx.stroke();ctx.restore();}
}

// ── Background ─────────────────────────────────────────────────────
export function drawBackground(ctx:CanvasRenderingContext2D,W:number,H:number,state:AppState){
  const bg=BACKGROUNDS.find(b=>b.id===state.bg);
  if(!bg){ctx.fillStyle='#0d0d14';ctx.fillRect(0,0,W,H);return;}
  if(bg.type==='image'&&bg.imgUrl){
    // Draw image background - use cached image
    const key='__bgimg_'+bg.id;
    const cached=(window as any)[key] as HTMLImageElement|undefined;
    if(cached&&cached.complete){
      ctx.drawImage(cached,0,0,W,H);
    } else {
      ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);
      if(!cached){const img=new Image();(window as any)[key]=img;img.onload=()=>{ctx.drawImage(img,0,0,W,H);};img.src=bg.imgUrl as string;}
    }
    return;
  }
  if(bg.type==='gradient'&&bg.stops){const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,bg.stops[0]);g.addColorStop(1,bg.stops[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  else if(bg.type==='solid'&&bg.color){ctx.fillStyle=bg.color;ctx.fillRect(0,0,W,H);}
  else if(bg.type==='mesh'&&bg.colors){ctx.fillStyle=bg.colors[2]??'#0d0d1a';ctx.fillRect(0,0,W,H);[[0.2,0.2,bg.colors[0]],[0.8,0.8,bg.colors[1]],[0.5,0.15,bg.colors[0]]].forEach(([px,py,col])=>{const g=ctx.createRadialGradient(W*(px as number),H*(py as number),0,W*(px as number),H*(py as number),W*0.65);g.addColorStop(0,(col as string)+'cc');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);});}
  else if(bg.type==='noise'&&bg.base){ctx.fillStyle=bg.base;ctx.fillRect(0,0,W,H);const tmp=document.createElement('canvas');tmp.width=256;tmp.height=256;const tc=tmp.getContext('2d')!;const gd=tc.createImageData(256,256);for(let i=0;i<gd.data.length;i+=4){const v=Math.random()*35;gd.data[i]=v;gd.data[i+1]=v;gd.data[i+2]=v;gd.data[i+3]=25;}tc.putImageData(gd,0,0);ctx.globalAlpha=0.5;for(let x=0;x<W;x+=256)for(let y=0;y<H;y+=256)ctx.drawImage(tmp,x,y);ctx.globalAlpha=1;}
  else if(bg.type==='pattern'){drawPattern(ctx,W,H,bg.pattern??'dots',bg.base??'#0f0f1a',bg.accent??'rgba(255,255,255,0.12)');}
}

function drawPattern(ctx:CanvasRenderingContext2D,W:number,H:number,type:string,base:string,accent:string){
  ctx.fillStyle=base;ctx.fillRect(0,0,W,H);ctx.save();ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=1;
  if(type==='dots'){const sp=32;for(let x=sp/2;x<W;x+=sp)for(let y=sp/2;y<H;y+=sp){ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fill();}}
  else if(type==='grid'){const sp=40;for(let x=0;x<=W;x+=sp){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<=H;y+=sp){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}}
  else if(type==='cross'){const sp=44,al=7;for(let x=sp/2;x<W;x+=sp)for(let y=sp/2;y<H;y+=sp){ctx.beginPath();ctx.moveTo(x-al,y);ctx.lineTo(x+al,y);ctx.moveTo(x,y-al);ctx.lineTo(x,y+al);ctx.stroke();}}
  else if(type==='diag'){const sp=32;for(let i=-H;i<W+H;i+=sp){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}}
  else if(type==='wave'){const amp=14,fr=0.035,sp=36;for(let y=sp;y<H;y+=sp){ctx.beginPath();for(let x=0;x<=W;x+=3){const wy=y+Math.sin(x*fr)*amp;x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);}ctx.stroke();}}
  else if(type==='hex'){const sz=24,ww=sz*2,hh=Math.sqrt(3)*sz;for(let row=-1;row<H/hh+2;row++)for(let col=-1;col<W/ww+2;col++){const cx=col*ww*0.75+(row%2===0?0:ww*0.375),cy=row*hh;ctx.beginPath();for(let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6;i===0?ctx.moveTo(cx+sz*Math.cos(a),cy+sz*Math.sin(a)):ctx.lineTo(cx+sz*Math.cos(a),cy+sz*Math.sin(a));}ctx.closePath();ctx.stroke();}}
  ctx.restore();
}

// ── Code block ────────────────────────────────────────────────────
export function drawCodeBlock(ctx:CanvasRenderingContext2D,block:CodeBlock,W:number,H:number){
  const theme=THEMES[block.theme];
  const fontSize=Math.round(W*0.018*block.scale);
  const lineH=Math.round(fontSize*1.65);
  const padX=Math.round(fontSize*1.6);
  const padY=Math.round(fontSize*1.4);
  const lineNumW=block.showLineNumbers?Math.round(fontSize*2.8):0;
  const lines=block.code.split('\n');
  const maxLen=Math.max(...lines.map(l=>l.length));
  const blockW=Math.min(W*0.9,Math.max(W*0.4,maxLen*fontSize*0.605+padX*2+lineNumW+24));
  const headerH=Math.round(fontSize*2.8);
  const blockH=headerH+lines.length*lineH+padY*2;
  const bx=block.x*W-blockW/2;
  const by=block.y*H-blockH/2;
  const r=Math.round(fontSize*0.7);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.45)';ctx.shadowBlur=Math.round(fontSize*2.5);ctx.shadowOffsetY=Math.round(fontSize*0.8);
  ctx.fillStyle=theme.bg;rrPath(ctx,bx,by,blockW,blockH,r);ctx.fill();
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.strokeStyle=theme.border;ctx.lineWidth=1;rrPath(ctx,bx,by,blockW,blockH,r);ctx.stroke();
  ctx.fillStyle=theme.headerBg;rrPath(ctx,bx,by,blockW,headerH,{tl:r,tr:r,bl:0,br:0});ctx.fill();
  const dotY=by+headerH/2;
  [['#ff5f57',bx+18],['#febc2e',bx+38],['#28c840',bx+58]].forEach(([c,x])=>{ctx.beginPath();ctx.arc(x as number,dotY,Math.round(fontSize*0.45),0,Math.PI*2);ctx.fillStyle=c as string;ctx.fill();});
  if(block.fileName){ctx.font=`500 ${Math.round(fontSize*0.85)}px DM Mono,monospace`;ctx.fillStyle=theme.comment;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(block.fileName,bx+blockW/2,dotY);}
  ctx.save();rrPath(ctx,bx,by+headerH,blockW,blockH-headerH,{tl:0,tr:0,bl:r,br:r});ctx.clip();
  ctx.fillStyle=theme.bg;ctx.fillRect(bx,by+headerH,blockW,blockH-headerH);
  if(block.showLineNumbers){ctx.fillStyle=theme.headerBg;ctx.fillRect(bx,by+headerH,lineNumW,blockH-headerH);ctx.strokeStyle=theme.border;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(bx+lineNumW,by+headerH);ctx.lineTo(bx+lineNumW,by+blockH);ctx.stroke();}
  ctx.font=`400 ${fontSize}px DM Mono,monospace`;ctx.textBaseline='middle';
  lines.forEach((line,i)=>{
    const y=by+headerH+padY+i*lineH+lineH/2;
    if(block.showLineNumbers){ctx.textAlign='right';ctx.fillStyle=theme.lineNum;ctx.fillText(String(i+1),bx+lineNumW-10,y);}
    const tokens=tokenize(line,block.lang,theme);
    let x=bx+padX+lineNumW;ctx.textAlign='left';
    tokens.forEach(([text,color])=>{ctx.fillStyle=color;ctx.fillText(text,x,y);x+=ctx.measureText(text).width;});
  });
  ctx.restore();ctx.restore();
}

function tokenize(line:string,lang:CodeLang,theme:typeof THEMES.dark):[string,string][]{
  const tokens:[string,string][]=[];
  if(!line.trim()){tokens.push([line||' ',theme.text]);return tokens;}
  const commentMap:Partial<Record<CodeLang,string>>={javascript:'//',typescript:'//',python:'#',bash:'#',rust:'//',go:'//',java:'//',cpp:'//'};
  const cc=commentMap[lang];
  if(cc&&line.trimStart().startsWith(cc)){tokens.push([line,theme.comment]);return tokens;}
  if(lang==='html'&&line.trimStart().startsWith('<!--')){tokens.push([line,theme.comment]);return tokens;}
  if(lang==='css'&&line.trimStart().startsWith('/*')){tokens.push([line,theme.comment]);return tokens;}
  if(lang==='json'){
    let rest=line;
    while(rest.length>0){
      let m;
      if((m=rest.match(/^(\s+)/))){tokens.push([m[0],theme.text]);rest=rest.slice(m[0].length);}
      else if((m=rest.match(/^"([^"]*)"(\s*:)/))){tokens.push([`"${m[1]}"`,theme.fn]);tokens.push([m[2],theme.text]);rest=rest.slice(m[0].length);}
      else if((m=rest.match(/^"[^"]*"/))){tokens.push([m[0],theme.string]);rest=rest.slice(m[0].length);}
      else if((m=rest.match(/^\b(true|false|null)\b/))){tokens.push([m[0],theme.keyword]);rest=rest.slice(m[0].length);}
      else if((m=rest.match(/^\d+\.?\d*/))){tokens.push([m[0],theme.number]);rest=rest.slice(m[0].length);}
      else{tokens.push([rest[0],theme.text]);rest=rest.slice(1);}
    }
    return tokens;
  }
  const kws=new Set(KEYWORDS[lang]||[]);
  let i=0;
  while(i<line.length){
    if(line[i]==='"'||line[i]==="'"||line[i]==='`'){const q=line[i];let j=i+1;while(j<line.length&&line[j]!==q){if(line[j]==='\\')j++;j++;}tokens.push([line.slice(i,j+1),theme.string]);i=j+1;continue;}
    if(/\d/.test(line[i])&&(i===0||!/\w/.test(line[i-1]))){let j=i;while(j<line.length&&/[\d.]/.test(line[j]))j++;tokens.push([line.slice(i,j),theme.number]);i=j;continue;}
    if(/[a-zA-Z_$]/.test(line[i])){let j=i;while(j<line.length&&/\w/.test(line[j]))j++;const word=line.slice(i,j);const isFunc=line[j]==='(';const color=kws.has(word)?theme.keyword:isFunc?theme.fn:theme.text;tokens.push([word,color]);i=j;continue;}
    if(/[=<>!&|+\-*/%^~]/.test(line[i])){tokens.push([line[i],theme.keyword]);i++;continue;}
    tokens.push([line[i],theme.text]);i++;
  }
  return tokens;
}

// ── Helpers ───────────────────────────────────────────────────────
function applyTransform(ctx:CanvasRenderingContext2D,state:AppState){
  if(state.rotZ)ctx.rotate(state.rotZ*Math.PI/180);
  if(state.rotX===0&&state.rotY===0)return;
  const skX=state.rotY*0.012,skY=state.rotX*0.012;
  ctx.transform(1,skY,skX,1-Math.abs(skX)*0.15,0,0);
}
function drawPolaroidFrame(ctx:CanvasRenderingContext2D,img:HTMLImageElement,imgW:number,imgH:number,radius:number,style:string,colorFilter:ColorFilterType,filterIntensity:number){
  const isColor=style==='polaroid-color';
  const borderT=Math.round(imgW*0.06);  // top/side border
  const borderB=Math.round(imgW*0.22);  // thick bottom border (polaroid signature)
  const totalW=imgW+borderT*2;
  const totalH=imgH+borderT+borderB;
  const r=4;
  // Card background
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.30)';ctx.shadowBlur=Math.round(imgW*0.06);ctx.shadowOffsetY=Math.round(imgW*0.03);
  ctx.fillStyle='#fafaf8';
  rrPath(ctx,-totalW/2,-totalH/2,totalW,totalH,r);ctx.fill();
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  // Slight border
  ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=1;
  rrPath(ctx,-totalW/2,-totalH/2,totalW,totalH,r);ctx.stroke();
  // Photo area clip
  ctx.save();
  rrPath(ctx,-totalW/2+borderT,-totalH/2+borderT,imgW,imgH,2);ctx.clip();
  if(isColor){
    // Warm color tone
    const tmp=document.createElement('canvas');tmp.width=imgW;tmp.height=imgH;
    const tc=tmp.getContext('2d')!;tc.filter='saturate(1.1) brightness(1.05) contrast(0.95)';
    tc.drawImage(img,0,0,imgW,imgH);
    ctx.drawImage(tmp,-totalW/2+borderT,-totalH/2+borderT,imgW,imgH);
  } else {
    // Classic polaroid: slightly faded, warm sepia tint
    ctx.filter='sepia(0.15) brightness(0.98) contrast(0.9)';
    ctx.drawImage(img,-totalW/2+borderT,-totalH/2+borderT,imgW,imgH);
    ctx.filter='none';
  }
  ctx.restore();
  ctx.restore();
}

function getFrameDims(frame:FrameType,imgW:number,imgH:number){
  if(frame==='mac'||frame==='mac-light')return{w:imgW,h:imgH+40};
  if(frame==='chrome')return{w:imgW,h:imgH+52};
  if(frame==='arc')return{w:imgW,h:imgH+48};
  if(frame==='phone')return{w:imgW+28,h:imgH+56};
  if(frame==='polaroid'||frame==='polaroid-color'){const bt=Math.round(imgW*0.06),bb=Math.round(imgW*0.22);return{w:imgW+bt*2,h:imgH+bt+bb};}
  return{w:imgW,h:imgH};
}
function hexToRgba(hex:string,alpha:number):string{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${r},${g},${b},${alpha})`;}
export function rrPath(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number|{tl:number;tr:number;bl:number;br:number}){const tl=typeof r==='number'?r:r.tl,tr=typeof r==='number'?r:r.tr,br=typeof r==='number'?r:r.br,bl=typeof r==='number'?r:r.bl;ctx.beginPath();ctx.moveTo(x+tl,y);ctx.lineTo(x+w-tr,y);ctx.quadraticCurveTo(x+w,y,x+w,y+tr);ctx.lineTo(x+w,y+h-br);ctx.quadraticCurveTo(x+w,y+h,x+w-br,y+h);ctx.lineTo(x+bl,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-bl);ctx.lineTo(x,y+tl);ctx.quadraticCurveTo(x,y,x+tl,y);ctx.closePath();}
export function screenToCanvas(sx:number,sy:number,el:HTMLCanvasElement):{x:number;y:number}{const r=el.getBoundingClientRect(),scX=el.width/r.width,scY=el.height/r.height;return{x:(sx-r.left)*scX,y:(sy-r.top)*scY};}
