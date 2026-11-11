import { Blueprint } from '@/types/blueprint';
import { allTechnologies } from '@/data/options/technologies';
import { featureOptions } from '@/data/options/features';
import { integrationOptions } from '@/data/options/integrations';
import { qualityOptions } from '@/data/options/quality';

// ─── Helpers ─────────────────────────────────────────────────────────

function fmt(val: string | null): string {
  if (!val) return 'N/A';
  return val.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function lookupName(id: string): string {
  const opt =
    allTechnologies.find((o) => o.id === id) ??
    featureOptions.find((o) => o.id === id) ??
    integrationOptions.find((o) => o.id === id) ??
    Object.values(qualityOptions).flat().find((o) => o.id === id);
  return opt?.name ?? fmt(id);
}

function techByCategory(bp: Blueprint): [string, string[]][] {
  return Object.entries(bp.technology)
    .filter(([, ids]) => ids && Array.isArray(ids) && ids.length > 0)
    .map(([cat, ids]) => [fmt(cat), ids.map(lookupName).filter(Boolean)] as [string, string[]])
    .filter(([, names]) => names.length > 0);
}

function qualityByCategory(bp: Blueprint): [string, string[]][] {
  return Object.entries(bp.quality)
    .filter(([, ids]) => ids.length > 0)
    .map(([cat, ids]) => [fmt(cat), ids.map(lookupName)]);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Document Metadata ──────────────────────────────────────────────

export interface GeneratedDocument {
  id: string;
  title: string;
  icon: string;
  description: string;
  content: string;
}

export interface DocumentType {
  id: string;
  title: string;
  icon: string;
  description: string;
  generate: (bp: Blueprint) => string;
}

// ─── Stack Profile & Environment Derivation ──────────────────────────

interface StackProfile {
  runtimeLabel: string;
  installCmd: string;
  devCmd: string;
  testCmd: string;
  buildCmd: string;
  testTools: {
    unit: string;
    integration: string;
    e2e: string;
    perf: string;
  };
  dbParadigm: 'postgres' | 'mysql' | 'sqlite' | 'document';
  conventions: string[];
  prerequisites: string[];
}

function getStackProfile(bp: Blueprint): StackProfile {
  const backend = new Set(bp.technology.backend);
  const frontend = new Set(bp.technology.frontend);
  const mobile = new Set(bp.technology.mobile);
  const desktop = new Set(bp.technology.desktop);
  const db = new Set(bp.technology.database);

  const dbParadigm: StackProfile['dbParadigm'] =
    db.has('mongodb') || db.has('firebase-firestore')
      ? 'document'
      : db.has('sqlite') || db.has('turso')
      ? 'sqlite'
      : db.has('mysql') || db.has('planetscale')
      ? 'mysql'
      : 'postgres';

  if (mobile.has('flutter')) {
    return {
      runtimeLabel: 'Flutter / Dart',
      installCmd: 'flutter pub get',
      devCmd: 'flutter run',
      testCmd: 'flutter test',
      buildCmd: 'flutter build',
      testTools: {
        unit: 'flutter_test, mocktail',
        integration: 'integration_test package',
        e2e: 'Patrol / Flutter Integration Driver',
        perf: 'Flutter DevTools Timeline',
      },
      dbParadigm,
      conventions: [
        'Use sound null safety and `const` constructors where possible',
        'Keep widget trees modular with dedicated state/controller classes',
        'Run `dart analyze` and `flutter test` before shipping changes',
      ],
      prerequisites: ['Flutter SDK 3.x+ and Dart SDK', 'Xcode (iOS) / Android SDK'],
    };
  }

  if (mobile.has('swiftui')) {
    return {
      runtimeLabel: 'Swift / SwiftUI',
      installCmd: 'swift package resolve',
      devCmd: 'open *.xcodeproj # build & run via Xcode',
      testCmd: 'swift test',
      buildCmd: 'xcodebuild archive',
      testTools: {
        unit: 'XCTest / Swift Testing',
        integration: 'XCTest with mocked URLProtocol',
        e2e: 'XCUITest UI Tests',
        perf: 'Xcode Instruments',
      },
      dbParadigm,
      conventions: [
        'Use Swift structured concurrency (`async`/`await` and `@MainActor`)',
        'Isolate networking and persistence behind protocol abstractions',
        'Enforce SwiftLint / compiler strict concurrency checks',
      ],
      prerequisites: ['Xcode 16+ / Swift 6 toolchain on macOS'],
    };
  }

  if (mobile.has('jetpack-compose')) {
    return {
      runtimeLabel: 'Kotlin / Jetpack Compose',
      installCmd: './gradlew dependencies',
      devCmd: './gradlew installDebug',
      testCmd: './gradlew test',
      buildCmd: './gradlew assembleRelease',
      testTools: {
        unit: 'JUnit5, MockK',
        integration: 'AndroidX Test / Turbine',
        e2e: 'Compose UI Test / Espresso',
        perf: 'Android Studio Profiler & Macrobenchmark',
      },
      dbParadigm,
      conventions: [
        'Follow unidirectional data flow with ViewModel + StateFlow',
        'Keep composables stateless where possible for previewability & testing',
        'Use Kotlin coroutines with structured `viewModelScope` cancellation',
      ],
      prerequisites: ['JDK 17+ & Android SDK'],
    };
  }

  if (desktop.has('tauri') && !frontend.size) {
    return {
      runtimeLabel: 'Rust / Tauri',
      installCmd: 'cargo fetch',
      devCmd: 'cargo tauri dev',
      testCmd: 'cargo test',
      buildCmd: 'cargo tauri build',
      testTools: {
        unit: 'cargo test',
        integration: 'Tauri mock runtime + integration specs',
        e2e: 'WebdriverIO / Playwright',
        perf: 'cargo bench / Flamegraph',
      },
      dbParadigm,
      conventions: [
        'Avoid `.unwrap()` in Tauri commands; return typed serializable errors',
        'Validate IPC command arguments at the Rust boundary',
        'Run `cargo clippy` and `cargo test` before releases',
      ],
      prerequisites: ['Rust toolchain (rustup / cargo)', 'Node.js (if bundling web assets)'],
    };
  }

  if (backend.has('rust-actix')) {
    return {
      runtimeLabel: 'Rust',
      installCmd: 'cargo fetch',
      devCmd: 'cargo run',
      testCmd: 'cargo test',
      buildCmd: 'cargo build --release',
      testTools: {
        unit: 'cargo test',
        integration: 'actix_web::test / sqlx::test',
        e2e: 'Hurl / Newman HTTP suites',
        perf: 'wrk / k6',
      },
      dbParadigm,
      conventions: [
        'Propagate errors via `Result<T, AppError>` — avoid `unwrap()` in request handlers',
        'Keep handlers thin and extract domain services with trait bounds',
        'Run `cargo clippy --all-targets` and `cargo fmt --check`',
      ],
      prerequisites: ['Rust stable toolchain (rustup / cargo)'],
    };
  }

  if (backend.has('go')) {
    return {
      runtimeLabel: 'Go',
      installCmd: 'go mod download',
      devCmd: 'go run ./...',
      testCmd: 'go test -race ./...',
      buildCmd: 'go build -o bin/app ./...',
      testTools: {
        unit: 'go test + testify',
        integration: 'httptest + testcontainers-go',
        e2e: 'k6 / HTTP contract tests',
        perf: 'go test -bench=. / pprof',
      },
      dbParadigm,
      conventions: [
        'Always check and wrap returned errors with context (`fmt.Errorf("...: %w", err)`)',
        'Pass `context.Context` as the first parameter for I/O and cancellation',
        'Keep interfaces small and defined at consumer packages',
      ],
      prerequisites: ['Go 1.22+ installed'],
    };
  }

  if (
    backend.has('python') ||
    backend.has('fastapi') ||
    backend.has('django') ||
    backend.has('flask')
  ) {
    const devCmd = backend.has('django')
      ? 'python manage.py runserver'
      : backend.has('fastapi')
      ? 'uvicorn app.main:app --reload'
      : backend.has('flask')
      ? 'flask run --debug'
      : 'python -m app';
    const buildCmd = backend.has('django')
      ? 'python manage.py collectstatic --noinput'
      : 'docker build -t app .';

    return {
      runtimeLabel: 'Python',
      installCmd: 'pip install -r requirements.txt',
      devCmd,
      testCmd: 'pytest',
      buildCmd,
      testTools: {
        unit: 'pytest + pytest-mock',
        integration: backend.has('fastapi') ? 'FastAPI TestClient / httpx' : 'pytest + factory_boy',
        e2e: 'Playwright (Python) / Schemathesis',
        perf: 'Locust / k6',
      },
      dbParadigm,
      conventions: [
        'Use strict Python type annotations (`mypy` / `pyright`) and Pydantic models for validation',
        'Format and lint with Ruff; avoid mutable default arguments',
        'Keep database queries parameterized through the ORM / driver',
      ],
      prerequisites: ['Python 3.11+ with virtualenv or uv'],
    };
  }

  if (backend.has('rails')) {
    return {
      runtimeLabel: 'Ruby on Rails',
      installCmd: 'bundle install',
      devCmd: 'bin/dev',
      testCmd: 'bundle exec rspec',
      buildCmd: 'bundle exec rails assets:precompile',
      testTools: {
        unit: 'RSpec / Minitest',
        integration: 'RSpec Request Specs',
        e2e: 'Capybara + Playwright',
        perf: 'Rack Mini Profiler / k6',
      },
      dbParadigm,
      conventions: [
        'Keep controllers slim and extract complex workflows into service objects',
        'Use strong parameters and ActiveRecord validations consistently',
      ],
      prerequisites: ['Ruby 3.3+ and Bundler'],
    };
  }

  if (backend.has('laravel')) {
    return {
      runtimeLabel: 'PHP / Laravel',
      installCmd: 'composer install',
      devCmd: 'php artisan serve',
      testCmd: 'php artisan test',
      buildCmd: 'composer install --no-dev --optimize-autoloader',
      testTools: {
        unit: 'Pest / PHPUnit',
        integration: 'Laravel Feature Tests',
        e2e: 'Laravel Dusk / Playwright',
        perf: 'Laravel Pulse / k6',
      },
      dbParadigm,
      conventions: [
        'Use Form Requests for validation and Policy classes for authorization',
        'Use queues cleanly for heavy emails, webhooks, and exports',
      ],
      prerequisites: ['PHP 8.2+ and Composer'],
    };
  }

  if (backend.has('java')) {
    return {
      runtimeLabel: 'Java / Spring Boot',
      installCmd: './mvnw dependency:resolve',
      devCmd: './mvnw spring-boot:run',
      testCmd: './mvnw test',
      buildCmd: './mvnw package -DskipTests=false',
      testTools: {
        unit: 'JUnit 5 + Mockito',
        integration: 'SpringBootTest + Testcontainers',
        e2e: 'REST Assured / Playwright',
        perf: 'Gatling / JMH',
      },
      dbParadigm,
      conventions: [
        'Use constructor injection and immutable DTO records for API payloads',
        'Handle domain exceptions via `@ControllerAdvice` returning RFC-7807 Problem Details',
      ],
      prerequisites: ['JDK 21+ and Maven/Gradle'],
    };
  }

  if (desktop.has('dotnet-maui')) {
    return {
      runtimeLabel: '.NET MAUI',
      installCmd: 'dotnet restore',
      devCmd: 'dotnet build',
      testCmd: 'dotnet test',
      buildCmd: 'dotnet publish -c Release',
      testTools: {
        unit: 'xUnit / NUnit',
        integration: 'WebApplicationFactory / Integration tests',
        e2e: 'Appium UI Automation',
        perf: 'dotnet-trace / dotMemory',
      },
      dbParadigm,
      conventions: [
        'Enable nullable reference types (`<Nullable>enable</Nullable>`)',
        'Separate MVVM ViewModels cleanly from platform-specific UI views',
      ],
      prerequisites: ['.NET 8 SDK+ and MAUI workload'],
    };
  }

  const isReactNative = mobile.has('react-native');
  return {
    runtimeLabel: isReactNative ? 'React Native / TypeScript' : 'Node.js / TypeScript',
    installCmd: 'npm install',
    devCmd: isReactNative ? 'npx expo start' : 'npm run dev',
    testCmd: 'npm test',
    buildCmd: isReactNative ? 'npx eas build' : 'npm run build',
    testTools: {
      unit: 'Vitest / Jest',
      integration: 'Supertest / MSW',
      e2e: isReactNative ? 'Maestro / Detox' : 'Playwright',
      perf: isReactNative ? 'Flashlight / React DevTools' : 'k6 / Lighthouse',
    },
    dbParadigm,
    conventions: [
      'Use TypeScript strict mode (`strict: true`) — avoid `any`',
      'Validate external inputs at API boundaries (e.g. Zod)',
      'Write unit/integration tests for core domain logic and error paths',
    ],
    prerequisites: ['Node.js 20+ installed', 'npm / pnpm package manager'],
  };
}

/** Derive environment variable placeholders cleanly for Deployment Guide & .env.example. */
export function deriveEnvVariables(bp: Blueprint): string[] {
  const vars: string[] = [];
  const techIds = new Set(Object.values(bp.technology).flat());
  const integrations = new Set(bp.integrations.selected);

  if (
    techIds.has('nodejs') ||
    techIds.has('nextjs') ||
    techIds.has('express') ||
    techIds.has('nestjs') ||
    techIds.has('hono') ||
    bp.technology.frontend.length > 0
  ) {
    vars.push('NODE_ENV=production');
  } else {
    vars.push('APP_ENV=production');
  }

  if (bp.technology.database.length > 0) {
    if (techIds.has('sqlite') && !techIds.has('turso')) {
      vars.push('SQLITE_DB_PATH=./data/app.db');
    } else if (techIds.has('firebase-firestore')) {
      vars.push('FIREBASE_PROJECT_ID=your_firebase_project_id');
    } else {
      vars.push('DATABASE_URL=your_database_connection_url');
    }
  }

  if (techIds.has('turso')) {
    vars.push('TURSO_AUTH_TOKEN=your_turso_auth_token');
  }
  if (techIds.has('redis') || techIds.has('redis-cache') || techIds.has('upstash-redis') || techIds.has('bullmq')) {
    vars.push('REDIS_URL=redis://localhost:6379');
  }

  if (techIds.has('nextauth')) {
    vars.push('AUTH_SECRET=your_random_32_byte_secret');
  } else if (techIds.has('clerk')) {
    vars.push('CLERK_SECRET_KEY=sk_test_your_clerk_secret');
  } else if (techIds.has('supabase-auth') || techIds.has('supabase-storage') || integrations.has('supabase')) {
    vars.push('SUPABASE_URL=https://your-project.supabase.co');
    vars.push('SUPABASE_ANON_KEY=your_supabase_anon_key');
  } else if (techIds.has('auth0')) {
    vars.push('AUTH0_DOMAIN=your-tenant.auth0.com');
    vars.push('AUTH0_CLIENT_ID=your_auth0_client_id');
    vars.push('AUTH0_CLIENT_SECRET=your_auth0_client_secret');
  } else if (bp.features.selected.includes('authentication') || bp.technology.authentication.length > 0) {
    vars.push('JWT_SECRET=your_jwt_secret');
  }

  if (techIds.has('aws-s3') || techIds.has('cloudflare-r2') || techIds.has('minio')) {
    vars.push('S3_BUCKET=your_bucket_name');
    vars.push('S3_ACCESS_KEY_ID=your_access_key');
    vars.push('S3_SECRET_ACCESS_KEY=your_secret_key');
  }

  if (techIds.has('sentry')) {
    vars.push('SENTRY_DSN=https://example@sentry.io/0');
  }

  const integrationEnvMap: Record<string, string[]> = {
    stripe: ['STRIPE_SECRET_KEY=sk_test_your_stripe_key', 'STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret'],
    openai: ['OPENAI_API_KEY=sk-your_openai_key'],
    anthropic: ['ANTHROPIC_API_KEY=sk-ant-your_anthropic_key'],
    'google-ai': ['GEMINI_API_KEY=your_gemini_api_key'],
    resend: ['RESEND_API_KEY=re_your_resend_key'],
    sendgrid: ['SENDGRID_API_KEY=SG.your_sendgrid_key'],
    postmark: ['POSTMARK_SERVER_TOKEN=your_postmark_token'],
    posthog: ['POSTHOG_API_KEY=phc_your_posthog_key'],
    'github-api': ['GITHUB_TOKEN=ghp_your_github_token'],
  };

  for (const id of bp.integrations.selected) {
    if (id === 'supabase') continue; // Already included above if present
    const mapped = integrationEnvMap[id];
    if (mapped) {
      vars.push(...mapped);
    } else {
      const envPrefix = id.toUpperCase().replace(/-/g, '_');
      vars.push(`${envPrefix}_API_KEY=your_${id}_api_key`);
    }
  }

  return Array.from(new Set(vars));
}

function escapeMermaidLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/[\r\n]+/g, ' ').trim();
}

