// This node doesn't need to DO much — by the time LangGraph runs it,
// both parallel branches (latexFormatter AND sentimentSummarizer) have
// already finished and merged their results into shared state.
// We just return an empty update; its real job is being a JOIN POINT.
export function stateAggregator(state) {
  console.log("State Aggregator: both branches complete, finalizing payload.");
  return {};
}