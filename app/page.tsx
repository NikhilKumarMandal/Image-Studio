'use client';
import { useCallback, useEffect } from 'react';
import { AppState, DEFAULT_STATE } from './types';
import { useHistory } from './useHistory';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import CanvasArea from './components/CanvasArea';
import RightPanel from './components/RightPanel';

export default function Home() {
  const { state, setState, undo, redo, canUndo, canRedo } = useHistory(DEFAULT_STATE);

  const onChange = useCallback((patch: Partial<AppState>) =>
    setState(prev => ({ ...prev, ...patch })), [setState]);
  const onImage  = useCallback((img: HTMLImageElement, name: string) =>
    setState(prev => ({ ...prev, img, imageName: name })), [setState]);
  const onReset  = useCallback(() => setState({ ...DEFAULT_STATE }, true), [setState]);
  const onExport = useCallback(() => {
    import('./renderer').then(({ renderCanvas }) => {
      const canvas = document.createElement('canvas');
      canvas.width  = state.canvasW;
      canvas.height = state.canvasH;
      renderCanvas(canvas, state);
      const a = document.createElement('a');
      a.download = `screenshot-${Date.now()}.png`;
      a.href     = canvas.toDataURL('image/png');
      a.click();
    });
  }, [state]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && e.key === 's') { e.preventDefault(); onExport(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [undo, redo, onExport]);

  return (
    <div className="app-shell">
      <TopBar
        state={state} canUndo={canUndo} canRedo={canRedo}
        onReset={onReset} onExport={onExport} onUndo={undo} onRedo={redo}
      />
      <div className="editor-layout">
        <div className="panel-left">
          <LeftPanel state={state} onChange={onChange} onImage={onImage} />
        </div>
        <div className="canvas-center">
          <CanvasArea state={state} onChange={onChange} />
        </div>
        <div className="panel-right">
          <RightPanel state={state} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
