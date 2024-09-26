import { useCallback, useEffect } from "react";

export const useDebouncedEffect = (func, delay, deps) => {
  const callback = useCallback(func, deps);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
}