import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

const summarySchema = z.object({
  cultureWlbSummary: z
    .array(z.string())
    .length(3)
    .describe("3 short bullet takeaways on company culture and work-life balance"),
  interviewInsights: z.object({
    typicalQuestions: z.array(z.string()).describe("2-4 commonly reported interview questions or topics"),
    difficultyScore: z.number().min(1).max(5).describe("Interview difficulty, 1 (easy) to 5 (very hard)"),
    redFlags: z.array(z.string()).describe("Any red flags mentioned, e.g. slow process, poor communication. Empty array if none found."),
  }),
  overallSentiment: z
    .enum(["Highly Positive", "Positive", "Mixed / Proceed with Caution", "Work-Life Balance Alert", "Negative"])
    .describe("Overall sentiment classification based on the reviews"),
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.3,
  apiKey: process.env.GOOGLE_API_KEY,
});

const structuredModel = model.withStructuredOutput(summarySchema);

export async function sentimentSummarizerAgent(state) {
  const { companyName, rawReviews } = state;

  // Edge case: Tavily might return nothing (obscure company, API hiccup, etc.)
  // Handle gracefully instead of sending an empty prompt to Gemini.
  if (!rawReviews || rawReviews.length === 0) {
    return {
      reviewSummary: {
        cultureWlbSummary: ["No employee review data found for this company."],
        interviewInsights: { typicalQuestions: [], difficultyScore: 0, redFlags: [] },
        overallSentiment: "Mixed / Proceed with Caution",
      },
    };
  }

  const reviewText = rawReviews
    .map((r) => `[${r.source}] ${r.title}\n${r.snippet}`)
    .join("\n\n");

  const prompt = `You are analyzing scraped employee/interview feedback about "${companyName}" from Reddit and Glassdoor.

Raw feedback snippets:
"""
${reviewText}
"""

Synthesize this into a structured culture, work-life balance, and interview summary. Base your assessment ONLY on what's actually present in the snippets above — don't invent details not supported by the text.`;

  const result = await structuredModel.invoke(prompt);

  return { reviewSummary: result };
}