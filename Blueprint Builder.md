# Blueprint Builder Module PRD

**Project:** Blueprint Builder  
**Module:** Core Platform & Builder Engine  
**Version:** 1.0.0  
**Status:** Implemented (Verified)  
**Priority:** Critical (Core Module)  
**Stack:** Next.js 16 (App Router), React 19, TypeScript, Zustand, Fuse.js, JSZip, Vercel AI SDK v7  

---

# 1. Overview

Blueprint Builder is a guided, searchable software architecture and specification builder that enables users to configure complete project blueprints visually instead of writing documentation from a blank page.

It supports multiple project types (`website`, `web-app`, `android`, `ios`, `desktop`, `api`, `browser-extension`, `ai-product`, `cli`, and `custom`) through dynamic filtering workflows, validates completeness and pairings, generates 11 implementation-ready project documents (using user-supplied LLM keys or built-in deterministic templates offline), and exports projects across JSON, Markdown, PDF, ZIP, and shareable URLs.

---

# 2. Objectives

The Blueprint Builder must:

* Help users start software projects without a blank page.
* Replace repetitive manual specification writing with structured configuration.
* Guide users through decisions tailored to their chosen project type.
* Provide context-aware stack and quality recommendations.
* Validate completeness, missing dependencies, and conflicting choices before generation.
* Generate 11 consistent, blueprint-grounded specification documents with optional BYOK AI enhancement and offline template fallback.
* Persist drafts locally in the browser and support seamless export, import, and link sharing.

---

# 3. Success Criteria

A user can:

* Open the Dashboard (`/`) directly with zero login friction to create, search, filter, duplicate, import, or delete blueprints.
* Complete the 6-section guided builder (`/builder?id=...`) with clear descriptions, advantages, limitations, tags, and doc links on every option.
* Receive real-time recommendations, validation feedback, and weighted completion progress.
* Query an AI Assistant side panel (live multi-turn AI with BYOK key or instant offline quick actions/fallback).
* Review the entire blueprint with direct jump-to-section edits and generate selected documentation.
* Export documentation and project data as JSON, Markdown, printable PDF, ZIP bundle, or shareable URL (`?shared=...`), and resume saved work automatically.

---

# 4. Primary Workflow

```text
Dashboard (/)
    ↓ Create / Resume / Import JSON / Open Share Link
Builder Workspace (/builder?id=... | ?shared=...)
    ↓
1. Project Basics
    ↓
2. Platforms
    ↓
3. Technology
    ↓
4. Features
    ↓
5. Integrations
    ↓
6. Quality
    ↓  (Anytime: Search Ctrl/Cmd+K · Smart Recommendations · Validation · AI Assistant · Auto-Save)
Review Screen
    ↓ Validation Errors Resolved
Generate Documents (AI BYOK / Server Key Opt-In / Offline Templates)
    ↓
Export & Share (JSON · Markdown · PDF · ZIP · Share Link)
```

---

# 5. Core Principles

* Configuration over manual writing
* Search before scrolling (`Ctrl/Cmd+K`)
* Progressive disclosure per section and project type
* Continuous auto-save with page-unload flush
* Transparent metadata on every option
* AI assists via BYOK + safe fallback without ever silently mutating user selections
* Documentation is generated deterministically or via AI strictly from structured blueprint data

---

# 6. Builder Architecture

Core application modules:

