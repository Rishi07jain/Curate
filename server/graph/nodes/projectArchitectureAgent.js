import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

const projectSchema = z.object({
  projects: z
    .array(
      z.object({
        title: z.string().describe("Punchy project title"),
        domainTagline: z
          .string()
          .describe('Short tagline pairing the project with the domain, e.g. "Distributed Ledger Reconciliation Engine — FinTech"'),
        hardSkills: z.array(z.string()).describe("Tech stack / frameworks this project demonstrates"),
        bullets: z
          .array(z.string())
          .describe(
            "2-3 resume bullet points, each a single natural fluent sentence following the XYZ principle (accomplishment + quantified impact + method) without literally using connector phrases like 'measured by' or 'by doing'"
          ),
        domainInsight: z
          .string()
          .describe("One sentence on the non-technical domain knowledge this project shows, e.g. fraud prevention, HIPAA compliance"),
      })
    )
    .length(3)
    .describe("Exactly 3 realistic, domain-specific project ideas"),
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.6, // a bit higher than extraction — we WANT creative project ideas here
  apiKey: process.env.GOOGLE_API_KEY,
});

const structuredModel = model.withStructuredOutput(projectSchema);

export async function projectArchitectureAgent(state) {
  const { techStack, domain, seniority, companyName, avoidProjects } = state;

  const avoidanceClause = avoidProjects?.length
    ? `\n\nThe candidate has already seen these project ideas and wants something genuinely different — not just renamed, but a different core concept:\n${avoidProjects
        .map((p, i) => `${i + 1}. "${p.title}" — ${p.description}`)
        .join("\n")}\nDo not propose projects that solve the same underlying problem or use the same core mechanism as any of these, even under a new name.`
    : "";

  const prompt = `You are a senior technical resume consultant helping a candidate targeting a ${seniority}-level role at "${companyName}", a company in the ${domain} domain.

Their target tech stack: ${techStack.join(", ")}.

Invent 3 realistic, impressive-but-plausible personal/academic projects that:
- Actually use this tech stack in a way specific to the ${domain} domain (not generic CRUD apps)
- Demonstrate awareness of real ${domain}-specific concerns (e.g. compliance, fraud detection, HIPAA, transaction reconciliation, latency-sensitive systems — whatever genuinely fits ${domain})
- Have bullet points that follow the XYZ principle (accomplishment, quantified impact, method) but are written as ONE natural, fluent sentence — do NOT literally include the words "measured by" or "by doing" as connectors. For example, write "Cut reconciliation errors by 40% by building an idempotent event-processing pipeline in Node.js" — NOT "Accomplished error reduction, measured by 40%, by doing by building..."
- Sound like something a strong candidate at ${seniority} level could plausibly have built${avoidanceClause}`;

  const result = await structuredModel.invoke(prompt);

  return {
    projects: result.projects,
  };
}