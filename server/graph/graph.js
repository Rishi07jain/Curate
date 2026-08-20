import { StateGraph, START, END } from "@langchain/langgraph";
import { CurateState } from "./state.js";
import { extractionAgent } from "./nodes/extractionAgent.js";
import { projectArchitectureAgent } from "./nodes/projectArchitectureAgent.js";
import { latexFormatterAgent } from "./nodes/latexFormatterAgent.js";
import { reviewIntelligenceAgent } from "./nodes/reviewIntelligenceAgent.js";
import { sentimentSummarizerAgent } from "./nodes/sentimentSummarizerAgent.js";
import { stateAggregator } from "./nodes/stateAggregator.js";

const graph = new StateGraph(CurateState)
  .addNode("extraction", extractionAgent)
  .addNode("projectArchitecture", projectArchitectureAgent)
  .addNode("latexFormatter", latexFormatterAgent)
  .addNode("reviewIntelligence", reviewIntelligenceAgent)
  .addNode("sentimentSummarizer", sentimentSummarizerAgent)
  .addNode("aggregator", stateAggregator)

  .addEdge(START, "extraction")

  // FAN-OUT: extraction has TWO outgoing edges. LangGraph runs both
  // downstream branches concurrently — projectArchitecture and
  // reviewIntelligence execute in parallel, not one after another.
  .addEdge("extraction", "projectArchitecture")
  .addEdge("extraction", "reviewIntelligence")

  // Branch 1: project generation -> LaTeX formatting
  .addEdge("projectArchitecture", "latexFormatter")

  // Branch 2: review scraping -> sentiment synthesis
  .addEdge("reviewIntelligence", "sentimentSummarizer")

  // FAN-IN: both branches point to "aggregator". LangGraph automatically
  // waits for BOTH latexFormatter AND sentimentSummarizer to finish
  // before running aggregator — no manual synchronization code needed.
  .addEdge("latexFormatter", "aggregator")
  .addEdge("sentimentSummarizer", "aggregator")

  .addEdge("aggregator", END);

export const curateGraph = graph.compile();

// Current pipeline:
//                        ┌─> projectArchitecture -> latexFormatter ─┐
// START -> extraction ───┤                                          ├─> aggregator -> END
//                        └─> reviewIntelligence -> sentimentSummarizer ─┘