* **Dashboard & Routing** (`src/app/page.tsx`, `src/app/builder/page.tsx`): Blueprint CRUD, status filtering, JSON import, `?id=` session restore, and `?shared=` payload import.
* **State & Persistence** (`src/stores/blueprintStore.ts`, `src/lib/autoSave.ts`, `src/hooks/useDebouncedBlueprint.ts`): Zustand store synced to `localStorage` with 500ms debounced auto-save and `pagehide`/unmount flush.
* **Option Library** (`src/data/options/{platforms,technologies,features,integrations,quality}.ts`): Structured catalog across 5 files.
* **Question Engine** (`src/lib/question.ts`): Project-type filtering and recommended vs. secondary category/option grouping.
* **Search Engine** (`src/lib/search.ts`, `src/components/SearchModal.tsx`): Cached Fuse.js fuzzy search index with category filters, popularity defaults, recently used history, and favorites.
* **Recommendation Engine** (`src/lib/recommendation.ts`, `src/components/RecommendationBadge.tsx`): Rule-based stack compatibility, `compatibleWith` cross-pairing, and missing coverage heuristics.
* **Validation Engine** (`src/lib/validation.ts`, `src/components/ValidationPanel.tsx`): Error/warning/info checks across required fields, tech gaps, and cross-section pairings.
* **Progress Engine** (`src/lib/progress.ts`): Section-level and weighted overall completion calculation.
* **Review & Generation Engine** (`src/components/ReviewScreen.tsx`, `src/components/GenerationScreen.tsx`, `src/lib/generation.ts`): Review checklist and 11 document generators supporting concurrent AI generation + automatic offline fallback.
* **AI Provider & Assistant Layer** (`src/lib/aiModels.ts`, `src/lib/aiProvider.ts`, `src/lib/aiAssistant.ts`, `src/components/AIAssistantPanel.tsx`, `src/app/api/{chat,generate}/route.ts`): 6-provider AI SDK v7 server routes + contextual client assistant.
* **Export / Import Engine** (`src/lib/export.ts`, `src/components/ExportModal.tsx`): JSON, Markdown, print HTML/PDF, ZIP archive, and UTF-8 safe base64 Share Link generation/parsing.

---

# 7. Builder Sections & Option Catalog

### 1. Project Basics

Tracked fields in `blueprint.basics` (`7` fields scored in Basics progress):

* Project Name (`name`, required)
* Description (`description`)
* Project Type (`projectType`, required)
* Category (`category` — 12 options: SaaS, Marketplace, Social Platform, Productivity App, Content / Media Platform, Developer Tool, Analytics / Dashboard, Communication Tool, E-Commerce Store, Portfolio / Showcase, Internal Business Tool, Other)
* Industry (`industry` — 16 options: Technology, Healthcare, Finance & FinTech, Education & EdTech, E-Commerce & Retail, Media & Entertainment, Travel & Hospitality, Food & Delivery, Real Estate, Logistics & Supply Chain, Social & Community, Gaming, Fitness & Wellness, Government & Civic, Non-Profit, Other)
* Target Audience (`targetAudience`)
* Business Model (`businessModel` — 9 options: SaaS Subscription, Marketplace / Commission, E-Commerce, Paid Subscription, Freemium, Ad-Supported, Open Source / Sponsor, Enterprise Licensing, Custom)

### 2. Platforms

Stored in `blueprint.basics.targetPlatforms` (`10` selectable project/platform types):

* Website (`website`)
* Web App (`web-app`)
* Android (`android`)
* iOS (`ios`)
* Desktop (`desktop`)
* API / Backend (`api`)
* Browser Extension (`browser-extension`)
* AI Product (`ai-product`)
* CLI Tool (`cli`)
* Custom (`custom`)

### 3. Technology

**12 configurable UI categories (`80` options total):**

* Frontend
* Backend
* Database
* ORM / Data Layer
* Authentication
* Hosting
* Storage
* CDN
* Cache
* Queue / Message Broker
* Search
* Monitoring

*(Note: `mobile` and `desktop` exist as reserved empty arrays on `TechnologySelection` for schema backward compatibility; mobile/desktop targeting is captured under Platforms and used by filtering rules rather than separate Technology sub-panels.)*

### 4. Features (`30` options)

* Authentication, Dashboard, User Profiles, Notifications, Messaging, Payments, AI Features, File Uploads, Analytics, Admin Panel, Reports, Search, Settings, Localization (i18n), Accessibility (a11y), Multi-Tenancy, Role-Based Access Control (RBAC), Audit Logging, Onboarding / Walkthrough, Dark Mode / Theming, Real-time Collaboration, Comments / Feedback, Export / Import, Webhooks (Outgoing), Email System, Calendar / Scheduling, Activity Feed / Timeline, Tags / Categories, Favorites / Bookmarks, Version History

### 5. Integrations (`26` options)

* Stripe, Razorpay, Paddle, Lemon Squeezy, Firebase, Supabase, Cloudinary, AWS Services, Google APIs, GitHub, Slack, Discord, Twilio, OpenAI, Anthropic, Google AI (Gemini), Resend, SendGrid, Postmark, PostHog, Mixpanel, Segment, Mapbox, Telegram Bot API, Zapier / Make, Vercel Analytics

### 6. Quality (`7` categories, `39` options total)

