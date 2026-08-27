# Curate

Paste a job description, get back projects you should actually build (or claim) for that role, plus a synthesized read on what it's really like to work there — pulled from real Reddit threads and Glassdoor reviews.

I built this because tailoring a resume for every application is tedious, and most "AI resume tools" either rewrite your existing bullets into corporate mush or hallucinate generic advice. I wanted something narrower: given a specific JD and company, tell me what to build to look relevant, and tell me what people who actually work there are saying, so I walk into an interview less blind.

## What it actually does right now

You paste a job description (or upload a PDF/DOCX) and the company name. Curate runs it through a pipeline that:

1. Extracts the tech stack, domain, and seniority level implied by the JD
2. Generates 3 project ideas tailored to that stack and domain, with resume-ready bullet points and matching LaTeX (Jake's Resume format, because that's the template basically everyone in tech uses)
3. Separately, searches Reddit and Glassdoor for real employee/interview experiences at that company and synthesizes them into culture notes, interview difficulty, likely questions, and red flags

The project generation and the review research happen in parallel, not sequentially — there's no reason to make the user wait for one before starting the other.

## Why it's built the way it is

**LangGraph for orchestration.** This isn't a single prompt — it's multiple LLM calls that need to happen in a specific order, with two of them running concurrently and feeding into a join point before the response goes back to the frontend. I could've hand-rolled this with `Promise.all` and a bunch of conditional logic, but LangGraph's graph model made the actual pipeline shape (branch, branch, join) explicit and easy to reason about instead of implicit in a pile of async code.

**Zod for structured output.** LLMs are unreliable narrators when you ask them for "a JSON object with these fields" in plain English. Zod schemas force the model's output into a strict shape, and if it doesn't comply, you know immediately instead of debugging a `undefined.map()` error three components downstream.

**Tavily for the review scraping**, not a custom scraper. Reddit and Glassdoor both actively fight scraping, and building/maintaining that infrastructure wasn't the point of this project. Tavily handles the search-and-retrieve part so I could focus on what to do with the results.

**Jake's Resume LaTeX format**, because if you're a CS student or new grad, you've almost certainly seen a resume built on this template. Generating content that slots directly into a format people already use beats generating content in a format they then have to convert.

**Node.js + Express backend, no separate Python service.** LangGraph has a JS port (`@langchain/langgraph`) that's solid enough for this use case, and running one language across the stack meant one less context switch and one less deployment target to manage.

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Vite over Next.js — this doesn't need SSR/routing complexity, just a fast dev loop |
| Styling | Tailwind CSS v3 | Pinned deliberately — v4 changed the PostCSS plugin architecture and broke the existing config |
| Backend | Node.js + Express | Single backend, one language across the stack |
| Orchestration | LangGraph.js | Explicit graph structure for a multi-step, partially-parallel pipeline |
| LLM | Google Gemini (`gemini-3.5-flash-lite`) | Cheapest GA tier with reliable structured output support |
| Structured output | Zod | Schema-enforced JSON from the LLM, not regex-parsed prose |
| Web search | Tavily API | Direct REST calls, no SDK — kept the dependency footprint small |
| File parsing | `pdf-parse`, `mammoth` | PDF and DOCX text extraction for the upload flow |

## Features

- Full pipeline: JD in → extraction → parallel (project generation + review research) → synthesized output
- Paste-text and file-upload (PDF/DOCX) input, both wired to the same pipeline
- Project cards with a text/LaTeX toggle, one-click copy, and an explanation of what each project actually involves and how to build it
- A Rethink button that regenerates only the project ideas while avoiding the concepts already shown, so the review research and extracted role context stay intact
- Review intelligence with sentiment, culture notes, interview intel, red flags, and linked Reddit and Glassdoor sources
- GitHub project scoring: enter a public GitHub username, select up to five of your own non-fork repositories, and score them against the role's tech stack, domain, and seniority
- GitHub scoring reads each repository's public README and returns a relevance score, reasoning, matched skills, and gaps. No GitHub login or OAuth connection is required.

## Some things that broke and why

Keeping this here mostly for my own future reference, but it might save someone else time:

- **Tailwind install pulled v4 by default**, which restructured the PostCSS plugin and broke the v3-style config already in place. Fixed by pinning `tailwindcss@^3` explicitly.
- **`GOOGLE_API_KEY` wasn't loading despite being in `.env`** — ES module imports resolve before the rest of a file executes, so anything importing the Gemini client was instantiating it before `dotenv.config()` had run. Fixed by making `import "dotenv/config"` the literal first line of the entry file.
- **Gemini model 404s** — `gemini-2.0-flash` had been deprecated, and `gemini-2.5-flash` turned out to be restricted to older accounts. Resolved by checking the API's own `ListModels` endpoint rather than trusting documentation that may be stale, and landing on `gemini-3.5-flash-lite`.
- **Tavily auth failing silently** — the initial implementation sent the API key in the request body; Tavily's current API expects a Bearer token in the `Authorization` header instead.
- **`pdf-parse` broke twice in a row** during the file-upload build. First it wouldn't import cleanly under ESM (`SyntaxError: does not provide an export named 'default'`) because it's a CommonJS package. Fixed with `createRequire`. Then, once imported, it turned out I was on `pdf-parse` v2, which replaced the old function-based API with a class (`PDFParse`) — so the whole calling convention had changed. Fixed by instantiating the class and calling `.getText()` instead of calling the module as a function.

## Running it locally

```bash
# backend
cd server
npm install
npm run dev   # runs on :5001

# frontend, separate terminal
cd client
npm install
npm run dev   # runs on :5173
```

You'll need your own API keys for Gemini and Tavily in `server/.env` — not included in the repo for obvious reasons.
