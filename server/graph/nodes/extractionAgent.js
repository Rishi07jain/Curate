import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

// zod schema = a strict contract for what shape the AI's JSON output MUST take.
// LangChain uses this to force Gemini into structured output instead of
// loose freeform text, so downstream code never has to "hope" the AI
// formatted things correctly.
const extractionSchema = z.object({
  techStack: z
    .array(z.string())
    .describe("List of core technologies, languages, frameworks, databases, and cloud tools mentioned or implied in the JD"),
  domain: z
    .string()
    .describe("The company's industry/domain, e.g. FinTech, HealthTech, E-Commerce, EdTech, CyberSecurity"),
  seniority: z
    .string()
    .describe("Seniority level implied by the JD, e.g. Intern, Junior, Mid, Senior, Staff"),
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.2, // low temperature: we want consistent extraction, not creative writing
  apiKey: process.env.GOOGLE_API_KEY,
});

// .withStructuredOutput binds our zod schema to the model, so calling it
// returns a JS object matching extractionSchema — not a raw string we'd
// have to JSON.parse and hope for the best.
const structuredModel = model.withStructuredOutput(extractionSchema);

// This is a LangGraph NODE. The signature is always the same shape:
// (state) => partial state update object
export async function extractionAgent(state) {
  const { jobDescription, companyName } = state;

  const prompt = `You are analyzing a job description for a role at "${companyName}".

Job Description:
"""
${jobDescription}
"""

Extract the core tech stack, the company's likely industry domain, and the seniority level implied by this JD.`;

  const result = await structuredModel.invoke(prompt);

  // We only return the fields THIS node is responsible for.
  // LangGraph merges this into the shared state automatically.
  return {
    techStack: result.techStack,
    domain: result.domain,
    seniority: result.seniority,
  };
}