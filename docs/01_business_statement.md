# Business Statement — Agentic Civic Service Request Triage System

## Problem

The City of Los Angeles — Department of General Services receives hundreds of service
requests each week through informal channels (email, phone, walk-ins). Intake coordinators
manually read each request, determine the responsible department, assign a priority level,
draft an internal summary, and log everything into a ticketing system. This process is:

- **Slow** — a single intake coordinator handles dozens of tickets per day, creating backlogs
- **Inconsistent** — priority and routing decisions vary by person, shift, and workload
- **Untracked** — ad-hoc routing via email means requests fall through the cracks with no audit trail
- **Unscalable** — volume spikes (after emergencies, budget cycles, capital projects) overwhelm staff

## Solution

The Agentic Civic Service Request Triage System replaces manual intake with an automated
AI pipeline. A city staff member submits a plain-English description of an issue through
a web form. The system then:

1. **Classifies** the request into one of six standard department categories
2. **Prioritizes** it (Low / Medium / High / Critical) based on urgency signals
3. **Summarizes** the request in plain English for the intake log
4. **Recommends** a concrete next action for the coordinator
5. **Routes** the ticket to the responsible department queue (simulated via MCP tools)
6. **Persists** the full record to a database and surfaces it in a filterable dashboard

When an OpenAI API key is configured, classification is powered by GPT-3.5-turbo.
Without a key, a deterministic keyword-based fallback ensures the system works offline
and at zero incremental cost.

## Business Value

| Dimension         | Before (Manual)                          | After (Agentic)                         |
|-------------------|------------------------------------------|-----------------------------------------|
| Intake time       | 5–15 min per request                     | < 3 seconds per request                 |
| Consistency       | Varies by staff member                   | Deterministic rules or LLM every time  |
| Routing accuracy  | Dependent on coordinator knowledge       | Keyword/AI match to department map      |
| Traceability      | Email threads, shared spreadsheets       | Structured SQLite record per request    |
| Reporting         | Manual aggregation                       | API-queryable, filterable dashboard     |

## Target Users

- **Intake coordinators** — submit and review service requests from field staff
- **Operations managers** — monitor queue health, filter by priority/category
- **City staff** — submit requests without needing to know which department to contact

## Supported Request Categories

1. Facility Maintenance
2. Public Works
3. Procurement
4. IT Support
5. Safety Issue
6. General Inquiry

## Success Criteria

- [ ] A new service request is classified and ticketed in under 3 seconds
- [ ] The rule-based fallback produces correct category/priority for all 6 categories without an API key
- [ ] All submitted requests are visible in the dashboard with accurate filter behavior
- [ ] The SQLite database is created automatically on first run with no manual setup
- [ ] This entire application can be fully regenerated from this documentation
