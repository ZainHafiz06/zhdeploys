import { Link } from "react-router-dom";
import type { Project } from "../../content/types";

/** Metadata rail. Every field is optional and simply omitted when empty. */
export function ChapterMeta({ project }: { project: Project }) {
  const rows: Array<[string, string]> = [];
  if (project.year) rows.push(["Year", project.year]);
  if (project.type) rows.push(["Type", project.type]);
  if (project.role) rows.push(["Role", project.role]);
  if (project.status) rows.push(["Status", project.status]);
  if (project.stack.length) rows.push(["Stack", project.stack.join(" · ")]);

  return (
    <div className="meta">
      {rows.length > 0 && (
        <dl className="meta-grid">
          {rows.map(([k, v]) => (
            <div className="meta-row" key={k}>
              <dt className="u-label">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="meta-links">
        <Link className="meta-link" to={`/work/${project.slug}`} data-cursor="OPEN">
          Chapter detail
        </Link>
        {project.externalUrl && (
          <a className="meta-link" href={project.externalUrl} target="_blank" rel="noreferrer" data-cursor="OPEN">
            Live
          </a>
        )}
        {project.githubUrl && (
          <a className="meta-link" href={project.githubUrl} target="_blank" rel="noreferrer" data-cursor="OPEN">
            Repository
          </a>
        )}
        {project.caseStudyUrl && (
          <a className="meta-link" href={project.caseStudyUrl} target="_blank" rel="noreferrer" data-cursor="OPEN">
            Case study
          </a>
        )}
      </div>
    </div>
  );
}