* Security (`security`)
* Performance (`performance`)
* SEO (`seo`)
* Accessibility (`accessibility`)
* Testing (`testing`)
* Monitoring (`monitoring`)
* Deployment (`deployment`)

---

# 8. Dynamic Question Engine

Implemented in `src/lib/question.ts` and section components:

* **Feature & Integration Filtering** (`getFilteredFeatures`, `getFilteredIntegrations`):
  * Partitions options into **Recommended** (tailored to `blueprint.basics.projectType`) and a collapsible **Other** group.
  * Already-selected options always remain visible in the primary list even if outside the current project type's preset.
  * Selecting no project type or selecting `Custom` returns all Features and Integrations directly in **Recommended**.
* **Technology & Quality Category Filtering** (`getRelevantTechCategoryIds`, `getRelevantQualityCategoryIds`):
  * Keeps relevant categories expanded for the active project type (e.g., `Website` emphasizes SEO and omits Queue; `CLI` focuses on Backend, Database, ORM, Monitoring, Security, Testing, and Deployment) while moving secondary categories into an **Other Categories** drawer unless they contain user selections.
  * Selecting no project type or selecting `Custom` shows all categories directly.
* **Example Behaviors:**
  * `ProjectType.Website`: Features highlight Authentication, Dashboard, Analytics, Search, Settings, Localization, Accessibility, Dark Mode, Comments, Tags/Categories, Export/Import, and Email System; Quality displays all 7 categories including SEO (`Meta Tags`, `Sitemap`, `Structured Data`).
  * `ProjectType.Android`: Features highlight Authentication, Dashboard, User Profiles, Notifications, Messaging, Payments, File Uploads, Analytics, Settings, Localization, Accessibility, Onboarding, Dark Mode, Activity Feed, Favorites/Bookmarks, and Calendar/Scheduling; Quality omits SEO; Integrations highlight Firebase, Supabase, Cloudinary, Google APIs, Twilio, Mapbox, Stripe/Razorpay, AI SDKs, and analytics tools.
* **Form Guidance Support:**
  * Contextual field tooltips, placeholder examples, inline required indicators, and cross-section validation warnings.

---

# 9. Universal Option Library

Every option conforms to the `Option` interface (`src/types/blueprint.ts`):

* `id`: Unique identifier referenced cleanly across `compatibleWith`, search, recommendations, and validation
* `name`: Human-readable label
* `description`: Concise explanation of purpose
* `category`: Section or technology/quality category key
* `bestUseCases`: Recommended application scenarios
* `advantages`: Key strengths
* `limitations`: Trade-offs and constraints
* `compatibleWith`: Validated option/category IDs for pairing badges
* `alternatives`: Comparable options
* `difficulty`: `beginner` | `intermediate` | `advanced`
* `popularity`: Numeric ranking score (used for default sort order)
* `recommendationScore`: Numeric weight for suggestion prioritization
* `tags`: Search keywords
* `docsUrl` *(optional)*: Official documentation URL
* `icon` *(optional)*: Visual icon identifier

**Example (`nextjs`):**

* **Description:** React full-stack framework for production web applications
* **Best For:** SEO sites, SaaS, full-stack apps
* **Advantages:** SSR/SSG, App Router, API routes, great DX
* **Limitations:** Vercel-centric features, learning curve for Server Components
* **Compatible With:** Tailwind CSS (`tailwindcss`), Prisma (`prisma`), PostgreSQL (`postgresql`), Vercel (`vercel`)

---

# 10. Search System

Implemented via `src/lib/search.ts` and `src/components/SearchModal.tsx`:

* **Fuzzy Instant Search:** Cached Fuse.js index weighted across `name` (3), `tags` (2), `description` (1.5), `category` (1), and `sectionLabel` (0.5).
* **Filter Tabs:** `All`, `Favorites`, `Technology`, `Features`, `Integrations`, `Quality`.
* **Popular Defaults:** Empty query displays top 20 options sorted by popularity (scoped by active filter).
* **Recently Used (`bb_recently_used`):** Tracks up to 10 recently toggled options when viewing `All` without a query.
* **Favorites (`bb_favorites`):** Star toggle persists favorites in `localStorage` and updates the `Favorites` tab live.
* **Keyboard Navigation:** `Ctrl/Cmd+K` toggles modal; `↑`/`↓` navigates results; `Enter` toggles selection in place; `Shift+Enter` jumps directly to the option's section; `Tab` traps focus inside the dialog; `Esc` closes.

