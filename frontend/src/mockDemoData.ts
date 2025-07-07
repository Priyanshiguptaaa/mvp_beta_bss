// Mock data for full EchoSysAI demo flow

export const mockTests = [
  {
    id: "4",
    name: "Demo Test: Enrichment + Scoring",
    status: "failed" as const,
    timestamp: "2025-05-13T06:40:00Z",
    agent: "Scoring Agent",
    version: "1.3.0",
    instruction: "Check if the Scoring Agent uses webinar activity + CRM history to rate lead intent.",
    schedule: "One-time (May 13, 2025 – 06:40 AM)",
    lastRun: "May 13, 6:40 AM",
    environments: ["Production"],
    incidentId: "91",
    date: new Date(2025, 4, 13, 6, 40),
    severity: "high",
    environment: "Production",
    history: [
      {
        id: "run-4-v1",
        timestamp: "May 13, 2025, 6:00 AM",
        agentVersion: "1.2.1",
        status: "failed" as const,
        promptBefore: "Score using internal CRM and Clearbit data. Consider funding, role, and engagement.",
        promptAfter: "Score using webinar activity, CRM signals, and enrichment. Weight intent heavier.",
        settingsBefore: {
          "Temperature": "0.7",
          "Max tokens": "150",
          "Top_p": "0.9"
        },
        settingsAfter: {
          "Temperature": "0.8",
          "Max tokens": "200",
          "Top_p": "0.95"
        }
      },
      {
        id: "run-4-v2",
        timestamp: "May 13, 2025, 6:40 AM",
        agentVersion: "1.3.0",
        status: "failed" as const,
        promptBefore: "Score using webinar activity, CRM signals, and enrichment. Weight intent heavier.",
        promptAfter: "Score using webinar activity, CRM signals, and enrichment. Weight intent heavier.",
        settingsBefore: {
          "Temperature": "0.8",
          "Max tokens": "200",
          "Top_p": "0.95"
        },
        settingsAfter: {
          "Temperature": "0.8",
          "Max tokens": "200",
          "Top_p": "0.95"
        }
      }
    ]
  },
  {
    id: "1",
    name: "Initial Outreach Persona Gen",
    status: "passed" as const,
    timestamp: "2025-05-12T06:00:00Z",
    agent: "Persona Agent",
    version: "1.1.0",
    instruction: "Check persona generation for outreach.",
    schedule: "Daily @ 6:00 AM",
    lastRun: "May 12, 6:00 AM",
    environments: ["Production"],
    incidentId: undefined,
    date: new Date(2025, 4, 12),
    severity: "low",
    environment: "Production",
    history: []
  },
  {
    id: "2",
    name: "Lead Scoring Sanity Test",
    status: "failed" as const,
    timestamp: "2025-05-13T06:00:00Z",
    agent: "Scoring Agent",
    version: "1.2.1",
    instruction: "Check if Scoring Agent uses CRM, Clearbit, and webinar data.",
    schedule: "Daily @ 6:00 AM",
    lastRun: "May 13, 6:00 AM",
    environments: ["Production"],
    incidentId: "91",
    date: new Date(2025, 4, 13),
    severity: "high",
    environment: "Production",
    history: []
  },
  {
    id: "3",
    name: "Email Generation Style Check",
    status: "passed" as const,
    timestamp: "2025-05-13T06:00:00Z",
    agent: "Email Generator",
    version: "1.2.0",
    instruction: "Check email style and tone.",
    schedule: "Daily @ 6:00 AM",
    lastRun: "May 13, 6:00 AM",
    environments: ["Production"],
    incidentId: undefined,
    date: new Date(2025, 4, 13),
    severity: "low",
    environment: "Production",
    history: []
  }
];

export const mockPromptComparison = {
  agent: "Scoring Agent",
  v1: {
    version: "1.2.1",
    prompt: "Score using internal CRM and Clearbit data. Consider funding, role, and engagement.",
    temp: 0.7,
    tokens: 150,
    top_p: 0.9
  },
  v2: {
    version: "1.3.0",
    prompt: "Score using webinar activity, CRM signals, and enrichment. Weight intent heavier.",
    temp: 0.8,
    tokens: 200,
    top_p: 0.95
  }
};

