const axios = require('axios');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const callGroq = async (messages, { temperature, max_tokens }) => {
  if (!env.groq.apiKey) {
    throw new ApiError(503, 'Drishti Copilot is not configured — missing GROQ_API_KEY.');
  }
  try {
    const { data } = await axios.post(
      GROQ_URL,
      { model: env.groq.model, temperature, max_tokens, messages },
      {
        headers: {
          Authorization: `Bearer ${env.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new ApiError(502, 'Groq returned an empty response.');
    }
    return text;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.response) {
      const message = err.response.data?.error?.message || 'Groq request failed';
      throw new ApiError(502, `LLM service error: ${message}`);
    }
    throw new ApiError(503, 'LLM service is currently unavailable.');
  }
};

// ============================================================
// Drishti Copilot chat
// ============================================================
// Mirrors the grounding rules already used by ml_engine's offline investigation
// report generator (ml_engine/notebooks/generate_grounded_llm_explanations_v3.py):
// stay strictly evidence-based, never assert wrongdoing, flag uncertainty.
const COPILOT_SYSTEM_PROMPT = `You are Drishti Copilot, an AI assistant embedded in MPLADS Drishti — India's MPLADS (Members of Parliament Local Area Development Scheme) project transparency and AI risk-monitoring platform.

You answer questions from government officials (MoSPI admins, MPs, District Nodal officers) about MPLADS project risk, spending, and investigation status, using ONLY the DATA CONTEXT given after the question.

Rules you must follow:
1. Base every factual claim strictly on the DATA CONTEXT. Never invent project IDs, contractor names, people, or figures that are not present in it.
2. Never assert that a specific project, contractor, or person has committed fraud, corruption, or any wrongdoing. Use cautious, evidence-based language: "flagged for review", "risk indicator", "requires verification" — never "guilty", "fraudulent", "embezzled".
3. The DATA CONTEXT is already scoped to what this user is authorized to see. Do not claim broader access than what's given, and do not speculate about data outside that scope.
4. If the question cannot be answered from the DATA CONTEXT, say so plainly rather than guessing.
5. Be concise — a few sentences or a short list. Reference concrete numbers from the context where relevant.
6. The chat UI renders plain text only, not Markdown. Do not use **bold**, tables, or "|" characters — write plain sentences, and use simple "- " bullet lines or "1. " numbered lines for lists.`;

const buildCopilotMessage = (query, context) =>
  `DATA CONTEXT (scope: ${context.scope}):\n${JSON.stringify(context, null, 2)}\n\nQUESTION: ${query}`;

const askCopilot = async (query, context) => {
  if (!query || !query.trim()) {
    throw ApiError.badRequest('A question is required.');
  }
  const text = await callGroq(
    [
      { role: 'system', content: COPILOT_SYSTEM_PROMPT },
      { role: 'user', content: buildCopilotMessage(query, context) },
    ],
    { temperature: 0.3, max_tokens: 600 }
  );
  return { text };
};

// ============================================================
// Live investigation-report generation
// ============================================================
// Only 20 of 175 queued investigations have a pre-generated report (the
// offline batch script in ml_engine/notebooks/ hasn't been run against the
// rest — see project_investigation_reports.csv). For everything else,
// ml.service.js falls back to generating one here, on demand, in the same
// grounded style as the offline script.
const REPORT_SYSTEM_PROMPT = `You are the AI investigation-report generator for MPLADS Drishti, India's MPLADS project risk-monitoring platform. You write a structured report explaining why a specific project was flagged by the AI risk engines, for a government investigator to review.

Rules:
1. Use ONLY the PROJECT EVIDENCE given after this prompt. Never invent facts, names, or figures not present in it.
2. Do not invent connections between risk engines or claim causes not supported by the evidence.
3. Never assert that the project, its contractor, or any person committed fraud, corruption, or any wrongdoing. Use cautious language: "risk indicator", "requires verification", "flagged for review".
4. Write plain text only — no Markdown (no **, no |, no # headers). Use short section titles in capital letters followed by a colon, and "- " for bullet points.
5. Structure the report with these sections, in order: WHY THIS PROJECT WAS FLAGGED, INVESTIGATION PRIORITIES (with High/Medium/Low sub-lines), RECOMMENDED NEXT STEPS, FINAL ASSESSMENT.
6. The FINAL ASSESSMENT section must include, verbatim: "The detected anomalies are risk indicators requiring verification and do not independently establish wrongdoing."
7. Be professional, factual, and concise — this is an official document.`;

// Persistence/caching lives in ml.service.js (Supabase's investigation_reports
// table, see database/data_schema.sql) — this stays a pure "call Groq" function.
const generateInvestigationReport = async (raw) => {
  const workId = raw.work_id || raw.workId;

  const evidence = {
    workId,
    state: raw.state,
    constituency: raw.constituency,
    workDescription: raw.work_description,
    finalRiskScore: raw.final_ai_risk_score ?? raw.riskScore,
    finalRiskLevel: raw.final_ai_risk_level ?? raw.riskLevel,
    primaryRiskSource: raw.primary_risk_source ?? raw.primarySignal,
    detectingEngines: raw.detecting_engines,
    activeRiskEngines: raw.active_risk_engines,
    availableRiskEngines: raw.available_risk_engines,
    financialRiskLevel: raw.financial_risk_level,
    statisticalAnomalyLevel: raw.statistical_anomaly_level,
    riskDetectionConfidence: raw.risk_detection_confidence ?? raw.confidence,
    investigationPriority: raw.investigation_priority_category ?? raw.priority,
    verifiedObservations: raw.verified_observations,
  };

  const text = await callGroq(
    [
      { role: 'system', content: REPORT_SYSTEM_PROMPT },
      { role: 'user', content: `PROJECT EVIDENCE:\n${JSON.stringify(evidence, null, 2)}\n\nWrite the investigation report for this project.` },
    ],
    // 700 tokens was too tight — real responses were being cut off before ever
    // reaching the mandatory FINAL ASSESSMENT disclaimer (rule 6 above).
    { temperature: 0.2, max_tokens: 1100 }
  );

  const DISCLAIMER = 'The detected anomalies are risk indicators requiring verification and do not independently establish wrongdoing.';
  // Defensive: models can drop instructions even with headroom, and this
  // disclaimer isn't optional for a tool that names specific government
  // projects. Guarantee it's present rather than trusting compliance alone.
  const finalText = text.includes(DISCLAIMER) ? text : `${text}\n\nFINAL ASSESSMENT:\n${DISCLAIMER}`;

  return { text: finalText };
};

module.exports = { askCopilot, generateInvestigationReport };
