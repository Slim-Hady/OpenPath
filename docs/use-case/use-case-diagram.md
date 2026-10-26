# **Use Case Diagram** 

The model is split into a system overview and five detailed module views. This keeps every use case readable, instead of forcing 20 use cases, 3 actors and 5 external systems onto one canvas.

**Legend**

- Solid line: association between an actor and a use case, or between a use case and an external system.
- Dotted arrow labelled `include`: the source use case always performs the target use case.
- Dotted arrow labelled `extend`: the source use case optionally adds behaviour to the target use case.

### **System Overview**

**Figure 1 — Actors, modules and external systems.** Each module box lists the use cases detailed in the figures below.

```mermaid
flowchart LR
  Developer["👤 Developer"]
  Maintainer["👤 Maintainer"]
  Admin["👤 Admin"]

  subgraph SYS["Open-Source Contribution Platform"]
    direction TB
    M1["1 · Authentication &amp; Profile<br/>UC1 · UC2 · UC3 · UC14"]
    M2["2 · Issue Discovery &amp; Matching<br/>UC4 · UC5 · UC6 · UC7 · UC8"]
    M3["3 · Onboarding &amp; AI Guidance<br/>UC9 · UC10 · UC11 · UC12"]
    M4["4 · Engagement &amp; Community<br/>UC13 · UC15 · UC16 · UC17 · UC18"]
    M5["5 · Administration<br/>UC19 · UC20"]
  end

  GH{{"GitHub API"}}
  SB{{"Supabase"}}
  EM{{"Email Service"}}
  CV{{"CV Parser"}}
  LLM{{"LLM Service"}}

  Developer --- M1 & M2 & M3 & M4
  Maintainer --- M1 & M4
  Admin --- M1 & M5

  M1 --- GH & SB & EM & CV & LLM
  M2 --- GH & LLM
  M3 --- GH & LLM
  M4 --- GH & SB & EM

  classDef actor fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#000
  classDef module fill:#F7F9FC,stroke:#90A4AE,stroke-width:1.5px,color:#000
  classDef ext fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
  class Developer,Maintainer,Admin actor
  class M1,M2,M3,M4,M5 module
  class GH,SB,EM,CV,LLM ext
  style SYS fill:#FFFDF7,stroke:#37474F,stroke-width:2px
```

### **Module 1 — Authentication & Profile**

**Figure 2 — UC1 to UC3 and UC14.** Every other use case depends on this module through `include`.

```mermaid
flowchart LR
  Dev["👤 Developer"]
  Mnt["👤 Maintainer"]
  Adm["👤 Admin"]

  subgraph M1["1 · Authentication & Profile"]
    direction TB
    UC1(["Manage Authentication"])
    UC2(["Manage Developer Information"])
    UC3(["Manage CV Extraction"])
    UC14(["Manage Profile"])
  end

  GH{{"GitHub API"}}
  SB{{"Supabase"}}
  EM{{"Email Service"}}
  CV{{"CV Parser"}}
  LLM{{"LLM Service"}}

  Dev --- UC1 & UC2 & UC3 & UC14
  Mnt --- UC1
  Adm --- UC1

  UC1 --- GH & SB & EM
  UC3 --- SB & CV & LLM
  UC14 --- SB

  UC2 -. include .-> UC1
  UC3 -. include .-> UC1
  UC14 -. include .-> UC1
  UC3 -. extend .-> UC2

  classDef actor fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#000
  classDef ext fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
  class Dev,Mnt,Adm actor
  class GH,SB,EM,CV,LLM ext
  style M1 fill:#F7F9FC,stroke:#90A4AE
```

Cross-module dependencies: UC13, UC15 and UC17 (module 4) and UC19 and UC20 (module 5) also include UC1.

### **Module 2 — Issue Discovery & Matching**

**Figure 3 — UC4 to UC8.** The contribution pipeline: discovery, matching, selection, saved items and progress.

