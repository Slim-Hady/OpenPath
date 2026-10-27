# Sequence — AI guide chat and guardrail

```mermaid
sequenceDiagram
  autonumber
  actor D as Developer
  participant W as GuideChat
  participant A as GuideService
  participant GR as GuardrailService
  participant U as AiUsageService
  participant AI as Gemini
  participant DB as Postgres

  D->>W: "Write the fix for this issue"
  W->>A: POST /guide/conversations/:issueId/messages
  A->>DB: verify selection ownership; create/load conversation
  A->>GR: asksForSolution(content)
  GR-->>A: true
  A->>DB: ChatMessage USER + canonical refusal (REFUSED, 0 tokens)
  A-->>W: refusal + usage
  W-->>D: refusal panel with investigation steps

  D->>W: "How should I investigate?"
  W->>A: POST message
  A->>DB: verify ownership; select onboarding + repo context
  A->>U: assertAllowed(AI_GUIDE)
  U-->>A: settings or 429 token/cost
  A->>AI: context + last 9 messages + untrusted issue text
  AI-->>A: prose answer
  A->>U: record(prompt + completion tokens)
  A->>GR: finalize(answer, askedForSolution=false)
  alt code fence/diff/code line
    GR-->>A: stripped answer + note (STRIPPED) or refusal
  else clean
    GR-->>A: PASSED
  end
  A->>DB: ChatMessage GUIDE + outcome
  A-->>W: answer + usage + refusal/stripped flags
  W-->>D: guide message, token meter updated
```

The intent check happens before the provider call. The output filter runs again
after it, so a prompt injection or a model mistake cannot render code. History
is stored and restored. See FR-11, NFR-4 and the eval suite.
