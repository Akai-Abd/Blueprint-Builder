'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import LeftNavigation from './LeftNavigation';
import MainPanel from './MainPanel';
import RightSummaryPanel from './RightSummaryPanel';
import SearchModal from '@/components/SearchModal';
import ReviewScreen from '@/components/ReviewScreen';
import GenerationScreen from '@/components/GenerationScreen';
import AIAssistantPanel from '@/components/AIAssistantPanel';
import ExportModal from '@/components/ExportModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setAutoSaveCallbacks } from '@/lib/autoSave';
import type { GeneratedDocument } from '@/lib/generation';

type Screen = 'builder' | 'review' | 'generation';

export type SaveStatus = 'idle' | 'saving' | 'saved';

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function BuilderLayout() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('builder');
  const [aiPanelOpen, setAIPanelOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);

  // Responsive state
  const [navOpen, setNavOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1200px)');

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleAIPanel = useCallback(() => setAIPanelOpen((prev) => !prev), []);
  const closeAIPanel = useCallback(() => setAIPanelOpen(false), []);

  const toggleNav = useCallback(() => setNavOpen((prev) => !prev), []);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const toggleSummary = useCallback(() => setSummaryOpen((prev) => !prev), []);
  const closeSummary = useCallback(() => setSummaryOpen(false), []);

  // Close drawers on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (navOpen) setNavOpen(false);
        if (summaryOpen) setSummaryOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [navOpen, summaryOpen]);

  // Auto-close drawers when breakpoint changes to desktop
  useEffect(() => {
    if (!isMobile && !isTablet) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- closing drawers on viewport transition
      setNavOpen(false);
      setSummaryOpen(false);
    }
  }, [isMobile, isTablet]);

  // Set up auto-save callbacks for save indicator
  useEffect(() => {
    let savedTimer: ReturnType<typeof setTimeout> | null = null;
    setAutoSaveCallbacks(
      () => {
        if (savedTimer) clearTimeout(savedTimer);
        setSaveStatus('saving');
      },
      () => {
        setSaveStatus('saved');
        savedTimer = setTimeout(() => setSaveStatus('idle'), 2000);
      }
    );
    return () => {
      if (savedTimer) clearTimeout(savedTimer);
    };
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd+K → Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    router.push('/');
  }, [router]);

  // Close nav when section changes on mobile
  const handleSectionChange = useCallback(() => {
    if (isMobile) setNavOpen(false);
  }, [isMobile]);

  // Review & Generation screens take over the main area
  if (screen === 'review') {
    return (
      <ErrorBoundary fallbackTitle="Review failed to load">
        <div className="builder-layout">
          {(isMobile || isTablet) && navOpen && (
            <div className="nav-overlay nav-overlay--visible" onClick={closeNav} aria-hidden="true" />
          )}
          <LeftNavigation
            onBackToDashboard={handleBackToDashboard}
            isOpen={navOpen}
            onClose={closeNav}
            onSectionChange={handleSectionChange}
          />
          <main className="builder-main" role="main" aria-label="Review">
            <ReviewScreen
              onBack={() => setScreen('builder')}
              onGenerate={() => setScreen('generation')}
            />
          </main>
        </div>
      </ErrorBoundary>
    );
  }

  if (screen === 'generation') {
    return (
      <ErrorBoundary fallbackTitle="Generation failed to load">
        <div className="builder-layout">
          {(isMobile || isTablet) && navOpen && (
            <div className="nav-overlay nav-overlay--visible" onClick={closeNav} aria-hidden="true" />
          )}
          <LeftNavigation
            onBackToDashboard={handleBackToDashboard}
            isOpen={navOpen}
            onClose={closeNav}
            onSectionChange={handleSectionChange}
          />
          <main className="builder-main" role="main" aria-label="Generation" style={{ overflow: 'hidden' }}>
            <GenerationScreen
              onBack={() => setScreen('review')}
              onExport={(docs) => {
                setGeneratedDocs(docs);
                setExportOpen(true);
              }}
            />
          </main>
          <ExportModal
            isOpen={exportOpen}
            onClose={() => setExportOpen(false)}
            generatedDocs={generatedDocs}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="builder-layout">
        {/* Mobile nav overlay */}
        {(isMobile || isTablet) && navOpen && (
          <div className="nav-overlay nav-overlay--visible" onClick={closeNav} aria-hidden="true" />
        )}
        {/* Tablet/mobile summary overlay */}
        {isTablet && summaryOpen && (
          <div className="nav-overlay nav-overlay--visible" onClick={closeSummary} aria-hidden="true" style={{ zIndex: 99 }} />
        )}

        <LeftNavigation
          onBackToDashboard={handleBackToDashboard}
          isOpen={navOpen}
          onClose={closeNav}
          onSectionChange={handleSectionChange}
        />
        <MainPanel
          onOpenSearch={openSearch}
          onReview={() => setScreen('review')}
          onToggleAI={toggleAIPanel}
          saveStatus={saveStatus}
          onExport={() => setExportOpen(true)}
          onToggleNav={toggleNav}
          onToggleSummary={toggleSummary}
        />
        <RightSummaryPanel isOpen={summaryOpen} onClose={closeSummary} />
        <SearchModal isOpen={searchOpen} onClose={closeSearch} />
        <AIAssistantPanel isOpen={aiPanelOpen} onClose={closeAIPanel} />
        <ExportModal
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
