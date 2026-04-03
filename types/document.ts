import type { RewriteTool } from "@/types/rewrite";

export type DocumentRecord = {
  id: string;
  user_id: string | null;
  title: string;
  input_text: string;
  output_text: string;
  tool: RewriteTool;
  tone: string;
  mode: string;
  word_count: number;
  human_score: number;
  created_at: string;
  updated_at: string;
};

export type DocumentVersionRecord = {
  id: string;
  document_id: string;
  version_number: number;
  input_text: string;
  output_text: string;
  tool: RewriteTool;
  tone: string;
  mode: string;
  word_count: number;
  human_score: number;
  created_at: string;
};

export type UsageLogRecord = {
  id: string;
  user_id: string | null;
  tool: RewriteTool;
  word_count: number;
  created_at: string;
};