import { ProjectType } from '@/types/blueprint';

export interface PlatformOption {
  id: ProjectType;
  label: string;
  icon: string;
  description: string;
  examples: string[];
}

export const platformOptions: PlatformOption[] = [
  {
    id: ProjectType.Website,
    label: 'Website',
    icon: '🌐',
    description: 'Static or dynamic websites — marketing, blogs, portfolios, documentation.',
    examples: ['Landing pages', 'Blogs', 'Documentation sites', 'Portfolio'],
  },
  {
    id: ProjectType.WebApp,
    label: 'Web Application',
    icon: '💻',
    description: 'Interactive web applications with complex state, auth, and real-time features.',
    examples: ['SaaS dashboards', 'Project management', 'CRM', 'E-commerce'],
  },
  {
    id: ProjectType.Android,
    label: 'Android',
    icon: '🤖',
    description: 'Native or cross-platform Android mobile applications.',
    examples: ['Social apps', 'Fitness trackers', 'Delivery apps', 'Games'],
  },
  {
    id: ProjectType.iOS,
    label: 'iOS',
    icon: '🍎',
    description: 'Native or cross-platform iOS mobile applications.',
    examples: ['Productivity apps', 'Health apps', 'Photo editors', 'Finance'],
  },
  {
    id: ProjectType.Desktop,
    label: 'Desktop',
    icon: '🖥️',
    description: 'Cross-platform desktop applications using Electron, Tauri, or native toolkits.',
    examples: ['Code editors', 'Design tools', 'Media players', 'System utilities'],
  },
  {
    id: ProjectType.API,
    label: 'API',
    icon: '🔌',
    description: 'Backend APIs — REST, GraphQL, or gRPC services.',
    examples: ['Payment APIs', 'Data aggregation', 'Microservices', 'Webhooks'],
  },
  {
    id: ProjectType.BrowserExtension,
    label: 'Browser Extension',
    icon: '🧩',
    description: 'Browser extensions for Chrome, Firefox, or Edge.',
    examples: ['Ad blockers', 'Productivity tools', 'Password managers', 'DevTools'],
  },
  {
    id: ProjectType.AIProduct,
    label: 'AI Product',
    icon: '🤖',
    description: 'AI-powered applications leveraging LLMs, computer vision, or ML models.',
    examples: ['Chatbots', 'Content generators', 'Image editors', 'Code assistants'],
  },
  {
    id: ProjectType.CLI,
    label: 'CLI Tool',
    icon: '⌨️',
    description: 'Command-line interfaces and developer tools.',
    examples: ['Build tools', 'Package managers', 'Scaffolders', 'Automation scripts'],
  },
  {
    id: ProjectType.Custom,
    label: 'Custom / Other',
    icon: '🔧',
    description: 'Custom project type that doesn\'t fit standard categories.',
    examples: ['Embedded systems', 'IoT', 'Blockchain', 'Hardware interfaces'],
  },
];

export const industryOptions = [
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'ecommerce', label: 'E-Commerce & Retail', icon: '🛒' },
  { id: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { id: 'travel', label: 'Travel & Hospitality', icon: '✈️' },
  { id: 'food', label: 'Food & Restaurant', icon: '🍕' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'logistics', label: 'Logistics & Supply Chain', icon: '📦' },
  { id: 'social', label: 'Social Networking', icon: '👥' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'fitness', label: 'Fitness & Wellness', icon: '💪' },
  { id: 'government', label: 'Government', icon: '🏛️' },
  { id: 'nonprofit', label: 'Non-Profit', icon: '🤝' },
  { id: 'other', label: 'Other', icon: '🔧' },
];

export const categoryOptions = [
  { id: 'saas', label: 'SaaS', icon: '☁️' },
  { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
  { id: 'social-platform', label: 'Social Platform', icon: '👥' },
  { id: 'productivity', label: 'Productivity Tool', icon: '⚡' },
  { id: 'content-platform', label: 'Content Platform', icon: '📝' },
  { id: 'developer-tool', label: 'Developer Tool', icon: '🛠️' },
  { id: 'analytics', label: 'Analytics Platform', icon: '📊' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'e-commerce', label: 'E-Commerce', icon: '🛒' },
  { id: 'portfolio', label: 'Portfolio / Personal', icon: '🎨' },
  { id: 'internal-tool', label: 'Internal Tool', icon: '🔧' },
  { id: 'other', label: 'Other', icon: '📋' },
];

export const businessModelOptions = [
  { id: 'saas', label: 'SaaS (Subscription)', icon: '🔄', description: 'Monthly or yearly recurring subscription.' },
  { id: 'marketplace', label: 'Marketplace', icon: '🏪', description: 'Commission-based transactions between buyers and sellers.' },
  { id: 'ecommerce', label: 'E-Commerce', icon: '🛒', description: 'Direct product sales online.' },
  { id: 'subscription', label: 'Content Subscription', icon: '📰', description: 'Paid access to premium content.' },
  { id: 'freemium', label: 'Freemium', icon: '🆓', description: 'Free tier with paid upgrades.' },
  { id: 'ad-supported', label: 'Ad-Supported', icon: '📺', description: 'Free with advertising revenue.' },
  { id: 'open-source', label: 'Open Source', icon: '🌐', description: 'Free and open source with optional support/hosting.' },
  { id: 'enterprise', label: 'Enterprise', icon: '🏢', description: 'Custom pricing for large organizations.' },
  { id: 'custom', label: 'Custom / Hybrid', icon: '🔧', description: 'Custom business model.' },
];
