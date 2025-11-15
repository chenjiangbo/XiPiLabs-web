"use client";

import { allSections } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";

type SectionDoc = (typeof allSections)[number];

export default function SectionBlock({ section }: { section: SectionDoc }) {
  const MDXContent = useMDXComponent(section.body.code);
  return (
    <section className="content-section" id={section.slug.replace('sections/', '')} data-section={section.slug.replace('sections/', '')}>
      <div className="content-section__inner">
        <header className="content-section__header">
          {section.summary ? <span className="content-section__badge">{section.summary}</span> : null}
          <h2>{section.title}</h2>
        </header>
        <div className="content-section__surface">
          <MDXContent />
        </div>
      </div>
    </section>
  );
}
