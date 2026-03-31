import { useState, useRef, useCallback } from "react";

/**
 * useGraphTouch — pinch-zoom + drag for graph SVG containers.
 * Returns { scale, position, touchHandlers, resetTransform }
 * Apply touchHandlers to the container div, wrap SVG in a div with the transform.
 */
export function useGraphTouch() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const lastTouchRef = useRef(null);   // single-finger drag
  const lastDistRef = useRef(null);    // two-finger pinch distance

  function clampScale(s) { return Math.min(2.5, Math.max(0.5, s)); }
  function clampPos(p, s) {
    // allow panning up to half the container size beyond edges
    const limit = 200 * s;
    return {
      x: Math.min(limit, Math.max(-limit, p.x)),
      y: Math.min(limit, Math.max(-limit, p.y)),
    };
  }

  function dist(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastDistRef.current = null;
    } else if (e.touches.length === 2) {
      lastDistRef.current = dist(e.touches[0], e.touches[1]);
      lastTouchRef.current = null;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPosition(prev => clampPos({ x: prev.x + dx, y: prev.y + dy }, scale));
    } else if (e.touches.length === 2 && lastDistRef.current !== null) {
      const newDist = dist(e.touches[0], e.touches[1]);
      const delta = newDist / lastDistRef.current;
      lastDistRef.current = newDist;
      setScale(prev => clampScale(prev * delta));
    }
  }, [scale]);

  const onTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
    lastDistRef.current = null;
  }, []);

  function resetTransform() {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }

  return {
    scale,
    position,
    resetTransform,
    touchHandlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