---

# 11. Smart Recommendations

Implemented in `src/lib/recommendation.ts` and surfaced via `RecommendationBadge`:

* **Stack Compatibility Rules (`COMPATIBILITY_RULES`):**
  * Selecting `nextjs` recommends `vercel` (Hosting), `prisma` (ORM), and `postgresql` (Database).
  * Selecting `vue` recommends `netlify` and `vercel`.
  * Selecting `nodejs` recommends `mongodb` and `postgresql`; `python` recommends `prisma`.
  * Selecting `postgresql` recommends `prisma` and `drizzle`; `mongodb` recommends `mongoose`.
  * Selecting `nextauth` recommends `nextjs`; `supabase-auth` recommends `postgresql`.
* **Option-Level Cross-Pairing (`compatibleWith`):**
  * Selected technologies automatically surface compatible technologies not yet chosen, scored at `0.8 × recommendationScore`.
* **Missing Coverage Rules (`MISSING_RULES`):**
  * Prompts for Security (when Authentication is set without Security), Performance, Accessibility, SEO (for Website / Web App with Frontend), Testing, Monitoring, Hosting, and ORM when foundational layers lack coverage.
* **Badge Lookup (`getRecommendationMap`):**
  * Deduplicates and keeps the highest-scored recommendation per option ID for fast badge rendering across sections and the AI Assistant counter.

---

# 12. Validation Engine

Implemented in `src/lib/validation.ts` (`validateBlueprint`, `getValidationSummary`) with 13 rules across 3 severities:

* **Errors (block generation on Review screen):**
  * `missing-name`: Project name is required.
  * `missing-type`: Project type must be selected.
* **Warnings:**
  * `no-platforms`: No target platforms selected.
  * `no-technology`: No technologies selected across any category.
  * `missing-frontend`: Backend selected without a frontend technology.
  * `too-many-frameworks`: More than 2 major frontend frameworks selected simultaneously.
  * `payments-no-provider`: `payments` feature selected without `stripe` or `razorpay` integration.
  * `auth-no-provider`: `authentication` feature selected without any authentication technology.
  * `ai-no-provider`: `ai-features` selected without `openai`, `anthropic`, or `google-ai`.
  * `auth-no-security`: `authentication` feature selected without any Security quality option.
* **Info Notices:**
  * `missing-database`: Frontend and backend selected without a database.
  * `no-features`: No features selected yet.
  * `missing-description`: Project description is empty.

---

# 13. Progress Tracking

Implemented in `src/lib/progress.ts` (`getSectionProgress`, `getOverallProgress`) and exposed on `useBlueprintStore`:

* **Section Weights (`29` total scored checkpoints):**
  * `Project Basics`: `7` fields (`name`, `description`, `projectType`, `category`, `industry`, `targetAudience`, `businessModel`)
  * `Platforms`: `1` check (`targetPlatforms.length > 0`)
  * `Technology`: `12` active categories (`technologyCategories.length`)
  * `Features`: `1` check (`features.selected.length > 0`)
  * `Integrations`: `1` check (`integrations.selected.length > 0`)
  * `Quality`: `7` categories (`qualityCategories.length`)
* **Outputs:** Per-section percentage (`0–100`), filled/total counts, weighted overall completion percentage, completed sections count (`sections at 100%`), and `requiredActions` list for missing required fields.

---

# 14. Auto Save

Implemented in `src/lib/autoSave.ts`, `src/app/builder/page.tsx`, and `src/components/layout/BuilderLayout.tsx`:

* **Immediate Storage Keys:** `bb_blueprints` (array of `{ blueprint, savedAt }`) and `bb_current_blueprint_id` in `localStorage`.
* **Debounced Saving + Save Indicator:** `debouncedSave(blueprint, 500)` displays live `Saving...` / `Saved` status in the builder header.
* **Zero-Loss Unload Flush:** `flushPendingSave()` executes automatically on window `pagehide` and builder unmount so edits made within the 500ms debounce window are persisted immediately.
* **Session Recovery & Duplication:** Users can reopen any draft or completed blueprint via `/builder?id=<uuid>` or duplicate/delete existing blueprints from the Dashboard.

*(Undo/redo history and named revision snapshots remain deferred to Section 22 Future Enhancements.)*

---

