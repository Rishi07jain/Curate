// Thin wrapper around GitHub's public REST API — no auth, no OAuth,
// just fetching public repo data and README content for a given username.
// GitHub requires a User-Agent header on all requests or it 403s.

const GITHUB_HEADERS = {
  "User-Agent": "curate-app",
  Accept: "application/vnd.github+json",
};

export async function fetchPublicRepos(username) {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`,
    { headers: GITHUB_HEADERS }
  );

  if (response.status === 404) {
    throw new Error(`No GitHub user found with username "${username}"`);
  }
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}) — you may be rate-limited, try again shortly`);
  }

  const repos = await response.json();

  // Exclude forks — a scoring feature should reflect the user's own work,
  // not repos they just cloned from someone else.
  return repos
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description || "",
      language: r.language || "Unknown",
      url: r.html_url,
      updatedAt: r.updated_at,
      stars: r.stargazers_count,
    }));
}

export async function fetchReadme(fullName) {
  const response = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: GITHUB_HEADERS,
  });

  if (response.status === 404) {
    return ""; // repo has no README — not an error, just nothing to score against
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch README for ${fullName}`);
  }

  const data = await response.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
}