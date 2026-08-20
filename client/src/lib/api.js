import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5001",
  timeout: 30000, // 30s — the LangGraph pipeline can take 8-12s per the PRD
});