# 15. Review Screen

Implemented in `src/components/ReviewScreen.tsx`:

* Displays Progress Overview bar (overall % completion and completed sections count).
* Renders Validation Alerts highlighting blocking errors (with direct `Fix →` section links) and warnings/notices.
* Displays structured Project Summary cards across Basics, Platforms, Technology categories, Features, Integrations, and Quality with per-section **Edit** buttons to jump directly back into any builder section.
* Gates progression to **Generate Documents →** until all `Error`-level validation items are resolved.

---

# 16. AI Assistance & Provider Model

Implemented in `src/components/AIAssistantPanel.tsx`, `src/lib/aiAssistant.ts`, `src/lib/aiProvider.ts`, `src/lib/aiModels.ts`, and `src/app/api/{chat,generate}/route.ts`:

* **Supported LLM Providers (`6`):**
  * `google` (default `gemini-3-flash-preview`, plus `gemini-3.5-flash`, `gemini-2.5-flash`, `gemini-flash-latest`, `gemini-pro-latest`)
  * `openai` (`gpt-4o`, `gpt-4o-mini`)
  * `anthropic` (`claude-4-6-sonnet-latest`, `claude-3-5-sonnet-20240620`, `claude-3-haiku-20240307`)
  * `mistral` (`mistral-large-latest`, `mistral-small-latest`)
  * `groq` (`llama-3-70b-versatile`, `llama3-8b-8192`)
  * `cohere` (`command-r-plus`, `command-r`)
* **BYOK Security Model:**
  * API keys entered in the UI are stored in browser `localStorage` and forwarded per request.
  * Server endpoints (`/api/chat`, `/api/generate`) reject missing API keys with HTTP `401` unless `ALLOW_SERVER_API_KEYS=true` is explicitly enabled in server environment variables alongside provider keys (e.g., `GOOGLE_GENERATIVE_AI_API_KEY`).
* **AI Assistant Panel Capabilities:**
  * **Quick Actions (local instant analysis):** `suggest-stack`, `whats-missing`, `estimate-complexity`, `suggest-description`, and `explain-section`.
  * **Multi-Turn Freeform Chat:** Sends blueprint context + up to the last `20` non-empty user/assistant turns to `/api/chat`; automatically falls back to deterministic local freeform guidance (`handleFreeformMessage`) when no API key is configured or on network/auth failure.
  * **Guardrail:** Assistant responses are strictly advisory (`###` / `##` headings, inline bold/code, lists, tables) and never silently alter blueprint selections.

---

# 17. Generated Outputs

Implemented in `src/lib/generation.ts` and `src/components/GenerationScreen.tsx`:

Users select any subset of **`11` implementation-ready documents**:

1. **Product Requirements (PRD)** (`prd`)
2. **README** (`readme`)
3. **API Specification** (`api-spec`)
4. **Database Design** (`database-design`)
5. **User Stories** (`user-stories`)
6. **Acceptance Criteria** (`acceptance-criteria`)
7. **Architecture Overview** (`architecture`)
8. **Task Breakdown** (`tasks`)
9. **Testing Plan** (`testing-plan`)
10. **Deployment Guide** (`deployment-guide`)
11. **AI Context File** (`ai-context`)

**Execution Behavior:**

* When an API key is configured, documents generate concurrently in bounded batches of `3` via `/api/generate`, falling back immediately to local deterministic templates if no key is provided or `401`/generation errors occur.
* Completing generation marks the blueprint status as `'complete'` via `markComplete()`.
* Includes document preview switcher, copy-to-clipboard, individual `.md` download, and ZIP export trigger.

---

# 18. Functional Requirements

* **Dashboard Management (`/`):** Create Blueprint, Resume/Edit Blueprint (`/builder?id=...`), Search by name/description/category, Filter by status (`All`, `Draft`, `Complete`), Duplicate Blueprint, Delete Blueprint (with confirmation dialog), Import `.json` configuration.
* **Guided Configuration (`/builder`):** Navigate 6 sections, toggle/select options with rich cards, search options globally, star favorites, review recommendations and validation warnings.
* **Documentation & Export (`ExportModal`, `src/lib/export.ts`):**
  * **JSON** (`.json`): Full blueprint export for backup or tool integration.
  * **Markdown** (`blueprint-documents.md`): Combined Markdown output of selected generated docs.
  * **PDF** (browser print window): XSS-escaped HTML print stylesheet for formatted PDF export.
  * **ZIP Archive** (`.zip` via JSZip): Bundled individual `<doc-id>.md` files plus `blueprint.json`.
  * **Share Link** (`/builder?shared=<encoded>`): UTF-8 safe base64 URL encoding that imports the shared blueprint as a fresh editable draft (`/builder?id=<new-uuid>`).
  * **Import JSON**: Structural validation checking top-level required sections (`basics`, `technology`, `features`, `integrations`, `quality`).

