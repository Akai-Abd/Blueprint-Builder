import { useState, useEffect } from 'react';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type { Blueprint } from '@/types/blueprint';

/**
 * A custom hook that subscribes to the blueprint store outside the React render cycle,
 * and only triggers a re-render after the blueprint stops changing for `delayMs`.
 * This prevents massive re-renders on every keystroke for expensive components.
 */
export function useDebouncedBlueprint(delayMs = 300): Blueprint {
  // Initialize with the current state to avoid hydration mismatches
  const [debounced, setDebounced] = useState(() => useBlueprintStore.getState().blueprint);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Subscribe directly to the store
    const unsubscribe = useBlueprintStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setDebounced(state.blueprint);
      }, delayMs);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [delayMs]);

  return debounced;
}
