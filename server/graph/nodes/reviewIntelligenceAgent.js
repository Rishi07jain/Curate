// This node calls an external search API (Tavily), NOT an LLM.
// It's here to demonstrate: a LangGraph node can be ANY async operation —
// LLM call, API call, database query, file read, whatever. LangGraph
// doesn't care what happens inside the function, only that it takes
// state in and returns a partial state update.

async function tavilySearch(query, includeDomains) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 5,
      include_domains: includeDomains,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

export async function reviewIntelligenceAgent(state) {
  const { companyName } = state;

  // Two targeted searches, run concurrently with Promise.all
  const [redditResults, glassdoorResults] = await Promise.all([
    tavilySearch(`"${companyName}" interview experience employee review`, ["reddit.com"]),
    tavilySearch(`"${companyName}" employee reviews work life balance`, ["glassdoor.com"]),
  ]);

  const rawReviews = [
    ...redditResults.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      source: "Reddit",
    })),
    ...glassdoorResults.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      source: "Glassdoor",
    })),
  ];

  return { rawReviews };
}