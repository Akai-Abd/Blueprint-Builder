import { Option, Difficulty } from '@/types/blueprint';

export const qualityOptions: Record<string, Option[]> = {
  security: [
    {
      id: 'https-ssl', name: 'HTTPS / SSL', description: 'Encrypt all traffic with TLS certificates.', category: 'security',
      bestUseCases: ['All web apps'], advantages: ['Data encryption', 'SEO benefit', 'Trust'], limitations: ['Certificate management'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Beginner, popularity: 99, recommendationScore: 98, tags: ['encryption', 'tls'],
      icon: '🔒',
    },
    {
      id: 'input-validation', name: 'Input Validation', description: 'Validate and sanitize all user inputs server-side.', category: 'security',
      bestUseCases: ['All apps with forms'], advantages: ['Prevent injection', 'Data integrity'], limitations: ['Implementation effort'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 95, recommendationScore: 95, tags: ['validation', 'xss'],
      icon: '✅',
    },
    {
      id: 'rate-limiting', name: 'Rate Limiting', description: 'Protect APIs from abuse with request rate limits.', category: 'security',
      bestUseCases: ['Public APIs', 'Auth endpoints'], advantages: ['DDoS protection', 'Abuse prevention'], limitations: ['Configuration complexity'],
      compatibleWith: ['redis'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 85, recommendationScore: 88, tags: ['api', 'protection'],
      icon: '🚦',
    },
    {
      id: 'csrf-protection', name: 'CSRF Protection', description: 'Prevent cross-site request forgery attacks.', category: 'security',
      bestUseCases: ['Apps with forms', 'Session-based auth'], advantages: ['Attack prevention'], limitations: ['Token management'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 80, recommendationScore: 85, tags: ['csrf', 'tokens'],
      icon: '🛡️',
    },
    {
      id: 'cors-config', name: 'CORS Configuration', description: 'Configure Cross-Origin Resource Sharing headers.', category: 'security',
      bestUseCases: ['APIs consumed by frontends'], advantages: ['Controlled access'], limitations: ['Debugging complexity'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Beginner, popularity: 90, recommendationScore: 90, tags: ['cors', 'headers'],
      icon: '🌐',
    },
    {
      id: 'csp', name: 'Content Security Policy (CSP)', description: 'Prevent XSS and injection attacks via strict CSP headers.', category: 'security',
      bestUseCases: ['All public web apps'], advantages: ['XSS prevention', 'Injection protection', 'Script control'], limitations: ['Complex configuration', 'Can break inline scripts'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 70, recommendationScore: 82, tags: ['csp', 'headers', 'xss'],
      icon: '🔐',
    },
    {
      id: 'two-factor-auth', name: 'Two-Factor Authentication (2FA)', description: 'Add TOTP, SMS, or hardware key second factor for user accounts.', category: 'security',
      bestUseCases: ['Finance apps', 'Enterprise', 'Admin accounts'], advantages: ['Account protection', 'Compliance', 'Trust'], limitations: ['User friction', 'Recovery flow complexity'],
      compatibleWith: ['authentication'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 72, recommendationScore: 78, tags: ['2fa', 'totp', 'mfa'],
      icon: '📲',
    },
    {
      id: 'encryption-at-rest', name: 'Data Encryption at Rest', description: 'Encrypt sensitive data in the database and file storage.', category: 'security',
      bestUseCases: ['Healthcare', 'Finance', 'PII handling'], advantages: ['Data protection', 'Compliance', 'Breach mitigation'], limitations: ['Performance overhead', 'Key management'],
      compatibleWith: ['postgresql', 'aws'], alternatives: [], difficulty: Difficulty.Advanced, popularity: 60, recommendationScore: 72, tags: ['encryption', 'data-protection', 'compliance'],
      icon: '🔏',
    },
    {
      id: 'dependency-scanning', name: 'Dependency Scanning', description: 'Automatically detect vulnerable packages with Snyk, Dependabot, or Socket.', category: 'security',
      bestUseCases: ['All projects with dependencies'], advantages: ['Vulnerability detection', 'Auto-fix PRs', 'Supply chain security'], limitations: ['False positives', 'Update fatigue'],
      compatibleWith: ['github-api', 'ci-cd'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 75, recommendationScore: 82, tags: ['dependencies', 'vulnerabilities', 'supply-chain'],
      icon: '🔍',
    },
  ],
  performance: [
    {
      id: 'code-splitting', name: 'Code Splitting', description: 'Split JavaScript bundles for faster initial page load.', category: 'performance',
      bestUseCases: ['SPAs', 'Large web apps'], advantages: ['Faster load', 'On-demand loading'], limitations: ['Build complexity'],
      compatibleWith: ['nextjs', 'react', 'vite'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 88, recommendationScore: 90, tags: ['bundle', 'loading'],
      icon: '✂️',
    },
    {
      id: 'image-optimization', name: 'Image Optimization', description: 'Compress and serve images in modern formats (WebP, AVIF).', category: 'performance',
      bestUseCases: ['Image-heavy sites', 'E-commerce'], advantages: ['Faster load', 'Bandwidth savings'], limitations: ['Build pipeline needed'],
      compatibleWith: ['nextjs', 'cloudinary'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 85, recommendationScore: 88, tags: ['images', 'optimization'],
      icon: '🖼️',
    },
    {
      id: 'caching-strategy', name: 'Caching Strategy', description: 'Implement browser, CDN, and server-side caching.', category: 'performance',
      bestUseCases: ['All web apps'], advantages: ['Reduced latency', 'Server load reduction'], limitations: ['Cache invalidation complexity'],
      compatibleWith: ['redis', 'cloudflare'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 82, recommendationScore: 85, tags: ['cache', 'cdn'],
      icon: '⚡',
    },
    {
      id: 'lazy-loading', name: 'Lazy Loading', description: 'Defer loading of off-screen content and components.', category: 'performance',
      bestUseCases: ['Content-heavy pages', 'Image galleries'], advantages: ['Faster initial load', 'Bandwidth savings'], limitations: ['Layout shift risk'],
      compatibleWith: ['react', 'nextjs'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 85, recommendationScore: 85, tags: ['loading', 'defer'],
      icon: '⏳',
    },
    {
      id: 'db-query-optimization', name: 'Database Query Optimization', description: 'Indexes, query plans, N+1 prevention, and connection pooling.', category: 'performance',
      bestUseCases: ['Data-heavy apps', 'APIs with complex queries'], advantages: ['Faster queries', 'Lower DB load', 'Scalability'], limitations: ['Requires profiling', 'Index maintenance'],
      compatibleWith: ['postgresql', 'mysql', 'prisma'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 75, recommendationScore: 82, tags: ['database', 'queries', 'indexing'],
      icon: '🗄️',
    },
    {
      id: 'edge-computing', name: 'Edge Computing', description: 'Run server logic at the edge for lower latency — Cloudflare Workers, Vercel Edge.', category: 'performance',
      bestUseCases: ['Global apps', 'Low-latency APIs', 'Personalization'], advantages: ['Lower latency', 'Global performance', 'Reduced origin load'], limitations: ['Runtime limitations', 'Cold starts', 'Debugging complexity'],
      compatibleWith: ['cloudflare', 'vercel', 'nextjs'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 58, recommendationScore: 72, tags: ['edge', 'latency', 'global'],
      icon: '🌍',
    },
    {
      id: 'web-vitals', name: 'Web Vitals Monitoring', description: 'Track Core Web Vitals (LCP, FID, CLS) in production for real user experience.', category: 'performance',
      bestUseCases: ['All public websites'], advantages: ['Real user data', 'SEO impact', 'Performance regression detection'], limitations: ['Requires instrumentation', 'Data volume'],
      compatibleWith: ['nextjs', 'sentry', 'vercel-analytics'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 68, recommendationScore: 78, tags: ['web-vitals', 'lcp', 'cls', 'real-user'],
      icon: '📏',
    },
  ],
  seo: [
    {
      id: 'meta-tags', name: 'Meta Tags & Open Graph', description: 'SEO meta tags, Open Graph, and Twitter cards for social sharing.', category: 'seo',
      bestUseCases: ['Public websites', 'Content platforms'], advantages: ['Better search ranking', 'Social previews'], limitations: ['Maintenance'],
      compatibleWith: ['nextjs'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 95, recommendationScore: 92, tags: ['meta', 'social'],
      icon: '🏷️',
    },
    {
      id: 'sitemap', name: 'Sitemap & Robots.txt', description: 'Auto-generated sitemap.xml and robots.txt for search engines.', category: 'seo',
      bestUseCases: ['All public sites'], advantages: ['Better indexing', 'Crawl control'], limitations: ['Dynamic content challenges'],
      compatibleWith: ['nextjs'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 90, recommendationScore: 90, tags: ['indexing', 'crawling'],
      icon: '🗺️',
    },
    {
      id: 'structured-data', name: 'Structured Data (JSON-LD)', description: 'Add schema.org structured data for rich search results.', category: 'seo',
      bestUseCases: ['E-commerce', 'Articles', 'Events'], advantages: ['Rich snippets', 'Better CTR'], limitations: ['Schema complexity'],
      compatibleWith: ['nextjs'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 70, recommendationScore: 78, tags: ['schema', 'rich-results'],
      icon: '📊',
    },
  ],
  accessibility: [
    {
      id: 'wcag-compliance', name: 'WCAG 2.1 Compliance', description: 'Meet Web Content Accessibility Guidelines AA standards for inclusive design.', category: 'accessibility',
      bestUseCases: ['Public websites', 'Government', 'Enterprise'], advantages: ['Legal compliance', 'Wider audience', 'Better UX for all', 'SEO benefit'], limitations: ['Design constraints', 'Testing effort'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 65, recommendationScore: 85, tags: ['wcag', 'compliance', 'standards'],
      icon: '♿',
    },
    {
      id: 'screen-reader', name: 'Screen Reader Support', description: 'ARIA labels, semantic HTML, focus management, and live regions for assistive technology.', category: 'accessibility',
      bestUseCases: ['All user-facing apps'], advantages: ['Inclusive design', 'Assistive tech support', 'Better HTML structure'], limitations: ['Testing with screen readers', 'ARIA complexity'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 55, recommendationScore: 80, tags: ['aria', 'semantic', 'screen-reader'],
      icon: '🔊',
    },
    {
      id: 'keyboard-navigation', name: 'Keyboard Navigation', description: 'Full keyboard-only interaction support — focus indicators, tab order, and shortcuts.', category: 'accessibility',
      bestUseCases: ['All interactive apps'], advantages: ['Power users', 'Accessibility', 'Mobile-friendly'], limitations: ['Focus trap management', 'Custom component complexity'],
      compatibleWith: [], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 60, recommendationScore: 82, tags: ['keyboard', 'focus', 'navigation'],
      icon: '⌨️',
    },
    {
      id: 'color-contrast', name: 'Color Contrast Checks', description: 'Automated contrast ratio validation — ensure text is readable against backgrounds.', category: 'accessibility',
      bestUseCases: ['All visual interfaces'], advantages: ['Readability', 'WCAG compliance', 'Low-vision support'], limitations: ['Design flexibility constraints'],
      compatibleWith: ['dark-mode'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 58, recommendationScore: 78, tags: ['contrast', 'color', 'readability'],
      icon: '🎨',
    },
  ],
  testing: [
    {
      id: 'unit-testing', name: 'Unit Testing', description: 'Test individual functions and components in isolation.', category: 'testing',
      bestUseCases: ['All projects'], advantages: ['Bug prevention', 'Refactoring confidence'], limitations: ['Writing time'],
      compatibleWith: ['jest', 'vitest'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 88, recommendationScore: 90, tags: ['jest', 'vitest'],
      icon: '🧪',
    },
    {
      id: 'e2e-testing', name: 'End-to-End Testing', description: 'Test full user flows in a real browser environment.', category: 'testing',
      bestUseCases: ['Critical user flows', 'Auth flows'], advantages: ['Real user simulation', 'Catch integration bugs'], limitations: ['Slow', 'Flaky tests'],
      compatibleWith: ['playwright', 'cypress'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 75, recommendationScore: 82, tags: ['playwright', 'cypress'],
      icon: '🎭',
    },
    {
      id: 'integration-testing', name: 'Integration Testing', description: 'Test component interactions, API contracts, and service boundaries.', category: 'testing',
      bestUseCases: ['APIs', 'Microservices', 'Multi-component systems'], advantages: ['Catch boundary bugs', 'Contract validation', 'API reliability'], limitations: ['Setup complexity', 'Slower than unit tests'],
      compatibleWith: ['jest', 'vitest', 'supertest'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 68, recommendationScore: 78, tags: ['integration', 'contracts', 'api'],
      icon: '🔗',
    },
    {
      id: 'visual-regression', name: 'Visual Regression Testing', description: 'Screenshot diffing to catch unintended UI changes — Chromatic, Percy, or Playwright.', category: 'testing',
      bestUseCases: ['Design systems', 'Component libraries', 'UI-heavy apps'], advantages: ['Catch visual bugs', 'Automated reviews', 'Design consistency'], limitations: ['Flaky with animations', 'Storage costs', 'Setup effort'],
      compatibleWith: ['storybook', 'playwright'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 45, recommendationScore: 62, tags: ['visual', 'screenshots', 'regression'],
      icon: '📸',
    },
    {
      id: 'load-testing', name: 'Load / Stress Testing', description: 'Simulate traffic to find performance bottlenecks — k6, Artillery, or Locust.', category: 'testing',
      bestUseCases: ['Production APIs', 'High-traffic apps', 'Pre-launch validation'], advantages: ['Find bottlenecks', 'Capacity planning', 'Performance baseline'], limitations: ['Environment setup', 'Realistic scenario design'],
      compatibleWith: ['docker'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 50, recommendationScore: 65, tags: ['load', 'stress', 'performance', 'k6'],
      icon: '📊',
    },
    {
      id: 'ci-cd', name: 'CI/CD Pipeline', description: 'Automated testing and deployment on every push.', category: 'testing',
      bestUseCases: ['All projects'], advantages: ['Automated quality', 'Fast deployments', 'Consistency'], limitations: ['Setup time'],
      compatibleWith: ['github-api', 'docker'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 85, recommendationScore: 88, tags: ['automation', 'deployment'],
      icon: '🔄',
    },
  ],
  monitoring: [
    {
      id: 'error-tracking', name: 'Error Tracking', description: 'Capture, group, and alert on application errors in production.', category: 'monitoring',
      bestUseCases: ['All production apps'], advantages: ['Early bug detection', 'Stack traces', 'User impact analysis'], limitations: ['Event volume costs'],
      compatibleWith: ['sentry', 'nodejs', 'nextjs'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 85, recommendationScore: 92, tags: ['errors', 'sentry', 'production'],
      icon: '🐛',
    },
    {
      id: 'uptime-monitoring', name: 'Uptime Monitoring', description: 'Monitor service availability with alerts, status pages, and incident management.', category: 'monitoring',
      bestUseCases: ['Production services', 'SaaS', 'APIs'], advantages: ['Early downtime detection', 'Status pages', 'SLA tracking'], limitations: ['Tool costs', 'Alert fatigue'],
      compatibleWith: ['betterstack'], alternatives: [], difficulty: Difficulty.Beginner, popularity: 78, recommendationScore: 85, tags: ['uptime', 'status-page', 'incidents'],
      icon: '📡',
    },
    {
      id: 'log-aggregation', name: 'Log Aggregation', description: 'Centralized logging for debugging — search, filter, and alert on log patterns.', category: 'monitoring',
      bestUseCases: ['Production apps', 'Microservices', 'Debugging'], advantages: ['Centralized logs', 'Pattern detection', 'Debugging'], limitations: ['Storage costs', 'Log volume'],
      compatibleWith: ['datadog', 'betterstack', 'docker'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 65, recommendationScore: 72, tags: ['logs', 'debugging', 'centralized'],
      icon: '📋',
    },
  ],
  deployment: [
    {
      id: 'containerization', name: 'Containerization', description: 'Package app in Docker containers for consistent deployments.', category: 'deployment',
      bestUseCases: ['Microservices', 'Multi-env deployments'], advantages: ['Consistency', 'Isolation', 'Scalability'], limitations: ['Learning curve'],
      compatibleWith: ['docker', 'kubernetes'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 82, recommendationScore: 80, tags: ['docker', 'containers'],
      icon: '🐳',
    },
    {
      id: 'auto-scaling', name: 'Auto-Scaling', description: 'Automatically scale resources based on demand.', category: 'deployment',
      bestUseCases: ['Variable traffic', 'Enterprise'], advantages: ['Cost optimization', 'Handle traffic spikes'], limitations: ['Configuration complexity'],
      compatibleWith: ['aws', 'vercel'], alternatives: [], difficulty: Difficulty.Advanced, popularity: 70, recommendationScore: 72, tags: ['scaling', 'cloud'],
      icon: '📈',
    },
    {
      id: 'monitoring-alerting', name: 'Monitoring & Alerting', description: 'Application monitoring, error tracking, and alerting.', category: 'deployment',
      bestUseCases: ['Production apps'], advantages: ['Early issue detection', 'Performance insights'], limitations: ['Tool costs'],
      compatibleWith: ['sentry', 'datadog'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 80, recommendationScore: 85, tags: ['monitoring', 'alerts'],
      icon: '📡',
    },
    {
      id: 'blue-green', name: 'Blue-Green Deployment', description: 'Zero-downtime deploys with instant rollback — maintain two identical environments.', category: 'deployment',
      bestUseCases: ['Production APIs', 'High-availability apps'], advantages: ['Zero downtime', 'Instant rollback', 'Testing in production'], limitations: ['Double infrastructure cost', 'Database migration complexity'],
      compatibleWith: ['docker', 'aws', 'fly-io'], alternatives: [], difficulty: Difficulty.Advanced, popularity: 52, recommendationScore: 65, tags: ['zero-downtime', 'rollback', 'production'],
      icon: '🔄',
    },
    {
      id: 'feature-flags', name: 'Feature Flags', description: 'Progressive rollouts and kill switches — LaunchDarkly, Unleash, or PostHog.', category: 'deployment',
      bestUseCases: ['SaaS', 'A/B testing', 'Progressive rollouts', 'Canary releases'], advantages: ['Safe rollouts', 'Kill switches', 'A/B testing', 'User segmentation'], limitations: ['Flag management', 'Tech debt from old flags'],
      compatibleWith: ['posthog', 'nextjs', 'nodejs'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 60, recommendationScore: 72, tags: ['feature-flags', 'rollouts', 'ab-testing'],
      icon: '🚩',
    },
    {
      id: 'iac', name: 'Infrastructure as Code', description: 'Define infrastructure with Terraform, Pulumi, or AWS CDK for reproducible environments.', category: 'deployment',
      bestUseCases: ['Multi-environment setups', 'Enterprise', 'Cloud infrastructure'], advantages: ['Reproducible', 'Version controlled', 'Team collaboration', 'Drift detection'], limitations: ['Learning curve', 'State management', 'Tool complexity'],
      compatibleWith: ['aws', 'docker'], alternatives: [], difficulty: Difficulty.Advanced, popularity: 55, recommendationScore: 62, tags: ['terraform', 'pulumi', 'iac', 'infrastructure'],
      icon: '🏗️',
    },
    {
      id: 'db-migrations', name: 'Database Migrations', description: 'Automated schema versioning — track, apply, and rollback database changes safely.', category: 'deployment',
      bestUseCases: ['All database-backed apps'], advantages: ['Schema versioning', 'Team collaboration', 'Rollback support', 'CI/CD friendly'], limitations: ['Migration complexity', 'Downtime risk for large changes'],
      compatibleWith: ['prisma', 'drizzle', 'typeorm', 'postgresql'], alternatives: [], difficulty: Difficulty.Intermediate, popularity: 78, recommendationScore: 85, tags: ['migrations', 'schema', 'database', 'versioning'],
      icon: '🔄',
    },
  ],
};

export const qualityCategories = [
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'seo', label: 'SEO', icon: '🔍' },
  { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  { id: 'testing', label: 'Testing', icon: '🧪' },
  { id: 'monitoring', label: 'Monitoring', icon: '📡' },
  { id: 'deployment', label: 'Deployment', icon: '🚀' },
] as const;
