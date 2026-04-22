export type JobStatus = "uploaded" | "transcribed" | "analyzed" | "failed";

export type SourceType = "file" | "url";

export type SentimentLabel = "positive" | "neutral" | "negative" | "mixed";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker: string;
}

export interface TranscriptData {
  text: string;
  language: string;
  durationSeconds: number | null;
  segments: TranscriptSegment[];
  speakers: string[];
}

export interface ActionItem {
  assignee: string;
  task: string;
  dueDate: string | null;
  priority: "high" | "medium" | "low";
}

export interface SpeakerSentiment {
  speaker: string;
  sentiment: SentimentLabel;
  evidence: string;
  confidence: number;
}

export interface AnalysisData {
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  sentiments: SpeakerSentiment[];
  followUps: string[];
}

export interface JobRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  sourceType: SourceType;
  sourceName: string;
  status: JobStatus;
  transcription?: TranscriptData;
  analysis?: AnalysisData;
  error?: string;
}

export interface PurchaseRecord {
  email: string;
  createdAt: string;
  source: "stripe";
  eventId: string;
  amountCents: number | null;
  currency: string | null;
}

export interface AccessSession {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export interface StoreData {
  jobs: JobRecord[];
  purchases: PurchaseRecord[];
  sessions: AccessSession[];
  processedWebhookEvents: string[];
}
