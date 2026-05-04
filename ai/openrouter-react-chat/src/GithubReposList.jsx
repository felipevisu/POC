export function GithubReposList({ data }) {
  if (data.ok === false) {
    return (
      <div className="item error">
        GitHub: {data.error ?? `error ${data.status ?? ""}`}
      </div>
    );
  }

  const { username, count, repos = [] } = data;

  return (
    <div className="item gh-repos">
      <div className="role">
        github · {username} · {count} repos
      </div>
      {repos.length === 0 ? (
        <div className="text">No repositories.</div>
      ) : (
        <ul className="repo-list">
          {repos.map((r) => (
            <li key={r.fullName ?? r.name} className="repo">
              <div className="repo-head">
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.name}
                </a>
                {r.isFork && <span className="tag">fork</span>}
                {r.archived && <span className="tag">archived</span>}
              </div>
              {r.description && <p className="repo-desc">{r.description}</p>}
              <div className="repo-meta">
                {r.language && <span>{r.language}</span>}
                <span>★ {r.stars ?? 0}</span>
                <span>⑂ {r.forks ?? 0}</span>
                {r.updatedAt && <span>updated {r.updatedAt.slice(0, 10)}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
