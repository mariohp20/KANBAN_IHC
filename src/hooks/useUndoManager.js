import { useCallback, useRef } from 'react';

export const useUndoManager = () => {
  const historyRef = useRef([]);

  const pushSnapshot = useCallback((tasks) => {
    historyRef.current.push(JSON.parse(JSON.stringify(tasks)));
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
  }, []);

  const popSnapshot = useCallback(() => {
    if (historyRef.current.length === 0) return null;
    return historyRef.current.pop();
  }, []);

  const canUndo = useCallback(() => historyRef.current.length > 0, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
  }, []);

  return { pushSnapshot, popSnapshot, canUndo, clearHistory };
};
