import { Blueprint, BuilderSectionId } from '@/types/blueprint';
import { allTechnologies } from '@/data/options/technologies';
import { generateRecommendations } from './recommendationEngine';

// ─── Types ───────────────────────────────────────────────────────────

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type QuickAction =
  | 'suggest-stack'
  | 'whats-missing'
  | 'estimate-complexity'
  | 'suggest-description'
  | 'explain-section';

export interface QuickActionConfig {
  id: QuickAction;
  label: string;
  icon: string;
}

export const QUICK_ACTIONS: QuickActionConfig[] = [
  { id: 'suggest-stack', label: 'Suggest stack', icon: '🧠' },
  { id: 'whats-missing', label: "What's missing?", icon: '🔍' },
  { id: 'estimate-complexity', label: 'Estimate complexity', icon: '📊' },
  { id: 'suggest-description', label: 'Suggest description', icon: '✏️' },
  { id: 'explain-section', label: 'Explain this section', icon: '💡' },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function getAllSelectedTech(bp: Blueprint): string[] {
  return Object.values(bp.technology).flat();
}

function getSelectedTechNames(bp: Blueprint): string[] {
  const ids = getAllSelectedTech(bp);
  return ids
    .map((id) => allTechnologies.find((t) => t.id === id)?.name ?? id)
    .filter(Boolean);
}

function formatList(items: string[]): string {
  if (items.length === 0) return 'none';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

// ─── Response Generators ─────────────────────────────────────────────

function suggestStack(bp: Blueprint): string {
  const projectType = bp.basics.projectType;
  const audience = bp.basics.targetAudience;

  if (!projectType) {
    return "I'd need to know your project type first. Head to **Project Basics** and select a project type, then I can suggest a tailored stack.";
  }

  const stacks: Record<string, string> = {
    'web-app': `For a web application, I'd recommend:\n\n**Frontend:** Next.js + Tailwind CSS\n**Backend:** Node.js with API routes\n**Database:** PostgreSQL + Prisma ORM\n**Auth:** NextAuth.js\n**Hosting:** Vercel\n\nThis is a modern, battle-tested stack with excellent developer experience.`,
    'website': `For a website, I'd suggest:\n\n**Frontend:** Next.js (for SSR/SSG)\n**Styling:** Tailwind CSS\n**CMS:** Optional headless CMS\n**Hosting:** Vercel or Netlify\n\nThis gives you great performance, SEO, and developer productivity.`,
    'api': `For an API service, consider:\n\n**Runtime:** Node.js or Python\n**Framework:** Express/Fastify or FastAPI\n**Database:** PostgreSQL\n**ORM:** Prisma or Drizzle\n**Hosting:** Railway or Fly.io\n\nFocused on reliability and performance.`,
    'android': `For an Android app, consider:\n\n**Language:** Kotlin\n**UI:** Jetpack Compose\n**Backend:** Firebase or Node.js API\n**Database:** Firestore or PostgreSQL\n\nKotlin + Compose is Google's recommended modern stack.`,
    'ios': `For an iOS app, consider:\n\n**Language:** Swift\n**UI:** SwiftUI\n**Backend:** Firebase or Node.js API\n**Database:** Firestore or PostgreSQL\n\nSwiftUI is the modern standard for iOS development.`,
  };

  const suggestion = stacks[projectType] ?? 
    `For a **${projectType}** project, start by selecting a frontend framework and database that match your team's experience. I recommend choosing technologies your team already knows — it significantly reduces time to market.`;

  const audienceNote = audience 
    ? `\n\nSince you're targeting **${audience}**, prioritize performance and accessibility.`
    : '';

  return suggestion + audienceNote;
}

function whatsMissing(bp: Blueprint): string {
  const recommendations = generateRecommendations(bp);
  const selectedTech = getAllSelectedTech(bp);

  if (selectedTech.length === 0 && bp.features.selected.length === 0) {
    return "You haven't made any selections yet. Start by choosing your project type in **Project Basics**, then pick technologies in the **Technology** section.";
  }

  if (recommendations.length === 0) {
    return "Your blueprint looks comprehensive! I don't see any obvious gaps. You can proceed to **Review & Generate** when you're ready. 🎉";
  }

  const issues: string[] = [];

  // Group by type
  const techRecs = recommendations.filter((r) => r.type === 'technology');
  const qualityRecs = recommendations.filter((r) => r.type === 'quality');

  if (techRecs.length > 0) {
    issues.push('**Technology gaps:**');
    for (const rec of techRecs) {
      issues.push(`  • ${rec.reason}`);
    }
  }

  if (qualityRecs.length > 0) {
    issues.push('**Quality suggestions:**');
    for (const rec of qualityRecs) {
      issues.push(`  • ${rec.reason}`);
    }
  }

  return `I found **${recommendations.length}** suggestions for your blueprint:\n\n${issues.join('\n')}`;
}

function estimateComplexity(bp: Blueprint): string {
  const techCount = getAllSelectedTech(bp).length;
  const featureCount = bp.features.selected.length;
  const integrationCount = bp.integrations.selected.length;
  const qualityCount = Object.values(bp.quality).flat().length;

  if (techCount === 0 && featureCount === 0) {
    return "I can't estimate complexity without any selections. Add some technologies and features first.";
  }

  const totalItems = techCount + featureCount + integrationCount + qualityCount;

  // Complexity scoring
  let complexity: 'Low' | 'Medium' | 'High' | 'Very High';
  let weeks: string;
  let teamSize: string;

  if (totalItems <= 5) {
    complexity = 'Low';
    weeks = '2–4';
    teamSize = '1–2 developers';
  } else if (totalItems <= 12) {
    complexity = 'Medium';
    weeks = '4–8';
    teamSize = '2–3 developers';
  } else if (totalItems <= 20) {
    complexity = 'High';
    weeks = '8–16';
    teamSize = '3–5 developers';
  } else {
    complexity = 'Very High';
    weeks = '16–24+';
    teamSize = '5+ developers';
  }

  // Check for complex technologies
  const advancedTech = getAllSelectedTech(bp)
    .map((id) => allTechnologies.find((t) => t.id === id))
    .filter((t) => t && (t.difficulty === 'advanced' || t.difficulty === 'expert'));

  const advancedNote = advancedTech.length > 0
    ? `\n\n⚠️ You have **${advancedTech.length}** advanced/expert technologies selected, which adds complexity.`
    : '';

  return `## Complexity Estimate\n\n` +
    `| Metric | Value |\n|--------|-------|\n` +
    `| Complexity | **${complexity}** |\n` +
    `| Estimated Timeline | ${weeks} weeks |\n` +
    `| Suggested Team Size | ${teamSize} |\n` +
    `| Technologies | ${techCount} |\n` +
    `| Features | ${featureCount} |\n` +
    `| Integrations | ${integrationCount} |\n` +
    `| Quality Configs | ${qualityCount} |` +
    advancedNote;
}

function suggestDescription(bp: Blueprint): string {
  const name = bp.basics.name;
  const projectType = bp.basics.projectType;
  const audience = bp.basics.targetAudience;
  const techNames = getSelectedTechNames(bp);
  const featureNames = bp.features.selected.slice(0, 5);

  if (!name && !projectType) {
    return 'Set a project name and type first, then I can generate a description for you.';
  }

  const parts: string[] = [];

  if (name) parts.push(`**${name}**`);
  if (projectType) parts.push(`is a ${projectType.replace('-', ' ')}`);
  if (audience) parts.push(`designed for ${audience}`);
  if (techNames.length > 0) parts.push(`built with ${formatList(techNames)}`);
  if (featureNames.length > 0) parts.push(`featuring ${formatList(featureNames)}`);

  const description = parts.join(' ') + '.';

  return `Here's a suggested description:\n\n> ${description}\n\nFeel free to customize this in the **Project Basics** section.`;
}

function explainSection(section: BuilderSectionId): string {
  const explanations: Record<BuilderSectionId, string> = {
    [BuilderSectionId.ProjectBasics]:
      '**Project Basics** defines your project\'s identity. Set the name, description, type, and target audience. This information shapes the generated documentation and helps me make better recommendations.\n\n' +
      'The most important fields are **Project Name** and **Project Type** — everything else builds from there.',
    [BuilderSectionId.Platforms]:
      '**Platforms** specifies where your project will run. Choose target platforms like web, mobile (iOS/Android), or desktop. This influences technology recommendations — for example, choosing iOS might suggest Swift and SwiftUI.',
    [BuilderSectionId.Technology]:
      '**Technology** is where you build your stack. Choose frontend frameworks, backend runtimes, databases, ORMs, authentication providers, and hosting platforms.\n\n' +
      'Look for **⭐ Recommended** badges — these indicate technologies that pair well with your current selections.',
    [BuilderSectionId.Features]:
      '**Features** lets you pick the functionality your project needs — authentication, payments, real-time updates, file uploads, etc. Each feature generates user stories and acceptance criteria in the final documentation.',
    [BuilderSectionId.Integrations]:
      '**Integrations** connects third-party services — analytics, email providers, payment gateways, cloud storage, etc. These are documented as external dependencies in your blueprint.',
    [BuilderSectionId.Quality]:
      '**Quality** configures non-functional requirements: security, performance, SEO, accessibility, testing, and deployment strategies. These are often the most impactful for production readiness.',
  };

  return explanations[section] ?? 'This section helps you configure your project blueprint.';
}

// ─── Chat Response Handler ───────────────────────────────────────────

function handleFreeformMessage(message: string, bp: Blueprint): string {
  const lower = message.toLowerCase();

  // Pattern matching for common questions
  if (lower.includes('what') && (lower.includes('stack') || lower.includes('tech'))) {
    return suggestStack(bp);
  }
  if (lower.includes('miss') || lower.includes('gap') || lower.includes('forgot')) {
    return whatsMissing(bp);
  }
  if (lower.includes('complex') || lower.includes('estimate') || lower.includes('time') || lower.includes('long')) {
    return estimateComplexity(bp);
  }
  if (lower.includes('descri') || lower.includes('summary')) {
    return suggestDescription(bp);
  }
  if (lower.includes('recommend') || lower.includes('suggest')) {
    return suggestStack(bp);
  }

  // Look for technology questions
  const techMatch = allTechnologies.find(
    (t) => lower.includes(t.name.toLowerCase()) || lower.includes(t.id.toLowerCase()),
  );
  if (techMatch) {
    return `## ${techMatch.icon ?? ''} ${techMatch.name}\n\n${techMatch.description}\n\n` +
      `**Best for:** ${formatList(techMatch.bestUseCases)}\n\n` +
      `**Difficulty:** ${techMatch.difficulty} | **Popularity:** ${techMatch.popularity}%\n\n` +
      `**Advantages:** ${formatList(techMatch.advantages)}\n\n` +
      `**Limitations:** ${formatList(techMatch.limitations)}`;
  }

  return "I can help you with stack suggestions, identify gaps in your blueprint, estimate complexity, or explain any technology option. Try asking me something specific, or use the quick actions below! 💡";
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Process a user message or quick action and return an assistant response.
 * Simulates async delay for natural feel.
 */
export async function getAssistantResponse(
  input: string | QuickAction,
  blueprint: Blueprint,
  activeSection: BuilderSectionId,
  apiKey?: string,
  provider?: string,
  modelId?: string,
): Promise<string> {
  // Quick actions
  switch (input) {
    case 'suggest-stack':
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));
      return suggestStack(blueprint);
    case 'whats-missing':
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));
      return whatsMissing(blueprint);
    case 'estimate-complexity':
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));
      return estimateComplexity(blueprint);
    case 'suggest-description':
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));
      return suggestDescription(blueprint);
    case 'explain-section':
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));
      return explainSection(activeSection);
    default:
      if (apiKey && apiKey.trim() !== '') {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blueprint,
              messages: [{ role: 'user', content: input }],
              apiKey,
              provider,
              modelId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            return data.text;
          }
        } catch (e) {
          console.error("Failed to hit chat API, falling back to local handler", e);
        }
      }
      
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));
      return handleFreeformMessage(input, blueprint);
  }
}

/**
 * Get a contextual greeting based on the current section.
 */
export function getContextualGreeting(section: BuilderSectionId): string {
  const greetings: Record<BuilderSectionId, string> = {
    [BuilderSectionId.ProjectBasics]:
      "👋 Hi! I'm your AI assistant. Start by telling me about your project — set a name and choose a project type. I'll help with suggestions along the way.",
    [BuilderSectionId.Platforms]:
      "🖥️ Choose the platforms you want to target. I can help you understand the tradeoffs between different platform choices.",
    [BuilderSectionId.Technology]:
      '⚙️ Time to build your stack! Look for ⭐ **Recommended** badges on options that pair well with your selections. Ask me about any technology to learn more.',
    [BuilderSectionId.Features]:
      '✨ Select the features your project needs. I can help identify features you might be missing based on your project type.',
    [BuilderSectionId.Integrations]:
      '🔗 Connect external services. I can suggest integrations that work well with your selected technologies.',
    [BuilderSectionId.Quality]:
      "🛡️ Don't skip quality! Security, testing, and monitoring are critical for production apps. Ask me what's missing.",
  };
  return greetings[section];
}
