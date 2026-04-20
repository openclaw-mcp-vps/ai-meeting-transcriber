import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  AnalysisResult,
  DatabaseShape,
  MeetingRecord,
  OrderRecord,
  UsageRecord
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const MONTHLY_PLAN_SECONDS = 10 * 60 * 60;

const EMPTY_DB: DatabaseShape = {
  meetings: [],
  orders: [],
  usage: []
};

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(EMPTY_DB, null, 2), "utf-8");
  }
}

function loadDb(): DatabaseShape {
  ensureDbFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");

  try {
    const parsed = JSON.parse(raw) as Partial<DatabaseShape>;
    return {
      meetings: parsed.meetings ?? [],
      orders: parsed.orders ?? [],
      usage: parsed.usage ?? []
    };
  } catch {
    return { ...EMPTY_DB };
  }
}

function saveDb(db: DatabaseShape) {
  ensureDbFile();
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tempFile, DATA_FILE);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getCurrentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function detectPlan(status: string, planHint?: string): OrderRecord["plan"] {
  const source = `${status} ${planHint ?? ""}`.toLowerCase();
  if (source.includes("monthly") || source.includes("10 hour") || source.includes("subscription")) {
    return "monthly";
  }

  return "payg";
}

export function recordOrder(input: {
  orderId: string;
  email: string;
  status: string;
  planHint?: string;
}) {
  const db = loadDb();
  const email = normalizeEmail(input.email);
  const existing = db.orders.find((order) => order.orderId === input.orderId);

  if (existing) {
    existing.email = email;
    existing.status = input.status;
    existing.updatedAt = new Date().toISOString();
    existing.plan = detectPlan(input.status, input.planHint);
  } else {
    const now = new Date().toISOString();
    db.orders.push({
      orderId: input.orderId,
      email,
      status: input.status,
      plan: detectPlan(input.status, input.planHint),
      createdAt: now,
      updatedAt: now
    });
  }

  saveDb(db);
}

export function hasPaidAccess(email: string): boolean {
  const db = loadDb();
  const normalized = normalizeEmail(email);

  return db.orders.some((order) => {
    if (order.email !== normalized) {
      return false;
    }

    const status = order.status.toLowerCase();
    return ["paid", "active", "on_trial", "processing"].some((allowed) =>
      status.includes(allowed)
    );
  });
}

export function createMeeting(input: {
  ownerEmail: string;
  sourceType: MeetingRecord["sourceType"];
  sourceName: string;
  durationSeconds: number;
  transcript: string;
}) {
  const db = loadDb();

  const meeting: MeetingRecord = {
    id: crypto.randomUUID(),
    ownerEmail: normalizeEmail(input.ownerEmail),
    createdAt: new Date().toISOString(),
    sourceType: input.sourceType,
    sourceName: input.sourceName,
    durationSeconds: input.durationSeconds,
    transcript: input.transcript,
    analysis: null
  };

  db.meetings.push(meeting);
  saveDb(db);
  return meeting;
}

export function getMeetingById(id: string) {
  const db = loadDb();
  return db.meetings.find((meeting) => meeting.id === id) ?? null;
}

export function getMeetingForOwner(id: string, ownerEmail: string) {
  const meeting = getMeetingById(id);
  if (!meeting) {
    return null;
  }

  if (meeting.ownerEmail !== normalizeEmail(ownerEmail)) {
    return null;
  }

  return meeting;
}

export function saveMeetingAnalysis(id: string, analysis: AnalysisResult) {
  const db = loadDb();
  const meeting = db.meetings.find((item) => item.id === id);

  if (!meeting) {
    return null;
  }

  meeting.analysis = analysis;
  saveDb(db);
  return meeting;
}

export function recordUsage(email: string, seconds: number) {
  const db = loadDb();
  const normalized = normalizeEmail(email);
  const month = getCurrentMonthKey();

  const usage = db.usage.find((item) => item.email === normalized && item.month === month);
  if (usage) {
    usage.secondsUsed += seconds;
  } else {
    const entry: UsageRecord = {
      email: normalized,
      month,
      secondsUsed: seconds
    };
    db.usage.push(entry);
  }

  saveDb(db);
}

export function getUsage(email: string) {
  const db = loadDb();
  const normalized = normalizeEmail(email);
  const month = getCurrentMonthKey();
  const usedSeconds =
    db.usage.find((item) => item.email === normalized && item.month === month)?.secondsUsed ?? 0;

  const activeMonthlyOrder = [...db.orders]
    .reverse()
    .find((order) => order.email === normalized && order.plan === "monthly");

  const hasMonthlyPlan = Boolean(activeMonthlyOrder);
  const includedSeconds = hasMonthlyPlan ? MONTHLY_PLAN_SECONDS : 0;

  return {
    month,
    usedSeconds,
    includedSeconds,
    overageSeconds: Math.max(0, usedSeconds - includedSeconds),
    hasMonthlyPlan
  };
}
