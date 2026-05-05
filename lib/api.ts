import type {
  AuthSession,
  AnalysisResult,
  BackendObligation,
  BackendRisk,
  BackendAction,
  BackendProcessResponse,
  Priority,
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// ── Error type ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

// ── Internal fetch wrapper ─────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function redeemCode(
  inviteCode: string,
): Promise<{ token: string; remainingRuns: number }> {
  return apiFetch('/auth/redeem-code', {
    method: 'POST',
    body: JSON.stringify({ inviteCode }),
  });
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function createDemoUser(): Promise<{ id: string }> {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Demo User',
      email: 'demo@regulapilot.app',
      role: 'compliance-officer',
    }),
  });
}

// ── Documents ──────────────────────────────────────────────────────────────

async function createDocument(
  content: string,
  userId: string,
  token: string,
): Promise<{ id: string }> {
  return apiFetch('/documents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: `Document ${new Date().toLocaleString()}`,
      content,
      fileType: 'text',
      uploadedByUserId: userId,
    }),
  });
}

async function processDocument(
  documentId: string,
  token: string,
): Promise<BackendProcessResponse> {
  return apiFetch(`/documents/${documentId}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── High-level: analyse document ───────────────────────────────────────────

function mapToAnalysisResult(
  obligations: BackendObligation[],
  risks: BackendRisk[],
  actions: BackendAction[],
): AnalysisResult {
  const highCount = obligations.filter((o) => o.priority === 'high').length;

  const summary = [
    `Found ${obligations.length} obligation${obligations.length !== 1 ? 's' : ''}`,
    `${risks.length} risk${risks.length !== 1 ? 's' : ''}`,
    `and ${actions.length} action${actions.length !== 1 ? 's' : ''}.`,
    highCount > 0
      ? `${highCount} high-priority item${highCount !== 1 ? 's' : ''} require immediate attention.`
      : 'No high-priority items detected.',
  ].join(', ').replace(', and', ' and');

  const mappedObligations = obligations.map((o) => ({
    id: o.id,
    title: o.title,
    owner: o.ownerUserId ?? 'Unassigned',
    priority: o.priority as Priority,
    dueDate: o.dueDate
      ? new Date(o.dueDate).toLocaleDateString('en-GB')
      : 'TBD',
    sourceExcerpt: o.sourceQuote,
  }));

  const riskFlags = risks.map((r, i) => ({
    id: `risk-${i}`,
    title: r.text.length > 80 ? `${r.text.slice(0, 80)}…` : r.text,
    description: r.text,
    severity: r.severity as Priority,
  }));

  const recommendedActions = actions.map((a) => a.text);

  return { summary, obligations: mappedObligations, riskFlags, recommendedActions };
}

export interface AnalyseDocumentResult {
  analysisResult: AnalysisResult;
  remainingRuns: number;
}

export async function analyseDocument(
  text: string,
  session: AuthSession,
): Promise<AnalyseDocumentResult> {
  const doc = await createDocument(text, session.userId, session.token);
  const processed = await processDocument(doc.id, session.token);

  const analysisResult = mapToAnalysisResult(
    processed.obligations,
    processed.risks ?? [],
    processed.actions ?? [],
  );

  return {
    analysisResult,
    remainingRuns: processed.remainingRuns ?? session.remainingRuns - 1,
  };
}