```mermaid
flowchart LR
  Dev["👤 Developer"]

  subgraph M2["2 · Issue Discovery & Matching"]
    direction TB
    UC4(["Manage Issue Discovery"])
    UC5(["Manage Issue Matching"])
    UC6(["Manage Issue Selection"])
    UC7(["Manage Saved Items"])
    UC8(["Manage Progress"])
  end

  GH{{"GitHub API"}}
  LLM{{"LLM Service"}}

  Dev --- UC4 & UC5 & UC6 & UC7 & UC8

  UC4 --- GH
  UC5 --- LLM
  UC7 & UC8 --- GH

  UC5 -. include .-> UC4
  UC6 -. extend .-> UC5
  UC7 -. extend .-> UC6
  UC8 -. include .-> UC6

  classDef actor fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#000
  classDef ext fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
  class Dev actor
  class GH,LLM ext
  style M2 fill:#F7F9FC,stroke:#90A4AE
```

Cross-module dependencies: UC4 includes UC2 (module 1); UC6 is included by UC9 (module 3); UC8 is included by UC16 (module 4).

### **Module 3 — Onboarding & AI Guidance**

**Figure 4 — UC9 to UC12.** Onboarding content and the AI guide, all without revealing the solution.

```mermaid
flowchart LR
  Dev["👤 Developer"]

  subgraph M3["3 · Onboarding & AI Guidance"]
    direction TB
    UC9(["Manage Repository Onboarding"])
    UC10(["Manage Issue Onboarding"])
    UC11(["Manage AI Guide"])
    UC12(["Manage Learning Resources"])
  end

  GH{{"GitHub API"}}
  LLM{{"LLM Service"}}

  Dev --- UC9 & UC10 & UC11 & UC12

  UC9 --- GH
  UC10 --- GH
  UC9 & UC10 & UC11 --- LLM

  UC10 -. include .-> UC9
  UC11 -. include .-> UC10
  UC12 -. extend .-> UC10

  classDef actor fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#000
  classDef ext fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
  class Dev actor
  class GH,LLM ext
  style M3 fill:#F7F9FC,stroke:#90A4AE
```

Cross-module dependency: UC9 includes UC6 (module 2).

### **Module 4 — Engagement & Community**

**Figure 5 — UC13, UC15 to UC18.** Notifications, public profile, gamification, mentor search and outreach.

```mermaid
flowchart LR
  Dev["👤 Developer"]
  Mnt["👤 Maintainer"]

  subgraph M4["4 · Engagement & Community"]
    direction TB
    UC13(["Manage Notifications"])
    UC15(["Manage Public Contribution Profile"])
    UC16(["Manage Gamification"])
    UC17(["Manage Mentor & Contributor Search"])
    UC18(["Manage Contributor Outreach"])
  end

  GH{{"GitHub API"}}
  EM{{"Email Service"}}

  Dev --- UC13 & UC15 & UC16 & UC17 & UC18
  Mnt --- UC17 & UC18

  UC13 --- GH & EM
  UC15 --- GH
  UC17 --- GH

  UC18 -. include .-> UC13
  UC18 -. include .-> UC17
  UC16 -. extend .-> UC15

  classDef actor fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#000
  classDef ext fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#000
  class Dev,Mnt actor
  class GH,EM ext
  style M4 fill:#F7F9FC,stroke:#90A4AE
```

Cross-module dependencies: UC13, UC15 and UC17 include UC1 (module 1); UC16 includes UC8 (module 2).

### **Module 5 — Administration**

**Figure 6 — UC19 and UC20.** Platform monitoring and AI usage control, available to the Admin only.

```mermaid
flowchart LR
  Adm["👤 Admin"]

  subgraph M5["5 · Administration"]
    direction TB
    UC19(["Manage Admin Dashboard"])
    UC20(["Manage AI Settings"])
  end

  Adm --- UC19 & UC20

  classDef actor fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#000
  class Adm actor
  style M5 fill:#F7F9FC,stroke:#90A4AE
```

Cross-module dependency: UC19 and UC20 include UC1 (module 1).
