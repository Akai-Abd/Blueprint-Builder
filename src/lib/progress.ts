import {
  Blueprint,
  BuilderSectionId,
  BUILDER_SECTIONS,
} from '@/types/blueprint';

// ─── Section Progress ────────────────────────────────────────────────

export interface SectionProgress {
  sectionId: BuilderSectionId;
  label: string;
  icon: string;
  completion: number; // 0-100
  filledCount: number;
  totalCount: number;
  requiredMissing: string[];
}

export function getSectionProgress(
  blueprint: Blueprint,
  sectionId: BuilderSectionId
): SectionProgress {
  const section = BUILDER_SECTIONS.find((s) => s.id === sectionId)!;
  let filled = 0;
  let total = 0;
  const requiredMissing: string[] = [];

  switch (sectionId) {
    case BuilderSectionId.ProjectBasics: {
      const fields: [string, unknown][] = [
        ['name', blueprint.basics.name],
        ['description', blueprint.basics.description],
        ['projectType', blueprint.basics.projectType],
        ['category', blueprint.basics.category],
        ['industry', blueprint.basics.industry],
        ['targetAudience', blueprint.basics.targetAudience],
        ['businessModel', blueprint.basics.businessModel],
      ];
      total = fields.length;
      for (const [name, val] of fields) {
        if (val) {
          filled++;
        } else if (section.requiredFields.includes(name)) {
          requiredMissing.push(name);
        }
      }
      break;
    }
    case BuilderSectionId.Platforms:
      total = 1;
      if (blueprint.basics.targetPlatforms.length > 0) filled = 1;
      else if (section.requiredFields.includes('targetPlatforms'))
        requiredMissing.push('targetPlatforms');
      break;

    case BuilderSectionId.Technology: {
      const cats = Object.values(blueprint.technology);
      total = cats.length;
      filled = cats.filter((a) => a.length > 0).length;
      break;
    }
    case BuilderSectionId.Features:
      total = 1;
      if (blueprint.features.selected.length > 0) filled = 1;
      break;

    case BuilderSectionId.Integrations:
      total = 1;
      if (blueprint.integrations.selected.length > 0) filled = 1;
      break;

    case BuilderSectionId.Quality: {
      const cats = Object.values(blueprint.quality);
      total = cats.length;
      filled = cats.filter((a) => a.length > 0).length;
      break;
    }
  }

  return {
    sectionId,
    label: section.label,
    icon: section.icon,
    completion: total > 0 ? Math.round((filled / total) * 100) : 0,
    filledCount: filled,
    totalCount: total,
    requiredMissing,
  };
}

// ─── Overall Progress ────────────────────────────────────────────────

export interface OverallProgress {
  percentage: number;
  sections: SectionProgress[];
  completedSections: number;
  totalSections: number;
  requiredActions: string[];
}

export function getOverallProgress(blueprint: Blueprint): OverallProgress {
  const sectionIds = BUILDER_SECTIONS.map((s) => s.id);
  const sections = sectionIds.map((id) => getSectionProgress(blueprint, id));

  const completedSections = sections.filter((s) => s.completion === 100).length;

  // Weighted average: Basics has more fields, so its weight is naturally higher
  const totalFields = sections.reduce((sum, s) => sum + s.totalCount, 0);
  const filledFields = sections.reduce((sum, s) => sum + s.filledCount, 0);
  const percentage =
    totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  const requiredActions = sections.flatMap((s) =>
    s.requiredMissing.map(
      (field) => `${s.label}: ${field} is required`
    )
  );

  return {
    percentage,
    sections,
    completedSections,
    totalSections: sections.length,
    requiredActions,
  };
}
