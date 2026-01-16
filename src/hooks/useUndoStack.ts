'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UndoAction {
  id: string;
  message: string;
  undo: () => void;
  timestamp: number;
}

const UNDO_EXPIRY_MS = 10000; // 10 seconds

export function useUndoStack() {
  const [actions, setActions] = useState<UndoAction[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up expired actions
  useEffect(() => {
    if (actions.length === 0) return;

    const checkExpiry = () => {
      const now = Date.now();
      setActions((prev) => prev.filter((action) => now - action.timestamp < UNDO_EXPIRY_MS));
    };

    timerRef.current = setInterval(checkExpiry, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [actions.length]);

  const push = useCallback((message: string, undoFn: () => void) => {
    const action: UndoAction = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      undo: undoFn,
      timestamp: Date.now(),
    };

    setActions((prev) => [...prev, action]);
  }, []);

  const pop = useCallback(() => {
    if (actions.length === 0) return null;

    const lastAction = actions[actions.length - 1];
    setActions((prev) => prev.slice(0, -1));
    return lastAction;
  }, [actions]);

  const canUndo = actions.length > 0;
  const lastAction = actions.length > 0 ? actions[actions.length - 1] : null;

  return {
    push,
    pop,
    canUndo,
    lastAction,
  };
}
