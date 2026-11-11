'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BuilderLayout from '@/components/layout/BuilderLayout';
import { useBlueprintStore } from '@/stores/blueprintStore';
import {
  debouncedSave,
  flushPendingSave,
  getBlueprint,
  saveBlueprint,
  setCurrentBlueprintId,
} from '@/lib/autoSave';
import { loadFromShareLink } from '@/lib/export';
import { createEmptyBlueprint } from '@/types/blueprint';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get('id');
  const sharedParam = searchParams.get('shared');
  const loadBlueprint = useBlueprintStore((s) => s.loadBlueprint);
  const loadedKeyRef = useRef<string | null>(null);

  // Load blueprint from ?shared= or ?id= whenever route query changes
  useEffect(() => {
    const key = sharedParam
      ? `shared:${sharedParam}`
      : blueprintId
      ? `id:${blueprintId}`
      : 'new';

    if (loadedKeyRef.current === key) return;
    loadedKeyRef.current = key;

    if (sharedParam) {
      const sharedBp = loadFromShareLink(sharedParam);
      if (sharedBp) {
        saveBlueprint(sharedBp);
        setCurrentBlueprintId(sharedBp.id);
        loadBlueprint(sharedBp);
        loadedKeyRef.current = `id:${sharedBp.id}`;
        router.replace(`/builder?id=${sharedBp.id}`);
        return;
      }
    }

    if (blueprintId) {
      const saved = getBlueprint(blueprintId);
      if (saved) {
        loadBlueprint(saved.blueprint);
        setCurrentBlueprintId(blueprintId);
        return;
      }
    }

    // No valid ID or shared payload — create a fresh blueprint
    const fresh = createEmptyBlueprint();
    loadBlueprint(fresh);
    setCurrentBlueprintId(fresh.id);
  }, [blueprintId, sharedParam, loadBlueprint, router]);

  // Auto-save subscription and flush on pagehide/unmount
  useEffect(() => {
    const unsub = useBlueprintStore.subscribe((state) => {
      debouncedSave(state.blueprint);
    });
    window.addEventListener('pagehide', flushPendingSave);
    return () => {
      window.removeEventListener('pagehide', flushPendingSave);
      flushPendingSave();
      unsub();
    };
  }, []);

  return <BuilderLayout />;
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            color: 'var(--text-tertiary)',
          }}
        >
          Loading builder…
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
