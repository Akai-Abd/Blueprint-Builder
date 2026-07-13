'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import BuilderLayout from '@/components/layout/BuilderLayout';
import { useBlueprintStore } from '@/stores/blueprintStore';
import {
  getBlueprint,
  setCurrentBlueprintId,
  debouncedSave,
} from '@/lib/autoSave';
import { createEmptyBlueprint } from '@/types/blueprint';

function BuilderContent() {
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get('id');
  const loadBlueprint = useBlueprintStore((s) => s.loadBlueprint);
  const initialized = useRef(false);

  // Load blueprint on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (blueprintId) {
      const saved = getBlueprint(blueprintId);
      if (saved) {
        loadBlueprint(saved.blueprint);
        setCurrentBlueprintId(blueprintId);
        return;
      }
    }

    // No ID or not found — create a fresh blueprint and set as current
    const fresh = createEmptyBlueprint();
    loadBlueprint(fresh);
    setCurrentBlueprintId(fresh.id);
  }, [blueprintId, loadBlueprint]);

  // Auto-save subscription
  useEffect(() => {
    const unsub = useBlueprintStore.subscribe((state) => {
      debouncedSave(state.blueprint);
    });
    return unsub;
  }, []);

  return <BuilderLayout />;
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-tertiary)' }}>
          Loading builder…
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
