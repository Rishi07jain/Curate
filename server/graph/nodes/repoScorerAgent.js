import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

const scoreSchema = z.object({
  score: z.number().min(0).max(100).describe("Relevance score from 0-100"),
  reasoning: z.string().describe("2-3 sentence explanation of the score"),
  matchedSkills: z.array(z.string()).describe("Tech/skills this repo demonstrates that overlap with the JD"),
  gaps: z.array(z.string()).describe("What the JD asks for that this repo doesn't demonstrate"),
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.2, // scoring should be fairly consistent, not creative
  apiKey: process.env.GOOGLE_API_KEY,
});

const structuredModel = model.withStructuredOutput(scoreSchema);

export async function scoreRepoAgainstJD({ repoName, repoDescription, readmeText, techStack, domain, seniority }) {
  const readmeExcerpt = readmeText
    ? readmeText.slice(0, 3000) // cap length — don't need the whole README, just enough signal
    : "(No README available — score based on repo name/description only, and note this limits confidence.)";

  const prompt = `You are evaluating how relevant a candidate's GitHub project is for a specific job.

Target role context:
- Tech stack required: ${techStack.join(", ")}
- Domain: ${domain}
- Seniority: ${seniority}

Repo being evaluated:
- Name: ${repoName}
- Description: ${repoDescription || "(none provided)"}
- README content:
"""
${readmeExcerpt}
"""

Score this repo's relevance to the target role from 0-100, based on:
- Tech stack overlap (does it use the technologies this role needs?)
- Thematic/domain fit (does its subject matter relate to ${domain}?)
- Depth of what's demonstrated (is this a substantial project or a toy/tutorial clone?)

Be honest and calibrated — most projects are NOT a perfect match, and a mediocre score is a normal, useful outcome. Don't inflate scores to be encouraging.`;

  const result = await structuredModel.invoke(prompt);
  return result;
}