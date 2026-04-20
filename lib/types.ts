export type Priority = "high" | "medium" | "low";
export type SentimentLabel = "positive" | "neutral" | "negative" | "mixed";

export interface ActionItem {
  owner: string;
  task: string;
  dueDate: string | null;
  priority: Priority;
}

export interface SpeakerSentiment {
  speaker: string;
  sentiment: SentimentLabel;
  rationale: string;
  confidence: number;
}

export interface AnalysisResult {
  summary: string;
  actionItems: ActionItem[];
  sentiments: SpeakerSentiment[];
}

export interface MeetingRecord {
  id: string;
  ownerEmail: string;
  createdAt: string;
  sourceType: "file" | "url";
  sourceName: string;
  durationSeconds: number;
  transcript: string;
  analysis: AnalysisResult | null;
}

export interface OrderRecord {
  orderId: string;
  email: string;
  status: string;
  plan: "monthly" | "payg";
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  email: string;
  month: string;
  secondsUsed: number;
}

export interface DatabaseShape {
  meetings: MeetingRecord[];
  orders: OrderRecord[];
  usage: UsageRecord[];
}