---

# 19. Non-Functional Requirements

* **Responsive Design:** Desktop 3-pane workspace, tablet slide-over summary drawer (`<=1200px`), and mobile slide-over nav/summary drawers (`<=768px`, clean scaling down to `<=480px`).
* **Keyboard Accessibility:** Modal focus traps, `Escape` dismissal on drawers/modals, `Ctrl/Cmd+K` quick search, arrow-key result navigation.
* **Offline & Zero-Key Support:** Full drafting, search, validation, assistant quick actions, template document generation, and local exports operate completely offline without network LLM calls using `localStorage` and deterministic generators.
* **Security & Isolation:** No client-side fake login gate; request-scoped BYOK API key handling (`401` when absent unless `ALLOW_SERVER_API_KEYS=true`); HTML-escaped PDF export; `ErrorBoundary` wrapping builder sections and screens.

---

# 20. UI Requirements

* **Left Navigation (`LeftNavigation.tsx`):** Section list with live completion indicators, clickable section navigation, mobile/tablet slide-over drawer support, and back-to-dashboard control.
* **Main Configuration Panel (`MainPanel.tsx`):**
  * Header: mobile nav toggle (`☰`), step title, auto-save status indicator (`Saving…` / `Saved ✓`), search trigger (`⌘K` / `Ctrl+K`), `✨ AI Assistant` toggle with recommendation badge count, Export trigger (`📤`), and tablet/mobile summary toggle (`📊`).
  * Sticky `ActionBar`: `← Back`, `Step X of 6`, `ValidationSummaryBadge`, and `Continue →` (switching to `Review & Generate →` on the Quality step).
* **Right Summary Panel (`RightSummaryPanel.tsx`):** Live debounced project summary and `ValidationPanel`.
* **Modals & Full Views (`BuilderLayout.tsx`):** `SearchModal`, slide-over `AIAssistantPanel`, `ReviewScreen`, `GenerationScreen`, and `ExportModal`.

---

# 21. Acceptance Criteria

Blueprint Builder meets production acceptance when:

* Users can create, edit, duplicate, import, delete, and resume blueprints directly via `/` and `/builder`.
* Dynamic filtering adjusts Technology, Features, Integrations, and Quality sections accurately across all 10 `ProjectType` values (including `Custom`).
* Catalog referential integrity holds (0 nonexistent `compatibleWith` IDs; recommendation rules map strictly to existing option/category IDs).
* Search returns relevant fuzzy matches with working `Favorites` and `Recently Used` state.
* Validation detects missing requirements and conflicting/incomplete stack pairings, and Progress reaches `100%` when all sections are populated.
* Auto-save persists continuously and flushes pending edits on unload/unmount.
* `/api/chat` and `/api/generate` validate inputs, enforce BYOK/opt-in auth rules, and both UI flows degrade gracefully to offline template/local handlers.
* Export/Import (JSON, Markdown, PDF, ZIP, `?shared=`) preserves UTF-8/emoji data without loss.
* Static typechecking (`tsc --noEmit`), ESLint (`npm run lint`), production build (`npm run build`), and unit test suite (`npm test`) pass cleanly.

---

# 22. Future Enhancements

* Undo / Redo action stack and named revision history snapshots
* Blueprint Marketplace & community templates
* Multi-user team collaboration & cloud backend sync
* Visual architecture diagrams (Mermaid / interactive node graph)
* Cost and timeline estimation
* Custom option libraries & plugin ecosystem
* Voice-guided project creation

---

# Definition of Done

Blueprint Builder is production-ready when users can configure any supported project type through the 6-section guided workflow, validate and optimize their architecture with live search, recommendations, and an optional BYOK AI assistant, auto-save work reliably across sessions, generate all 11 implementation specifications online or offline, and export/share complete configurations cleanly across JSON, Markdown, PDF, ZIP, and URL links.
