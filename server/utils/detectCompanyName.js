import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

const companySchema = z.object({
  companyName: z
    .string()
    .nullable()
    .describe(
      "The exact name of the hiring company as stated in the job description. Null if no specific company is clearly named (e.g. anonymized postings, generic recruiter listings)."
    ),
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0, // deterministic — this is extraction, not creative generation
  apiKey: process.env.GOOGLE_API_KEY,
});

const structuredModel = model.withStructuredOutput(companySchema);

export async function detectCompanyName(jobDescriptionText) {
  const prompt = `Read the following job description and identify the exact name of the hiring company, if it is clearly and explicitly stated.

If the posting doesn't name a specific company (e.g. it's anonymized, posted by a recruiter without naming the client, or genuinely ambiguous), return null rather than guessing.

Job description:
"""
${jobDescriptionText}
"""`;

  const result = await structuredModel.invoke(prompt);
  return result.companyName;
}