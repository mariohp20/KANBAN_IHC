import { useState, useEffect, useRef } from 'react';

export const useIdleTracker = (logEvent) => {
  const [idleTime, setIdleTime] = useState(0);
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef(null);
  const activeTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const IDLE_THRESHOLD = 30000; // 30 seconds

    const resetIdleTimer = () => {
      if (isIdle) {
        setIsIdle(false);
        logEvent('user_active', { idleTime });
      }
      lastActivityRef.current = Date.now();
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
        logEvent('user_idle', { timestamp: new Date().toISOString() });
      }, IDLE_THRESHOLD);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer);
    });

    // Idle time counter
    const idleInterval = setInterval(() => {
      if (isIdle) {
        setIdleTime(prev => prev + 1);
      }
    }, 1000);

    // Active time counter
    const activeInterval = setInterval(() => {
      if (!isIdle) {
        setTotalActiveTime(prev => prev + 1);
      }
    }, 1000);

    resetIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearInterval(idleInterval);
      clearInterval(activeInterval);
    };
  }, [isIdle, idleTime, logEvent]);

  return { idleTime, totalActiveTime, isIdle };
};