interface Props {
  tags: string[];
  active: string | null;
  onChange: (tag: string | null) => void;
}

/** Story #62 — die Akte nach einem eigenen Tag filtern. Ohne Tags unsichtbar. */
export function EvidenceTagFilter({ tags, active, onChange }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="evidence-tags__filter" role="group" aria-label="Nach Tag filtern">
      <span className="team-code__label" style={{ margin: 0 }}>
        Tags
      </span>
      {tags.map((tag) => (
        <button
          key={tag}
          aria-pressed={active === tag}
          className={active === tag ? "evidence-tags__chip evidence-tags__chip--on" : "evidence-tags__chip"}
          onClick={() => onChange(active === tag ? null : tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