export const mockIncident = {
  id: 91,
  code: "#EC-2025-91",
  title: "Incorrect Lead Scoring + Hallucinated Stack",
  first_detected: "2025-05-13 06:40 UTC",
  trace_id: "trace_score_pipeline_5566",
  severity: "Critical",
  status: "Pending Review",
  services: ["Scoring Agent", "Enrichment Agent"],
  description: "A critical incident occurred in the lead scoring and outreach pipeline. The system incorrectly scored a high-intent lead as 'low intent' after dropping key CRM and webinar engagement data due to prompt truncation.",
  rca_report: {
    summary: "A critical incident occurred in the lead scoring and outreach pipeline. The system incorrectly scored a high-intent lead as 'low intent' after dropping key CRM and webinar engagement data due to prompt truncation. Simultaneously, the enrichment agent hallucinated Mixpanel as a stack technology based on a low-confidence signal. These upstream failures cascaded, resulting in faulty lead classification and an outreach email with incorrect personalization. This incident highlights the risks of context window overflows, insufficient data validation, and prompt design flaws in AI-driven workflows. Immediate remediation is required to prevent revenue loss and restore trust in automated lead handling.",
    root_cause: "The root cause was a combination of prompt truncation logic that deprioritized prior_contacts (including webinar attendance), and the enrichment agent passing low-confidence stack data (Mixpanel) downstream. The scoring prompt's weighting logic further exacerbated the issue by overemphasizing stack/funding and underweighting CRM/webinar engagement, leading to a misclassification of lead intent.",
    contributing_factors: [
      {
        title: "Context Window Overflow",
        description: "The system's prompt builder exceeded the 4096-token context window, triggering automatic truncation. Critically, the prior_contacts field—which contained high-value signals like webinar attendance—was dropped first due to its low truncation priority. This design flaw meant that, even though the lead had attended a key event, the model never saw this information. As a result, the AI scored the lead as 'low intent,' missing a major revenue opportunity. Ideally, prior_contacts should have been prioritized and retained, ensuring high-intent leads are never overlooked.",
        trace_id: "trace_token_trim_9988",
        timestamp: "06:38 UTC",
        details: "Context window overflow triggered truncation of prior_contacts data"
      },
      {
        title: "Low-Confidence Enrichment Passed",
        description: "The enrichment agent integrated with Clearbit returned Mixpanel as a possible stack technology, but with a confidence score of only 0.62—well below the 0.80 threshold set for reliable data. Due to a missing confidence filter, this low-quality signal was still included in the prompt context and passed to downstream agents. This led to a hallucinated stack entry, which not only skewed the lead scoring but also resulted in an outreach email referencing a technology the lead may not actually use. Proper validation should have filtered out low-confidence data, preventing this cascade of errors.",
        trace_id: "trace_clearbit_warn_7788",
        timestamp: "06:38 UTC",
        details: "Low confidence stack data passed through without validation"
      },
      {
        title: "Prompt Weighting Skew",
        description: "The prompt template used for lead scoring was designed to emphasize funding and stack data, while giving less weight to CRM and webinar engagement. This imbalance meant that, even if some engagement data survived truncation, it was largely ignored by the model. As a result, the AI's decision-making was biased toward less relevant signals, increasing the risk of misclassifying high-intent leads. A better approach would be to prioritize direct engagement signals, such as CRM activity and webinar attendance, to more accurately reflect true buyer intent.",
        trace_id: "trace_prompt_gen_1122",
        timestamp: "06:39 UTC",
        details: "Prompt template overemphasized less relevant signals"
      }
    ],
    replay_timeline: [
      { time: "06:37:50", label: "Lead Intake Form Parsed", status: "success", trace_id: "", note: "Lead form submitted by Lisa Tran (RevBoost). All required fields captured." },
      { time: "06:38:00", label: "Clearbit Enrichment Triggered", status: "success", trace_id: "", note: "Enrichment agent started. Awaiting API response for firmographic and stack data." },
      { time: "06:38:20", label: "Mixpanel Returned (Low Confidence)", status: "warning", trace_id: "trace_clearbit_warn_7788", note: "Clearbit returned Mixpanel as a possible stack with confidence 0.62 (threshold: 0.80)." },
      { time: "06:38:33", label: "Mixpanel Added to Context", status: "error", trace_id: "", note: "No filtering logic for low-confidence stack. Mixpanel included in prompt context." },
      { time: "06:38:45", label: "Prompt Construction Started", status: "success", trace_id: "", note: "Prompt builder assembling context. Token count: 4180 (close to limit)." },
      { time: "06:38:55", label: "prior_contacts Dropped", status: "error", trace_id: "trace_token_trim_9988", note: "Context window overflow. prior_contacts (including webinar attendance) dropped due to low truncation priority." },
      { time: "06:39:10", label: "Lead Scored as 'Low Intent'", status: "error", trace_id: "trace_score_pipeline_5566", note: "Model justification: 'No meaningful prior interaction found.' CRM and webinar context missing." },
      { time: "06:39:30", label: "Email Generated with Hallucinated Stack", status: "warning", trace_id: "", note: "Personalization references Mixpanel. Email sent to lead with incorrect context." }
    ],
    replay: [
      { step: 1, title: "Enrichment Hallucinated Stack", description: "The enrichment agent returned Mixpanel as a possible stack technology, but with a confidence score of only 0.62 (below the 0.80 threshold). Due to missing validation, this low-confidence data was still included in the prompt context. As a result, Mixpanel was hallucinated as part of the lead's stack, influencing both the scoring and the generated email. Business impact: The lead may be confused or put off by the incorrect stack reference." },
      { step: 2, title: "Context Truncation", description: "As the prompt was constructed, the total token count exceeded the 4096-token context window. The system's truncation logic dropped the prior_contacts field, which included key webinar attendance data. This loss meant the model could not recognize the lead's high engagement, directly contributing to the misclassification. Business impact: High-intent signals were lost, reducing the chance of correct lead prioritization." },
      { step: 3, title: "Intent Misclassification", description: "With prior_contacts missing and Mixpanel hallucinated as a stack, the scoring agent classified the lead as 'low intent.' The model justification cited 'no meaningful prior interaction found,' ignoring CRM and webinar context. Business impact: The lead was deprioritized, and a revenue opportunity was likely lost." },
      { step: 4, title: "Personalization Failure", description: "The outreach email was generated using the flawed context, referencing Mixpanel as part of the lead's stack. This not only reduced the relevance of the message but also risked damaging credibility with the prospect. Business impact: The sales team may need to perform manual correction and follow-up, increasing operational overhead." }
    ],
    health: {
      retrievalSimilarity: 60,
      threshold: 75,
      semanticDrift: 12,
      outliers: 3
    },
    resolution: [
      {
        action: "Fix Truncation Logic",
        description: "Ensure prior_contacts is prioritized during prompt shortening. Update the truncation algorithm to retain high-value engagement fields, even when the context window is tight. This will prevent loss of critical intent signals in future runs.",
        status: "Not Fixed"
      },
      {
        action: "Enforce Enrichment Confidence Threshold",
        description: "Implement a strict confidence threshold (e.g., 0.80) for stack enrichment. Any stack data below this threshold should be filtered out before being added to the prompt context. This will prevent hallucinated technologies from influencing downstream decisions.",
        status: "Not Fixed"
      },
      {
        action: "Adjust Scoring Prompt Template",
        description: "Revise the scoring prompt template to give greater weight to CRM and webinar engagement data, and reduce emphasis on funding/stack. This will align the model's decision-making with true buyer intent signals and reduce the risk of misclassification.",
        status: "Not Fixed"
      }
    ]
  }
}; 