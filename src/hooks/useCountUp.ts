import { useEffect, useRef, useState } from 'react';

interface Options {
  duration?: number;
  decimals?: number;
}

export function useCountUp(target: number, { duration = 900, decimals = 2 }: Options = {}) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    let raf = 0;

    function tick(now: number) {
      if (startRef.current == null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(t);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return Number(value.toFixed(decimals));
}