// ─── Generators ──────────────────────────────────────────────────────

function generatePRD(bp: Blueprint): string {
  const name = bp.basics.name || 'Untitled Project';
  const tech = techByCategory(bp);
  const qual = qualityByCategory(bp);
  const domainNotes = bp.basics.domainNotes?.trim();

  return `# Product Requirements Document (PRD)
## ${name}

**Date:** ${today()}
**Status:** ${bp.status === 'complete' ? 'Final' : 'Draft'}

## 1. Overview

**Project Name:** ${name}
**Project Type:** ${fmt(bp.basics.projectType)}
**Industry:** ${bp.basics.industry || 'Not specified'}
**Target Audience:** ${bp.basics.targetAudience || 'Not specified'}
**Business Model:** ${fmt(bp.basics.businessModel)}
${bp.basics.description ? `\n### Description\n\n${bp.basics.description}\n` : ''}${domainNotes ? `\n### Domain Entities, Workflows & Constraints\n\n${domainNotes}\n` : ''}
## 2. Target Platforms

${bp.basics.targetPlatforms.length > 0 ? bp.basics.targetPlatforms.map((p) => `- ${fmt(p)}`).join('\n') : '_No platforms selected._'}

## 3. Technology Stack

${tech.length > 0 ? `| Layer | Technologies |\n|-------|-------------|\n${tech.map(([cat, names]) => `| **${cat}** | ${names.join(', ')} |`).join('\n')}` : '_No technologies selected._'}

## 4. Features

${bp.features.selected.length > 0 ? bp.features.selected.map((id) => {
  const opt = featureOptions.find((o) => o.id === id);
  return `### ${opt?.icon ?? '•'} ${lookupName(id)}\n${opt?.description ?? ''}\n`;
}).join('\n') : '_No features selected._\n'}
## 5. Integrations

${bp.integrations.selected.length > 0 ? bp.integrations.selected.map((id) => {
  const opt = integrationOptions.find((o) => o.id === id);
  return `- **${lookupName(id)}** — ${opt?.description ?? ''}`;
}).join('\n') : '_No integrations selected._'}

## 6. Quality & Non-Functional Requirements

${qual.length > 0 ? qual.map(([cat, names]) => `### ${cat}\n${names.map((n) => `- ${n}`).join('\n')}\n`).join('\n') : '_No quality configurations set._\n'}
---
*Generated by Blueprint Builder on ${today()}*`;
}

function generateREADME(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  const tech = techByCategory(bp);
  const stack = getStackProfile(bp);

  return `# ${name}

${bp.basics.description ? `> ${bp.basics.description}\n` : ''}
![Type](https://img.shields.io/badge/type-${encodeURIComponent(fmt(bp.basics.projectType))}-6366f1)
![Runtime](https://img.shields.io/badge/runtime-${encodeURIComponent(stack.runtimeLabel)}-06b6d4)
![Status](https://img.shields.io/badge/status-${bp.status}-10b981)

## Tech Stack

${tech.length > 0 ? tech.map(([cat, names]) => `- **${cat}:** ${names.join(', ')}`).join('\n') : '_Not selected yet._'}

## Features

${bp.features.selected.length > 0 ? bp.features.selected.map((id) => `- ${lookupName(id)}`).join('\n') : '_None selected._'}
${bp.integrations.selected.length > 0 ? `\n## Integrations\n\n${bp.integrations.selected.map((id) => `- ${lookupName(id)}`).join('\n')}\n` : ''}
## Getting Started

\`\`\`bash
# Install dependencies (${stack.runtimeLabel})
${stack.installCmd}

# Copy environment variables template
cp .env.example .env

# Start development server / app
${stack.devCmd}

# Run tests
${stack.testCmd}
\`\`\`

## License

MIT

---
*Generated by Blueprint Builder on ${today()}*`;
}

function generateAPISpec(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  const domainNotes = bp.basics.domainNotes?.trim();
  let content = `# API Specification — ${name}\n\n**Base URL:** \`https://api.${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app'}.com/v1\`\n\n`;

  if (domainNotes) {
    content += `## Domain Entities & Constraints\n\n${domainNotes}\n\n`;
  }

  if (bp.features.selected.includes('authentication')) {
    content += `## Authentication

### POST /auth/register
Create a new user account.
\`\`\`json
{ "email": "string", "password": "string", "name": "string" }
\`\`\`

### POST /auth/login
Authenticate and receive a session token.
\`\`\`json
{ "email": "string", "password": "string" }
\`\`\`

### POST /auth/logout
Invalidate the current session.

`;
  }

  for (const id of bp.features.selected) {
    if (id === 'authentication') continue;
    const resource = id.replace(/-/g, '_');
    content += `## ${lookupName(id)}\n\n`;

    if (id === 'dashboard') {
      content += `### GET /dashboard/metrics\nRetrieve aggregated metrics for the dashboard view.\n\n### GET /dashboard/activity\nGet recent activity feed for the dashboard.\n\n`;
    } else if (id === 'user-profiles') {
      content += `### GET /users/:id/profile\nGet a specific user's public profile data.\n\n### PUT /users/me/profile\nUpdate the authenticated user's profile.\n\n`;
    } else if (id === 'payments') {
      content += `### POST /payments/checkout\nCreate a new checkout session.\n\n### GET /payments/subscriptions\nList active subscriptions for the user.\n\n### POST /webhooks/payments\nHandle provider webhook events (verify signature & ensure idempotency).\n\n`;
    } else if (id === 'messaging') {
      content += `### GET /conversations\nList all active conversations for the user.\n\n### POST /conversations/:id/messages\nSend a new message in a conversation.\n\n`;
    } else if (id === 'file-uploads') {
      content += `### POST /uploads/presigned-url\nGet a pre-signed URL for direct cloud upload.\n\n`;
    } else if (id === 'search') {
      content += `### GET /search\nPerform a full-text search query across resources.\n\n`;
    } else {
      content += `### GET /${resource}\nList all ${lookupName(id).toLowerCase()} items.\n
### POST /${resource}\nCreate a new ${lookupName(id).toLowerCase()} item.\n
### GET /${resource}/:id\nGet a specific ${lookupName(id).toLowerCase()} item.\n
### PUT /${resource}/:id\nUpdate a ${lookupName(id).toLowerCase()} item.\n
### DELETE /${resource}/:id\nDelete a ${lookupName(id).toLowerCase()} item.\n\n`;
    }
  }

  return content + `---\n*Generated by Blueprint Builder on ${today()}*`;
}

function generateDatabaseDesign(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  const dbs = bp.technology.database.map(lookupName);
  const orms = bp.technology.orm.map(lookupName);
  const { dbParadigm } = getStackProfile(bp);
  const domainNotes = bp.basics.domainNotes?.trim();

  let content = `# Database Design — ${name}\n\n**Database:** ${dbs.length > 0 ? dbs.join(', ') : 'Not selected'}\n${orms.length > 0 ? `**ORM / ODM:** ${orms.join(', ')}\n` : ''}**Model Style:** ${dbParadigm === 'document' ? 'Document Collections' : dbParadigm.toUpperCase() + ' Relational Schema'}\n\n`;

  if (domainNotes) {
    content += `## Domain Modeling Notes\n\n${domainNotes}\n\n`;
  }

  if (dbParadigm === 'document') {
    content += `## Core Collections\n\n`;
    if (bp.features.selected.includes('authentication')) {
      content += `### \`users\`\n\`\`\`json\n{\n  "_id": "string",\n  "email": "string (unique index)",\n  "name": "string",\n  "passwordHash": "string",\n  "role": "user | admin",\n  "createdAt": "ISO8601",\n  "updatedAt": "ISO8601"\n}\n\`\`\`\n\n`;
    }
    for (const id of bp.features.selected) {
      if (id === 'authentication') continue;
      const collectionName = id.replace(/-/g, '_');
      content += `### \`${collectionName}\`\n\`\`\`json\n{\n  "_id": "string",\n${bp.features.selected.includes('authentication') ? '  "userId": "string (indexed)",\n' : ''}  "title": "string",\n  "payload": {},\n  "status": "active",\n  "createdAt": "ISO8601",\n  "updatedAt": "ISO8601"\n}\n\`\`\`\n\n`;
    }
    return content + `---\n*Generated by Blueprint Builder on ${today()}*`;
  }

  const pkDef =
    dbParadigm === 'sqlite'
      ? 'TEXT PRIMARY KEY'
      : dbParadigm === 'mysql'
      ? 'CHAR(36) PRIMARY KEY'
      : 'UUID PRIMARY KEY DEFAULT gen_random_uuid()';
  const fkType = dbParadigm === 'sqlite' ? 'TEXT' : dbParadigm === 'mysql' ? 'CHAR(36)' : 'UUID';
  const jsonType = dbParadigm === 'sqlite' ? 'TEXT' : dbParadigm === 'mysql' ? 'JSON' : 'JSONB';
  const tsType = dbParadigm === 'sqlite' ? 'TEXT DEFAULT CURRENT_TIMESTAMP' : dbParadigm === 'mysql' ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'TIMESTAMPTZ DEFAULT NOW()';

  content += `## Core Tables\n\n`;

  if (bp.features.selected.includes('authentication')) {
    content += `### users
\`\`\`sql
CREATE TABLE users (
  id          ${pkDef},
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  avatar_url  TEXT,
  role        VARCHAR(50) DEFAULT 'user',
  created_at  ${tsType},
  updated_at  ${tsType}
);
\`\`\`\n\n`;
  }

  for (const id of bp.features.selected) {
    if (id === 'authentication') continue;
    const tableName = id.replace(/-/g, '_');
    content += `### ${tableName}\n\`\`\`sql\n`;

    if (id === 'dashboard') {
      content += `CREATE TABLE dashboard_metrics (
  id          ${pkDef},
  metric_name VARCHAR(255) NOT NULL,
  value       NUMERIC NOT NULL,
  recorded_at ${tsType}
);`;
    } else if (id === 'user-profiles') {
      content += `CREATE TABLE user_profiles (
  user_id     ${fkType} PRIMARY KEY REFERENCES users(id),
  bio         TEXT,
  website     VARCHAR(255),
  preferences ${jsonType},
  updated_at  ${tsType}
);`;
    } else if (id === 'payments') {
      content += `CREATE TABLE subscriptions (
  id                 ${pkDef},
${bp.features.selected.includes('authentication') ? `  user_id            ${fkType} REFERENCES users(id),\n` : ''}  plan_id            VARCHAR(100) NOT NULL,
  status             VARCHAR(50) NOT NULL,
  current_period_end ${tsType},
  created_at         ${tsType}
);`;
    } else if (id === 'messaging') {
      content += `CREATE TABLE messages (
  id              ${pkDef},
  conversation_id ${fkType} NOT NULL,
${bp.features.selected.includes('authentication') ? `  sender_id       ${fkType} REFERENCES users(id),\n` : ''}  content         TEXT NOT NULL,
  created_at      ${tsType}
);`;
    } else {
      content += `CREATE TABLE ${tableName} (
  id          ${pkDef},
${bp.features.selected.includes('authentication') ? `  user_id     ${fkType} REFERENCES users(id),\n` : ''}  title       VARCHAR(255) NOT NULL,
  data        ${jsonType},
  status      VARCHAR(50) DEFAULT 'active',
  created_at  ${tsType},
  updated_at  ${tsType}
);`;
    }
    content += `\n\`\`\`\n\n`;
  }

  return content + `---\n*Generated by Blueprint Builder on ${today()}*`;
}

function generateUserStories(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  if (bp.features.selected.length === 0) return `# User Stories — ${name}\n\n_No features selected. Add features to generate user stories._\n\n---\n*Generated by Blueprint Builder on ${today()}*`;

  const stories = bp.features.selected.map((id, index) => {
    const opt = featureOptions.find((o) => o.id === id);
    const featureName = lookupName(id);
    let reason = opt?.description ? opt.description.toLowerCase() : `benefit from ${featureName.toLowerCase()}`;
    if (reason.endsWith('.')) reason = reason.slice(0, -1);

    return `## US-${String(index + 1).padStart(3, '0')}: ${featureName}\n
**As a** user
**I want to** use the ${featureName.toLowerCase()} feature
**So that** I can achieve: ${reason}\n
### Acceptance Criteria\n
${opt?.advantages.slice(0, 3).map((adv) => `- [ ] ${adv} is implemented and working`).join('\n') ?? ''}
- [ ] ${featureName} is accessible and responsive
- [ ] Error states are handled gracefully
- [ ] Unit tests cover core functionality\n
**Priority:** ${opt && opt.popularity > 80 ? 'High' : opt && opt.popularity > 50 ? 'Medium' : 'Low'}
**Difficulty:** ${opt?.difficulty ?? 'intermediate'}\n`;
  });

  return `# User Stories — ${name}\n\n${stories.join('\n')}\n---\n*Generated by Blueprint Builder on ${today()}*`;
}

function generateArchitecture(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  const clients = [
    ...bp.technology.frontend,
    ...bp.technology.mobile,
    ...bp.technology.desktop,
  ].map(lookupName);
  const backends = bp.technology.backend.map(lookupName);
  const databases = bp.technology.database.map(lookupName);
  const orms = bp.technology.orm.map(lookupName);
  const auth = bp.technology.authentication.map(lookupName);
  const hosting = bp.technology.hosting.map(lookupName);
  const caches = bp.technology.cache.map(lookupName);
  const queues = bp.technology.queue.map(lookupName);
  const search = bp.technology.search.map(lookupName);
  const storage = bp.technology.storage.map(lookupName);
  const monitoring = bp.technology.monitoring.map(lookupName);
  const integrations = bp.integrations.selected.map(lookupName);
  const domainNotes = bp.basics.domainNotes?.trim();

  const clientLabel = clients.length > 0 ? clients.join(' + ') : `${fmt(bp.basics.projectType)} Client`;
  const serverLabel = backends.length > 0 ? backends.join(' + ') : 'Application Core / API';

  const lines: string[] = [
    'flowchart TD',
    `  Client["${escapeMermaidLabel(clientLabel)}"] --> Core["${escapeMermaidLabel(serverLabel)}"]`,
  ];

  if (auth.length > 0) {
    lines.push(`  Core --> Auth["${escapeMermaidLabel(`Auth: ${auth.join(' / ')}`)}"]`);
  }
  if (caches.length > 0) {
    lines.push(`  Core --> Cache["${escapeMermaidLabel(`Cache: ${caches.join(' / ')}`)}"]`);
  }
  if (queues.length > 0) {
    lines.push(`  Core --> Queue["${escapeMermaidLabel(`Queue: ${queues.join(' / ')}`)}"]`);
  }
  if (databases.length > 0) {
    const dataLabel = orms.length > 0 ? `${databases.join(' + ')} via ${orms.join(' / ')}` : databases.join(' + ');
    lines.push(`  Core --> DB[("${escapeMermaidLabel(dataLabel)}")]`);
  }
  if (storage.length > 0) {
    lines.push(`  Core --> Storage["${escapeMermaidLabel(`Storage: ${storage.join(' / ')}`)}"]`);
  }
  if (search.length > 0) {
    lines.push(`  Core --> Search["${escapeMermaidLabel(`Search: ${search.join(' / ')}`)}"]`);
  }
  if (integrations.length > 0) {
    lines.push(`  Core --> Ext["${escapeMermaidLabel(`Integrations: ${integrations.slice(0, 4).join(', ')}`)}"]`);
  }
  if (hosting.length > 0) {
    lines.push(`  Infra["${escapeMermaidLabel(`Hosting: ${hosting.join(' / ')}`)}"] -.-> Core`);
  }
  if (monitoring.length > 0) {
    lines.push(`  Core -.-> Obs["${escapeMermaidLabel(`Telemetry: ${monitoring.join(' / ')}`)}"]`);
  }

  return `# Architecture Overview — ${name}

## System Architecture

\`\`\`mermaid
${lines.join('\n')}
\`\`\`

${domainNotes ? `## Domain Architecture Notes\n\n${domainNotes}\n\n` : ''}## Technology Stack Details

${techByCategory(bp).map(([cat, names]) => `### ${cat}\n${names.map((n) => `- **${n}** — ${allTechnologies.find((t) => t.name === n)?.description ?? ''}`).join('\n')}\n`).join('\n')}
${bp.integrations.selected.length > 0 ? `## External Integrations\n\n${bp.integrations.selected.map((id) => `- **${lookupName(id)}** — ${integrationOptions.find((o) => o.id === id)?.description ?? ''}`).join('\n')}\n` : ''}
${qualityByCategory(bp).length > 0 ? `## Quality Attributes\n\n${qualityByCategory(bp).map(([cat, names]) => `### ${cat}\n${names.map((n) => `- ${n}`).join('\n')}\n`).join('\n')}` : ''}
---
*Generated by Blueprint Builder on ${today()}*`;
}

function generateTaskBreakdown(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  let phase = 1;
  let content = `# Task Breakdown — ${name}\n\n## Phase ${phase++}: Project Setup\n\n- [ ] Initialize project repository\n${techByCategory(bp).map(([cat, names]) => `- [ ] Set up ${cat}: ${names.join(', ')}`).join('\n')}\n- [ ] Configure development environment\n- [ ] Set up CI/CD pipeline\n\n`;

  if (bp.features.selected.length > 0) {
    content += `## Phase ${phase++}: Core Features\n\n${bp.features.selected.map((id) => {
      const opt = featureOptions.find((o) => o.id === id);
      return `### ${lookupName(id)}\n- [ ] Design ${lookupName(id).toLowerCase()} UX / contract\n- [ ] Implement backend / core logic\n- [ ] Build UI / consumer layer\n- [ ] Write tests\n${opt ? `- [ ] Estimated difficulty: ${opt.difficulty}\n` : ''}`;
    }).join('\n')}\n`;
  }

  if (bp.integrations.selected.length > 0) {
    content += `## Phase ${phase++}: Integrations\n\n${bp.integrations.selected.map((id) => `- [ ] Integrate ${lookupName(id)}\n- [ ] Test ${lookupName(id)} integration`).join('\n')}\n\n`;
  }

  const qual = qualityByCategory(bp);
  if (qual.length > 0) {
    content += `## Phase ${phase++}: Quality & Non-Functional\n\n${qual.map(([cat, names]) => `### ${cat}\n${names.map((n) => `- [ ] Implement ${n}`).join('\n')}\n`).join('\n')}\n`;
  }

  content += `## Phase ${phase}: Launch\n\n- [ ] Final QA testing\n- [ ] Performance optimization\n- [ ] Security audit\n- [ ] Deploy / release build\n- [ ] Monitor and iterate\n\n---\n*Generated by Blueprint Builder on ${today()}*`;
  return content;
}

function generateTestingPlan(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  const stack = getStackProfile(bp);

  return `# Testing Plan — ${name}

**Primary Stack:** ${stack.runtimeLabel}
**Test Command:** \`${stack.testCmd}\`

## Testing Strategy

| Type | Coverage Target | Tools |
|------|----------------|-------|
| Unit Tests | 80%+ | ${stack.testTools.unit} |
| Integration Tests | Critical paths | ${stack.testTools.integration} |
| E2E Tests | Core user flows | ${stack.testTools.e2e} |
| Performance Tests | Key bottlenecks | ${stack.testTools.perf} |

## Test Cases by Feature

${bp.features.selected.length > 0 ? bp.features.selected.map((id) => {
  const featureName = lookupName(id);
  return `### ${featureName}

#### Unit Tests
- [ ] ${featureName} core logic functions
- [ ] Edge case handling
- [ ] Error state validation

#### Integration Tests
- [ ] Contract / API boundary for ${featureName.toLowerCase()}
- [ ] Data persistence & error recovery

#### E2E Tests
- [ ] Happy path flow for ${featureName.toLowerCase()}
- [ ] Failure & permission boundary states
`;
}).join('\n') : '_No features selected. Add features to generate test cases._\n'}
---
*Generated by Blueprint Builder on ${today()}*`;
}

function generateDeploymentGuide(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  const hosting = bp.technology.hosting.map(lookupName);
  const dbs = bp.technology.database.map(lookupName);
  const stack = getStackProfile(bp);
  const envVars = deriveEnvVariables(bp);

  return `# Deployment Guide — ${name}

**Runtime / Stack:** ${stack.runtimeLabel}
**Target Platform:** ${hosting.length > 0 ? hosting.join(', ') : 'Not specified'}

## Prerequisites

${stack.prerequisites.map((p) => `- ${p}`).join('\n')}
${dbs.length > 0 ? `- ${dbs.join(' / ')} instance\n` : ''}- Environment variables configured (see \`.env.example\`)

## Environment Variables

\`\`\`env
${envVars.join('\n')}
\`\`\`

## Build & Verify

\`\`\`bash
# Install dependencies
${stack.installCmd}

# Run test suite
${stack.testCmd}

# Build release artifact
${stack.buildCmd}
\`\`\`

${hosting.length > 0 ? `## Platform-Specific Instructions\n\n${hosting.map((h) => `### ${h}\nRefer to the official ${h} deployment documentation for platform-specific setup.\n`).join('\n')}\n` : ''}## Post-Deployment Checklist

- [ ] Verify all environment variables are set
${dbs.length > 0 ? '- [ ] Run database migrations\n' : ''}- [ ] Test critical user flows
- [ ] Enable monitoring and alerting
- [ ] Verify TLS / secret rotation
- [ ] Set up backup & rollback procedure

---
*Generated by Blueprint Builder on ${today()}*`;
}

function generateAIContext(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  const stack = getStackProfile(bp);
  const domainNotes = bp.basics.domainNotes?.trim();

  return `# AI Context File — ${name}

> This file provides context to AI coding assistants about the project structure, stack, domain rules, and conventions.

## Project Overview

- **Name:** ${name}
- **Type:** ${fmt(bp.basics.projectType)}
- **Runtime:** ${stack.runtimeLabel}
- **Industry:** ${bp.basics.industry || 'Not specified'}
- **Business Model:** ${fmt(bp.basics.businessModel)}
${bp.basics.description ? `- **Description:** ${bp.basics.description}` : ''}
${domainNotes ? `\n## Domain Entities & Constraints\n\n${domainNotes}\n` : ''}
## Technology Stack

${techByCategory(bp).map(([cat, names]) => `- **${cat}:** ${names.join(', ')}`).join('\n')}

## Features

${bp.features.selected.length > 0 ? bp.features.selected.map((id) => `- ${lookupName(id)}`).join('\n') : '- None selected'}

## Integrations

${bp.integrations.selected.length > 0 ? bp.integrations.selected.map((id) => `- ${lookupName(id)}`).join('\n') : '- None selected'}

## Quality Requirements

${qualityByCategory(bp).map(([cat, names]) => `### ${cat}\n${names.map((n) => `- ${n}`).join('\n')}\n`).join('\n')}
## Development & Verification Commands

- Install: \`${stack.installCmd}\`
- Dev: \`${stack.devCmd}\`
- Test: \`${stack.testCmd}\`
- Build: \`${stack.buildCmd}\`

## Coding Conventions

${stack.conventions.map((c) => `- ${c}`).join('\n')}
- Follow project architecture and keep changes minimal and well-tested

---
*Generated by Blueprint Builder on ${today()}*`;
}

function generateAcceptanceCriteria(bp: Blueprint): string {
  const name = bp.basics.name || 'Project';
  if (bp.features.selected.length === 0) return `# Acceptance Criteria — ${name}\n\n**Date:** ${today()}\n**Status:** ${bp.status === 'complete' ? 'Final' : 'Draft'}\n\n> This document defines testable acceptance criteria for every selected feature. Each criterion uses the **Given/When/Then** format for clarity.\n\n_No features selected. Add features to generate acceptance criteria._\n\n---\n*Generated by Blueprint Builder on ${today()}*`;

  const criteriaMap: Record<string, string[][]> = {
    'authentication': [
      ['a visitor is on the login page', 'they enter valid credentials and submit', 'they are redirected to the dashboard with an active session'],
      ['a visitor is on the registration page', 'they complete all required fields and submit', 'a new account is created and a verification email is sent'],
      ['an authenticated user clicks "Forgot Password"', 'they enter their email and submit', 'a password reset link is sent to their email'],
      ['a user session token expires', 'the user makes a request', 'they are redirected to the login page with a clear message'],
    ],
    'dashboard': [
      ['an authenticated user logs in', 'the dashboard loads', 'key metrics, activity feed, and quick actions are visible within 2 seconds'],
      ['new data is available', 'the user views the dashboard', 'metrics update to reflect the latest data without a full page reload'],
    ],
    'user-profiles': [
      ['an authenticated user visits their profile', 'the page loads', 'their avatar, name, email, and activity history are displayed'],
      ['a user edits their profile information', 'they save changes', 'the updated information is persisted and displayed immediately'],
    ],
    'notifications': [
      ['a relevant event occurs', 'the system generates a notification', 'the user sees an in-app notification badge within 5 seconds'],
      ['a user opens the notification panel', 'they view notifications', 'notifications are sorted by recency with unread items highlighted'],
      ['a user clicks a notification', 'the notification detail loads', 'they are navigated to the relevant content and the notification is marked as read'],
    ],
    'messaging': [
      ['two authenticated users exist', 'one sends a message to the other', 'the recipient sees the message in real-time without refreshing'],
      ['a user opens a conversation', 'the chat history loads', 'previous messages are displayed in chronological order'],
    ],
    'payments': [
      ['a user selects a plan or product', 'they enter valid payment details and submit', 'the payment is processed and a confirmation is displayed'],
      ['a payment fails', 'the system receives an error from the payment provider', 'the user sees a clear error message with retry instructions'],
      ['a subscription renewal is due', 'the billing cycle completes', 'the payment is automatically processed and the user is notified'],
    ],
    'ai-features': [
      ['a user triggers an AI action', 'the system processes the request', 'a response is generated within 10 seconds with a loading indicator shown during processing'],
      ['the AI service is unavailable', 'a user triggers an AI action', 'a graceful fallback message is displayed without breaking the UI'],
    ],
    'file-uploads': [
      ['a user selects a file to upload', 'the file is within size and type limits', 'the file is uploaded with a progress indicator and stored successfully'],
      ['a user selects a file exceeding the size limit', 'they attempt to upload', 'a clear error message is shown before upload begins'],
    ],
    'analytics': [
      ['a user performs a tracked action', 'the event is triggered', 'the analytics event is recorded with correct properties'],
      ['an admin views the analytics dashboard', 'the page loads', 'aggregated metrics for the selected time period are displayed'],
    ],
    'admin-panel': [
      ['an admin user logs in', 'they access the admin panel', 'they can view, search, and manage all users and content'],
      ['an admin performs a destructive action', 'they confirm the action', 'a confirmation dialog is shown before execution and an audit log entry is created'],
    ],
    'search': [
      ['a user types a search query', 'results begin appearing', 'relevant results are shown within 300ms of the last keystroke'],
      ['a user searches for a non-existent term', 'the search completes', 'a "no results" message with suggestions is displayed'],
    ],
    'settings': [
      ['a user opens settings', 'the page loads', 'all current preferences are displayed with their current values'],
      ['a user changes a setting and saves', 'the save completes', 'the new value is persisted and reflected immediately across the app'],
    ],
  };

  const featureBlocks = bp.features.selected.map(featureId => {
    const opt = featureOptions.find((o) => o.id === featureId);
    const featureName = opt?.name ?? lookupName(featureId);
    const featureIcon = opt?.icon ?? '•';
    
    let content = `## ${featureIcon} ${featureName}\n\n`;
    const criteria = criteriaMap[featureId];
    
    if (criteria && criteria.length > 0) {
      content += criteria.map(([given, when, then], i) => `### AC-${featureId.toUpperCase().replace(/-/g, '')}-${i + 1}\n\n- **Given** ${given}\n- **When** ${when}\n- **Then** ${then}\n`).join('\n');
    } else {
      content += `### AC-${featureId.toUpperCase().replace(/-/g, '')}-1\n\n- **Given** the ${featureName} feature is enabled\n- **When** a user accesses the ${featureName} functionality\n- **Then** the feature works as described: "${opt?.description ?? 'Feature is functional'}" without errors\n\n### AC-${featureId.toUpperCase().replace(/-/g, '')}-2\n\n- **Given** the ${featureName} feature encounters an error\n- **When** the error is handled\n- **Then** the user sees a meaningful error message and the application remains stable\n\n`;
    }
    return content;
  }).join('\n');

  return `# Acceptance Criteria — ${name}\n\n**Date:** ${today()}\n**Status:** ${bp.status === 'complete' ? 'Final' : 'Draft'}\n\n> This document defines testable acceptance criteria for every selected feature. Each criterion uses the **Given/When/Then** format for clarity.\n\n${featureBlocks}\n---\n*Generated by Blueprint Builder on ${today()}*`;
}

// ─── Document Registry ───────────────────────────────────────────────

export const documentTypes: DocumentType[] = [
  { id: 'prd', title: 'Product Requirements (PRD)', icon: '📋', description: 'Complete product requirements with features, stack, and quality specs.', generate: generatePRD },
  { id: 'readme', title: 'README', icon: '📖', description: 'Project README with badges, setup instructions, and tech stack.', generate: generateREADME },
  { id: 'api-spec', title: 'API Specification', icon: '🔌', description: 'RESTful API endpoints based on selected features.', generate: generateAPISpec },
  { id: 'database', title: 'Database Design', icon: '🗄️', description: 'Database schema with tables derived from features.', generate: generateDatabaseDesign },
  { id: 'user-stories', title: 'User Stories', icon: '👤', description: 'User stories with acceptance criteria for each feature.', generate: generateUserStories },
  { id: 'acceptance-criteria', title: 'Acceptance Criteria', icon: '✅', description: 'Testable acceptance criteria in Given/When/Then format.', generate: generateAcceptanceCriteria },
  { id: 'architecture', title: 'Architecture Overview', icon: '🏗️', description: 'System architecture diagram and technology details.', generate: generateArchitecture },
  { id: 'tasks', title: 'Task Breakdown', icon: '📝', description: 'Development task checklist organized by phase.', generate: generateTaskBreakdown },
  { id: 'testing', title: 'Testing Plan', icon: '🧪', description: 'Testing strategy with test cases per feature.', generate: generateTestingPlan },
  { id: 'deployment', title: 'Deployment Guide', icon: '🚀', description: 'Deployment instructions with env vars and checklists.', generate: generateDeploymentGuide },
  { id: 'ai-context', title: 'AI Context File', icon: '🤖', description: 'Context file for AI coding assistants.', generate: generateAIContext },
];

export function generateSingleDocument(
  blueprint: Blueprint,
  docId: string
): GeneratedDocument | null {
  const doc = documentTypes.find((d) => d.id === docId);
  if (!doc) return null;
  return {
    id: doc.id,
    title: doc.title,
    icon: doc.icon,
    description: doc.description,
    content: doc.generate(blueprint),
  };
}

export function generateDocuments(
  blueprint: Blueprint,
  selectedIds: string[]
): GeneratedDocument[] {
  return selectedIds
    .map((id) => generateSingleDocument(blueprint, id))
    .filter((d): d is GeneratedDocument => d !== null);
}
