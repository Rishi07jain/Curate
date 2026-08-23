import "dotenv/config"; // MUST be the first import — loads .env before anything else runs
import express from "express";
import cors from "cors";
import multer from "multer";
import mammoth from "mammoth";
import { createRequire } from "module";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { curateGraph } from "./graph/graph.js";
import { projectArchitectureAgent } from "./graph/nodes/projectArchitectureAgent.js";
import { latexFormatterAgent } from "./graph/nodes/latexFormatterAgent.js";
import { detectCompanyName } from "./utils/detectCompanyName.js";
import { canMakeRequest, recordRequest, getUsage } from "./utils/dailyLimiter.js";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const app = express();
app.use(cors());
app.use(express.json());

// Store the upload in memory — we only need it transiently to extract text,
// no reason to write it to disk.
const upload = multer({ storage: multer.memoryStorage() });

const explainerModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.4,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Guards the Gemini/Tavily-spending routes with a shared daily cap so the
// free-tier keys don't get exhausted by public/friend usage.
function enforceDailyLimit(req, res, next) {
  if (!canMakeRequest()) {
    return res.status(429).json({
      limitReached: true,
      error:
        "Sorry — I'm running this on a free plan and have a minimum number of requests to spend per day, and today's quota is used up. Please try again tomorrow. Thanks for your patience! 🙏",
    });
  }
  recordRequest();
  next();
}

// Simple health check
app.get("/", (req, res) => {
  res.json({ status: "Curate backend is alive" });
});

// Lets you check current daily usage without spending a request.
app.get("/api/usage", (req, res) => {
  res.json(getUsage());
});

// Accepts a .pdf or .docx file, extracts text, and detects the company name
// mentioned in the JD. Not rate-limited — no Gemini/Tavily spend beyond the
// small company-detection call, and users need this just to fill the form.
app.post("/api/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { mimetype, buffer, originalname } = req.file;
    let text = "";

    if (mimetype === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      text = parsed.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const parsed = await mammoth.extractRawText({ buffer });
      text = parsed.value;
    } else {
      return res.status(400).json({
        error: `Unsupported file type: ${mimetype}. Please upload a .pdf or .docx file.`,
      });
    }

    if (!text || !text.trim()) {
      return res.status(422).json({
        error: `Couldn't extract any text from ${originalname}. The file may be scanned/image-based or empty.`,
      });
    }

    const trimmedText = text.trim();

    let detectedCompanyName = null;
    try {
      detectedCompanyName = await detectCompanyName(trimmedText);
    } catch (detectionErr) {
      console.error("Company detection error (non-fatal):", detectionErr);
    }

    res.json({ text: trimmedText, detectedCompanyName });
  } catch (err) {
    console.error("Text extraction error:", err);
    res.status(500).json({ error: "Failed to extract text from the uploaded file" });
  }
});

// This is the route the frontend's "Craft My Role Intelligence" button calls.
app.post("/api/craft", enforceDailyLimit, async (req, res) => {
  try {
    const { jobDescription, companyName, companyUrl } = req.body;

    if (!jobDescription || !companyName) {
      return res.status(400).json({ error: "jobDescription and companyName are required" });
    }

    const result = await curateGraph.invoke({
      jobDescription,
      companyName,
      companyUrl: companyUrl || "",
    });

    res.json(result);
  } catch (err) {
    console.error("Graph execution error:", err);
    res.status(500).json({ error: "Something went wrong processing your request" });
  }
});

// Regenerates JUST the projects (not reviews) using already-extracted context.
app.post("/api/rethink-projects", enforceDailyLimit, async (req, res) => {
  try {
    const { techStack, domain, seniority, companyName, avoidProjects } = req.body;

    if (!techStack || !domain || !seniority || !companyName) {
      return res.status(400).json({ error: "Missing required context for regenerating projects" });
    }

    const projectResult = await projectArchitectureAgent({
      techStack,
      domain,
      seniority,
      companyName,
      avoidProjects: avoidProjects || [],
    });

    const formattedResult = await latexFormatterAgent(projectResult);

    res.json({ formattedProjects: formattedResult.formattedProjects });
  } catch (err) {
    console.error("Rethink projects error:", err);
    res.status(500).json({ error: "Failed to regenerate projects" });
  }
});

// Generates a plain-language explanation of what a project actually is
// and how to build it.
app.post("/api/explain-project", enforceDailyLimit, async (req, res) => {
  try {
    const { project, domain } = req.body;
    if (!project) return res.status(400).json({ error: "Project details required" });

    const prompt = `Explain this resume project to someone who actually wants to BUILD it for real, not just claim it.

Project: "${project.title}" — ${project.domainTagline}
Tech stack: ${project.hardSkills.join(", ")}
Resume bullets it should support: ${project.bullets.join(" | ")}
Domain: ${domain}

In under 150 words, explain in plain, practical language:
1. What this project actually is and its core goal
2. Roughly how to build it — key components, a suggested approach, in brief

Be concrete, not marketing-speak. Plain prose, no headers or markdown.`;

    const response = await explainerModel.invoke(prompt);
    res.json({ explanation: response.content });
  } catch (err) {
    console.error("Explain project error:", err);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Curate server running on http://localhost:5001`);
});