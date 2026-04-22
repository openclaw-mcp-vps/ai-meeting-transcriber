import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  AccessSession,
  AnalysisData,
  JobRecord,
  SourceType,
  StoreData,
  TranscriptData,
} from "@/lib/types";

const STORE_DIRECTORY = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIRECTORY, "store.json");

const DEFAULT_STORE: StoreData = {
  jobs: [],
  purchases: [],
  sessions: [],
  processedWebhookEvents: [],
};

let mutationQueue: Promise<void> = Promise.resolve();

async function ensureStoreExists(): Promise<void> {
  await fs.mkdir(STORE_DIRECTORY, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
}

async function readStore(): Promise<StoreData> {
  await ensureStoreExists();
  const raw = await fs.readFile(STORE_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      processedWebhookEvents: Array.isArray(parsed.processedWebhookEvents)
        ? parsed.processedWebhookEvents
        : [],
    };
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

async function writeStore(store: StoreData): Promise<void> {
  await ensureStoreExists();
  const tempPath = `${STORE_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tempPath, STORE_PATH);
}

async function mutateStore<T>(mutator: (store: StoreData) => Promise<T> | T): Promise<T> {
  const run = mutationQueue.then(async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return result;
  });

  mutationQueue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}

export async function createJob(input: { sourceType: SourceType; sourceName: string }): Promise<JobRecord> {
  const now = new Date().toISOString();
  const job: JobRecord = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    sourceType: input.sourceType,
    sourceName: input.sourceName,
    status: "uploaded",
  };

  return mutateStore((store) => {
    store.jobs.unshift(job);
    return job;
  });
}

export async function updateJobTranscription(id: string, transcription: TranscriptData): Promise<void> {
  await mutateStore((store) => {
    const job = store.jobs.find((record) => record.id === id);
    if (!job) {
      throw new Error("Job not found.");
    }

    job.transcription = transcription;
    job.status = "transcribed";
    job.updatedAt = new Date().toISOString();
    delete job.error;
  });
}

export async function updateJobAnalysis(id: string, analysis: AnalysisData): Promise<void> {
  await mutateStore((store) => {
    const job = store.jobs.find((record) => record.id === id);
    if (!job) {
      throw new Error("Job not found.");
    }

    job.analysis = analysis;
    job.status = "analyzed";
    job.updatedAt = new Date().toISOString();
    delete job.error;
  });
}

export async function markJobFailed(id: string, message: string): Promise<void> {
  await mutateStore((store) => {
    const job = store.jobs.find((record) => record.id === id);
    if (!job) {
      return;
    }

    job.status = "failed";
    job.error = message;
    job.updatedAt = new Date().toISOString();
  });
}

export async function getJobById(id: string): Promise<JobRecord | null> {
  const store = await readStore();
  const job = store.jobs.find((record) => record.id === id);
  return job ?? null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function recordStripePurchase(input: {
  email: string;
  eventId: string;
  amountCents: number | null;
  currency: string | null;
}): Promise<void> {
  await mutateStore((store) => {
    if (store.processedWebhookEvents.includes(input.eventId)) {
      return;
    }

    store.processedWebhookEvents.push(input.eventId);

    store.purchases.unshift({
      email: normalizeEmail(input.email),
      createdAt: new Date().toISOString(),
      source: "stripe",
      eventId: input.eventId,
      amountCents: input.amountCents,
      currency: input.currency,
    });
  });
}

export async function hasPaidAccess(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const store = await readStore();
  return store.purchases.some((purchase) => purchase.email === normalized);
}

function removeExpiredSessions(sessions: AccessSession[]): AccessSession[] {
  const now = Date.now();
  return sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
}

export async function createAccessSession(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const token = crypto.randomBytes(32).toString("hex");

  await mutateStore((store) => {
    store.sessions = removeExpiredSessions(store.sessions);

    store.sessions.push({
      token,
      email: normalized,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    });
  });

  return token;
}

export async function validateAccessSession(token: string): Promise<{ email: string } | null> {
  const store = await readStore();
  const activeSessions = removeExpiredSessions(store.sessions);

  if (activeSessions.length !== store.sessions.length) {
    await mutateStore((innerStore) => {
      innerStore.sessions = removeExpiredSessions(innerStore.sessions);
    });
  }

  const session = activeSessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  return { email: session.email };
}

export async function revokeAccessSession(token: string): Promise<void> {
  await mutateStore((store) => {
    store.sessions = store.sessions.filter((session) => session.token !== token);
  });
}
