import { useRef, useState, useCallback } from 'react';
import { AppState } from './types';

const MAX = 50;

function snapshot(s: AppState): AppState {
  return { ...s, shapes: s.shapes.map(sh => ({ ...sh, points: [...sh.points] })) };
}

export function useHistory(initial: AppState) {
  const [state, setRaw] = useState<AppState>(initial);
  const past   = useRef<AppState[]>([]);
  const future = useRef<AppState[]>([]);

  const setState = useCallback((updater: AppState | ((p: AppState) => AppState), push = true) => {
    setRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (push) { past.current = [...past.current.slice(-MAX+1), snapshot(prev)]; future.current = []; }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    setRaw(prev => {
      const p = past.current[past.current.length-1];
      past.current   = past.current.slice(0,-1);
      future.current = [snapshot(prev), ...future.current];
      return p;
    });
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    setRaw(prev => {
      const n = future.current[0];
      future.current = future.current.slice(1);
      past.current   = [...past.current, snapshot(prev)];
      return n;
    });
  }, []);

  return { state, setState, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}
