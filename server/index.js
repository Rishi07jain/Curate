import "dotenv/config"; // MUST be the first import — loads .env before anything else runs
import express from "express";
import cors from "cors";
import multer from "multer";
import mammoth from "mammoth";
import { createRequire } from "module";
import { curateGraph } from "./graph/graph.js";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const app = express();
app.use(cors());
app.use(express.json());

// Store the upload in memory — we only need it transiently to extract text,
// no reason to write it to disk.
const upload = multer({ storage: multer.memoryStorage() });

// Simple health check
app.get("/", (req, res) => {
  res.json({ status: "Curate backend is alive" });
});

// Accepts a .pdf or .docx file, extracts and returns plain text.
// Called by the frontend BEFORE /api/craft when the user is in Upload mode —
// the extracted text then gets fed into /api/craft exactly like Paste Text mode.
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

    res.json({ text: text.trim() });
  } catch (err) {
    console.error("Text extraction error:", err);
    res.status(500).json({ error: "Failed to extract text from the uploaded file" });
  }
});

// This is the route the frontend's "Craft My Role Intelligence" button calls.
app.post("/api/craft", async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Curate server running on http://localhost:5001`);
});