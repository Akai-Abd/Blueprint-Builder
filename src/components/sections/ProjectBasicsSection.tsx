'use client';

import { useBlueprintStore } from '@/stores/blueprintStore';
import { BusinessModel, ProjectType } from '@/types/blueprint';
import {
  platformOptions,
  industryOptions,
  categoryOptions,
  businessModelOptions,
} from '@/data/options/platforms';
import TextInput from '@/components/questions/TextInput';
import SingleSelect from '@/components/questions/SingleSelect';

export default function ProjectBasicsSection() {
  const basics = useBlueprintStore((s) => s.blueprint.basics);
  const setProjectName = useBlueprintStore((s) => s.setProjectName);
  const setProjectDescription = useBlueprintStore((s) => s.setProjectDescription);
  const setCategory = useBlueprintStore((s) => s.setCategory);
  const setIndustry = useBlueprintStore((s) => s.setIndustry);
  const setProjectType = useBlueprintStore((s) => s.setProjectType);
  const setTargetAudience = useBlueprintStore((s) => s.setTargetAudience);
  const setBusinessModel = useBlueprintStore((s) => s.setBusinessModel);

  return (
    <div className="section animate-fade-in">
      <div className="section__header">
        <h2 className="section__title">Project Basics</h2>
        <p className="section__description">
          Define your project&apos;s identity, purpose, and target audience. This information shapes
          the recommendations and documentation generated later.
        </p>
      </div>

      {/* Project Name */}
      <TextInput
        id="project-name"
        label="Project Name"
        required
        value={basics.name}
        onChange={setProjectName}
        placeholder="e.g., TaskFlow, ShopVerse, DevDash"
        maxLength={60}
      />

      {/* Description */}
      <TextInput
        id="project-desc"
        label="Project Description"
        value={basics.description}
        onChange={setProjectDescription}
        placeholder="Describe what your project does, who it's for, and what problem it solves..."
        maxLength={500}
        multiline
      />

      {/* Project Type */}
      <div className="section__group">
        <h3 className="section__group-title">
          <span className="section__group-icon">🎯</span>
          Project Type <span className="form-label__required">*</span>
        </h3>
        <SingleSelect
          options={platformOptions.map((opt) => ({
            id: opt.id,
            label: opt.label,
            icon: opt.icon,
          }))}
          value={basics.projectType}
          onChange={(id) => setProjectType(id as ProjectType)}
        />
      </div>

      {/* Category */}
      <div className="section__group">
        <h3 className="section__group-title">
          <span className="section__group-icon">📂</span>
          Project Category
        </h3>
        <SingleSelect
          options={categoryOptions}
          value={basics.category}
          onChange={setCategory}
        />
      </div>

      {/* Industry */}
      <div className="section__group">
        <h3 className="section__group-title">
          <span className="section__group-icon">🏢</span>
          Industry
        </h3>
        <SingleSelect
          options={industryOptions}
          value={basics.industry}
          onChange={setIndustry}
        />
      </div>

      {/* Target Audience */}
      <TextInput
        id="target-audience"
        label="Target Audience"
        value={basics.targetAudience}
        onChange={setTargetAudience}
        placeholder="e.g., Small business owners, Developers, Students"
      />

      {/* Business Model */}
      <div className="section__group">
        <h3 className="section__group-title">
          <span className="section__group-icon">💰</span>
          Business Model
        </h3>
        <SingleSelect
          options={businessModelOptions}
          value={basics.businessModel}
          onChange={(id) => setBusinessModel(id as BusinessModel)}
        />
      </div>
    </div>
  );
}
