import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from report_builder_base import (
    FONT_TITLE, FONT_SUBTITLE, FONT_SECTION, FONT_HEADER, FONT_BOLD, FONT_REGULAR, FONT_SMALL,
    FILL_NAVY, FILL_STEEL, FILL_LIGHT_BLUE, FILL_ZEBRA, FILL_PASS, FONT_PASS, FILL_FAIL, FONT_FAIL,
    FILL_BLOCKED, FONT_BLOCKED, FILL_PARTIAL, FONT_PARTIAL, BORDER_THIN, BORDER_HEADER,
    ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT, autofit, style_header_row, style_data_row,
    OUTPUT_DIR, EVIDENCE_DIR
)
from stage_configs import STAGES_CONFIG

# ─────────────────────────────────────────────────────────────────────────────
# 1. BUILD AxioraPulse_Cross_Stage_Defect_Register.xlsx
# ─────────────────────────────────────────────────────────────────────────────
def build_defect_register_workbook():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Consolidated Defect Register"
    ws.views.sheetView[0].showGridLines = True

    ws["A1"] = "AXIORA PULSE — CONSOLIDATED CROSS-STAGE DEFECT REGISTER"
    ws["A1"].font = FONT_TITLE
    ws["A2"] = "Master register of defects across all evaluated development stages (Stage 02 through Stage 10)"
    ws["A2"].font = FONT_SUBTITLE

    headers = [
        "Defect ID", "Stage ID", "Stage Name", "Module / Area", "Capability Reference",
        "Defect Title", "Defect Category", "Severity", "Priority", "Preconditions",
        "Reproduction Steps", "Expected Result", "Actual Result", "Evidence Reference",
        "Affected Downstream Stages", "Recommended Remediation", "Retest Status"
    ]

    r = 4
    for c, h in enumerate(headers, 1):
        cell = ws.cell(row=r, column=c, value=h)
        cell.font = FONT_HEADER
        cell.fill = FILL_NAVY
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_HEADER

    all_defects = []
    for s_num in range(2, 11):
        cfg = STAGES_CONFIG[s_num]
        for d in cfg["defects"]:
            all_defects.append((cfg["id"], cfg["name"], d))

    for stage_id, stage_name, d in all_defects:
        r += 1
        downstream = "Stages 3-10" if "02" in stage_id else (f"Stages {int(stage_id.split('_')[1])+1}-10" if int(stage_id.split('_')[1]) < 10 else "N/A")
        row_vals = [
            d[0], stage_id, stage_name, d[1], d[2], d[3], d[4], d[5], d[6], d[7],
            d[8], d[9], d[10], d[11], downstream, d[12], d[13]
        ]
        for c, val in enumerate(row_vals, 1):
            cell = ws.cell(row=r, column=c, value=val)
            cell.font = FONT_REGULAR
            cell.border = BORDER_THIN
            cell.alignment = ALIGN_LEFT
            if c in [1, 2, 8, 9, 17]:
                cell.alignment = ALIGN_CENTER
                if c == 8:
                    if val == "Critical":
                        cell.fill = FILL_FAIL
                        cell.font = FONT_FAIL
                    elif val == "High":
                        cell.fill = FILL_BLOCKED
                        cell.font = FONT_BLOCKED

    autofit(ws, max_len_cap=70)
    out_path = os.path.join(OUTPUT_DIR, "AxioraPulse_Cross_Stage_Defect_Register.xlsx")
    wb.save(out_path)
    print(f"Saved: {out_path}")
    return out_path


# ─────────────────────────────────────────────────────────────────────────────
# 2. BUILD AxioraPulse_Overall_Testing_Summary.xlsx
# ─────────────────────────────────────────────────────────────────────────────
def build_overall_summary_workbook():
    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    # Sheet 1: Executive Summary
    ws1 = wb.create_sheet(title="Executive Summary")
    ws1.views.sheetView[0].showGridLines = True

    ws1["A1"] = "AXIORA PULSE — END-TO-END QA AUDIT & LIFECYCLE SUMMARY"
    ws1["A1"].font = FONT_TITLE
    ws1["A2"] = "Master Executive Evaluation across all 10 Development Stages | QA URL: https://qa.axiorapulse.com"
    ws1["A2"].font = FONT_SUBTITLE

    exec_meta = [
        ("Platform Name", "Axiora Pulse — Autonomous Startup Mentorship & Validation Engine"),
        ("QA Environment URL", "https://qa.axiorapulse.com/login"),
        ("Authenticated User", "ntortj@gmail.com (Role: member)"),
        ("Active Test Workspaces", "Workspace 424 ('Idea') | Workspace 416 ('AI mentor')"),
        ("Evaluated Application", "AI Boss (Autonomous Organizational Management & Coordination Engine)"),
        ("Audit Date", "2026-10-22"),
        ("Evaluation Authority", "Autonomous QA Lead, Senior Business Analyst & Evaluator"),
        ("Overall Platform Readiness", "STAGES 1-2 OPERATIONAL (WITH GATES) | STAGES 3-10 ARCHITECTURALLY BLOCKED")
    ]
    r = 4
    for k, v in exec_meta:
        r += 1
        ws1.cell(row=r, column=1, value=k).font = FONT_BOLD
        ws1.cell(row=r, column=1).border = BORDER_THIN
        c2 = ws1.cell(row=r, column=2, value=v)
        c2.font = FONT_REGULAR
        c2.border = BORDER_THIN
        if "Readiness" in k:
            c2.font = FONT_BOLD
            c2.fill = FILL_BLOCKED

    r += 2
    ws1.cell(row=r, column=1, value="EXECUTIVE SUMMARY FINDINGS").font = FONT_SECTION
    r += 1
    narratives = [
        ("Current System Reality", "Axiora Pulse currently implements a 2-stage operational journey in both frontend and backend. Stage 1 (Idea Validation) is fully implemented with automated validation scoring, certificate issuance, and PDF reporting. Stage 2 (Market Research & Business Model) is partially implemented with backend agents (MarketResearchAgent and SurveyIntelligenceAgent) and frontend survey routes, but lacks an unprompted empty-state CTA and has no dedicated business model canvas."),
        ("Status of Stages 3 through 10", "Stages 3 through 10 (Financial Planning, MVP Scoping, Business Setup, GTM, Testing/Pilot, Launch/Traction, Break-Even/Growth, and Scale/Expansion) are extensively documented in product specification workbooks (over 1,600 capability definitions in Docs/), but are NOT functionally implemented in the live application. Backend agent files for Stages 3 and 6 are empty 2-line placeholder stubs, and no agent files exist for Stages 4, 5, 7, 8, 9, 10. In frontend planFeatures.ts, AVAILABLE_JOURNEY_STAGES is hardcoded to 2, and Stages 3-10 are explicitly configured as comingSoon: true."),
        ("Data Persistence Architecture", "The database schema (PostgreSQL) has pre-allocated JSON columns for all 10 stages in the workspaces table (validation_result, financial_result, mvp_result, business_setup_result, gtm_result, test_pilot_result, launch_traction_result, break_even_growth_result, scale_expansion_result). All columns for Stages 3-10 currently evaluate to NULL. This confirms forward architectural intent, but zero data populates these fields."),
        ("Critical Cross-Stage Bottleneck", "Because Stages 3 through 10 lack API routers (HTTP 404) and backend orchestration planners, any automated handoff from Stage 2 downstream is completely severed. The platform safely prevents invalid progression by keeping these stages in a 'Pending' / 'Coming Soon' state in the UI.")
    ]
    for h, txt in narratives:
        ws1.cell(row=r, column=1, value=h).font = FONT_BOLD
        c = ws1.cell(row=r, column=2, value=txt)
        c.font = FONT_REGULAR
        c.alignment = ALIGN_LEFT
        r += 1

    autofit(ws1, max_len_cap=80)

    # Sheet 2: 10-Stage Lifecycle Map
    ws2 = wb.create_sheet(title="10-Stage Lifecycle Map")
    ws2.views.sheetView[0].showGridLines = True

    ws2["A1"] = "AXIORA PULSE — AUTHORITATIVE 10-STAGE DEVELOPMENT LIFECYCLE"
    ws2["A1"].font = FONT_TITLE
    ws2["A2"] = "Complete lifecycle definition, official stage names, business objectives, and implementation status"
    ws2["A2"].font = FONT_SUBTITLE

    l_headers = [
        "Stage ID", "Official Stage Name", "Business Objective", "Entry Criteria", "Exit Criteria",
        "Relevant Agents", "Documented Source", "Implementation Status", "QA Audit Disposition"
    ]
    r = 4
    for c, h in enumerate(l_headers, 1):
        cell = ws2.cell(row=r, column=c, value=h)
        cell.font = FONT_HEADER
        cell.fill = FILL_NAVY
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_HEADER

    lifecycle_data = [
        ("Stage_01", "Idea Validation", "Validate startup idea, customer problem clarity, value prop, feasibility, and Go/Pivot verdict", "Founder submits idea context via chat/voice", "Idea Validation Score, Verdict, Certificate, PDF Report", "IdeaValidationAgent, ARYA AI Mentor", "Docs/Idea Validation - Capabilities.xlsx, TESTING_Idea_Validation.xlsx", "Implemented and Available", "Validated (Reference Stage)"),
        ("Stage_02", "Market Research & Business Model", "Target customer profiling, market sizing, ICP, competitor mapping, survey intelligence, and unit economics", "Stage 1 validated idea and problem statement", "Primary ICP, competitor matrix, survey sentiment, and revenue model", "MarketResearchAgent, SurveyIntelligenceAgent", "Docs/Market Strategy Agent.xlsx, Docs/Survey Intelligence Agent (1).xlsx", "Partially Implemented", "Validated with Limitations"),
        ("Stage_03", "Financial & Capital Planning", "Capital requirements, founder survival runway, monthly burn, revenue projections, and break-even target", "Stage 2 ICP, pricing model, and customer willingness to pay", "Runway in months, monthly burn rate, break-even target date, funding gap", "FinancialReadinessAgent (Stub)", "Docs/Financial & Capital Planning (1).xlsx", "Documented but not implemented", "Not Validated — Blocked"),
        ("Stage_04", "MVP & Execution Planning", "POC vs MVP requirements, MoSCoW feature scoping, tech stack selection, and sprint roadmap", "Stage 3 capital plan and validated core problem/solution", "MVP feature scope (Must-haves), architecture plan, 6-week sprint roadmap", "MVP & Execution Planning Agent", "Docs/MVP & Execution Planning.xlsx", "Documented but not implemented", "Not Validated — Blocked"),
        ("Stage_05", "Business Setup & Build Execution", "Team hiring, co-founder/agency decisions, job descriptions, legal incorporation timing, and build monitoring", "Stage 4 MVP feature specification and delivery mode", "Legal entity structure, core team scorecard, vendor contracts, build velocity", "Business Setup & Build Execution Agent", "Docs/Business Setup & Build Execution.xlsx", "Documented but not implemented", "Not Validated — Blocked"),
        ("Stage_06", "Pre-Traction & GTM", "Beachhead customer selection, brand positioning, landing page messaging, waitlist, and founder content", "Stage 5 build progress and Stage 2 ICP definition", "Live waitlist, community channels, founder content pillars, early pre-sales", "GtmStrategyAgent (Stub)", "Docs/V2 - PRE Traction & GTM.xlsx, Docs/Market Strategy Agent.xlsx", "Documented but not implemented", "Not Validated — Blocked"),
        ("Stage_07", "Testing, Pilot & Improvement", "QA, UAT testing, beta pilot cohort recruitment, usability testing, bug triage, and Launch Readiness Score", "Stage 5/6 release candidate and pilot cohort", "UAT sign-off, triaged bug backlog, Launch Readiness Score and verdict", "Testing, Pilot & Improvement Agent", "Docs/Testing, Pilot & Improvement (1).xlsx", "Documented but not implemented", "Not Validated — Blocked"),
        ("Stage_08", "Launch, Traction & Customer Validation", "Commercial launch rollout, customer acquisition, sales execution, revenue tracking, CAC/LTV, and PMF signals", "Stage 7 Launch Readiness sign-off and approved release", "Paying customers, MRR/ARR, customer retention curve, Sean Ellis PMF score", "Commercial Launch & Traction Agent", "Docs/Launch, Traction & Customer Validation (1).xlsx", "Documented but not implemented", "Not Validated — Blocked"),
        ("Stage_09", "Break-Even & Growth", "Break-even monitoring, revenue optimization, cost reduction, gross margin expansion, and growth experiments", "Stage 8 paying customers and initial unit economics", "Monthly net profitability, reduced CAC, expansion revenue, ICE experiment log", "Break-Even & Growth Agent", "Docs/Break Even & Growth (1).xlsx", "Documented but not implemented", "Not Validated — Blocked"),
        ("Stage_10", "Scale, Expansion & Strategic Future", "Org scaling, executive leadership, SOP standardization, new markets, fundraising, and exit strategy", "Stage 9 sustainable profitability and positive cash flow", "International expansion plan, investor data room, valuation model, exit roadmap", "Strategic Scale & Enterprise Expansion Agent", "Docs/Scale, Expansion & Strategic Future (1).xlsx", "Documented but not implemented", "Not Validated — Blocked")
    ]

    for row in lifecycle_data:
        r += 1
        for c, val in enumerate(row, 1):
            cell = ws2.cell(row=r, column=c, value=val)
            cell.font = FONT_REGULAR
            cell.border = BORDER_THIN
            cell.alignment = ALIGN_LEFT
            if c in [1, 8, 9]:
                cell.alignment = ALIGN_CENTER
                if c == 9:
                    if "Validated (" in val:
                        cell.fill = FILL_PASS
                        cell.font = FONT_PASS
                    elif "Limitations" in val:
                        cell.fill = FILL_PARTIAL
                        cell.font = FONT_PARTIAL
                    else:
                        cell.fill = FILL_BLOCKED
                        cell.font = FONT_BLOCKED

    autofit(ws2, max_len_cap=70)

    # Sheet 3: Cross-Stage Metrics Dashboard
    ws3 = wb.create_sheet(title="Cross-Stage Metrics Dashboard")
    ws3.views.sheetView[0].showGridLines = True

    ws3["A1"] = "AXIORA PULSE — CROSS-STAGE QA METRICS & COVERAGE"
    ws3["A1"].font = FONT_TITLE
    ws3["A2"] = "Comparative breakdown of test execution, pass rates, capability coverage, and defects per stage"
    ws3["A2"].font = FONT_SUBTITLE

    m_headers = [
        "Stage ID", "Official Stage Name", "Identified Tests", "Executed", "Passed", "Failed",
        "Blocked", "Partial", "Pass Rate (%)", "Doc Capabilities", "Implemented Caps",
        "Critical Defects", "High Defects", "Medium Defects", "Low Defects", "Final Status"
    ]
    r = 4
    for c, h in enumerate(m_headers, 1):
        cell = ws3.cell(row=r, column=c, value=h)
        cell.font = FONT_HEADER
        cell.fill = FILL_NAVY
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_HEADER

    # Stage 1 reference metrics from TESTING_Idea_Validation.xlsx
    stage_metrics = [
        ("Stage_01", "Idea Validation (Reference)", 35, 35, 27, 4, 1, 3, "77.1%", 146, 120, 1, 3, 5, 2, "Validated with Observations")
    ]
    for s_num in range(2, 11):
        cfg = STAGES_CONFIG[s_num]
        tcs = cfg["test_cases"]
        p = sum(1 for tc in tcs if tc[9] == "PASS")
        f = sum(1 for tc in tcs if tc[9] == "FAIL")
        b = sum(1 for tc in tcs if tc[9] == "BLOCKED")
        part = sum(1 for tc in tcs if tc[9] == "PARTIAL")
        ex = p + f + b + part
        pr = (p / ex * 100) if ex > 0 else 0
        total_c = len(cfg["caps"])
        imp_c = sum(1 for c in cfg["caps"] if "Implemented" in c[5])
        defs = cfg["defects"]
        cr = sum(1 for d in defs if d[5] == "Critical")
        hi = sum(1 for d in defs if d[5] == "High")
        me = sum(1 for d in defs if d[5] == "Medium")
        lo = sum(1 for d in defs if d[5] == "Low")
        stage_metrics.append((
            cfg["id"], cfg["name"], len(tcs), ex, p, f, b, part, f"{pr:.1f}%",
            total_c, imp_c, cr, hi, me, lo, cfg["status"]
        ))

    for row in stage_metrics:
        r += 1
        for c, val in enumerate(row, 1):
            cell = ws3.cell(row=r, column=c, value=val)
            cell.font = FONT_REGULAR
            cell.border = BORDER_THIN
            cell.alignment = ALIGN_LEFT
            if c in [1, 9, 16] or (c >= 3 and c <= 15):
                cell.alignment = ALIGN_CENTER
                if c == 16:
                    if "Validated with" in val or "OPERATIONAL" in val:
                        cell.fill = FILL_PARTIAL
                        cell.font = FONT_PARTIAL
                    else:
                        cell.fill = FILL_BLOCKED
                        cell.font = FONT_BLOCKED

    autofit(ws3, max_len_cap=70)

    # Sheet 4: Cross-Stage Dependencies & Gaps
    ws4 = wb.create_sheet(title="Dependencies & Arch Gaps")
    ws4.views.sheetView[0].showGridLines = True

    ws4["A1"] = "AXIORA PULSE — CROSS-STAGE DEPENDENCIES & ARCHITECTURAL GAPS"
    ws4["A1"].font = FONT_TITLE
    ws4["A2"] = "Critical gaps in upstream-to-downstream handoffs, agent orchestration, and stage transition gates"
    ws4["A2"].font = FONT_SUBTITLE

    gap_headers = [
        "Gap ID", "Upstream Stage", "Downstream Stage", "Handoff Deliverable",
        "Architectural Defect / Failure Mode", "Impact on Founder Experience", "Required Architecture Fix"
    ]
    r = 4
    for c, h in enumerate(gap_headers, 1):
        cell = ws4.cell(row=r, column=c, value=h)
        cell.font = FONT_HEADER
        cell.fill = FILL_NAVY
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_HEADER

    gaps = [
        ("GAP-01", "Stage 1 (Idea Validation)", "Stage 2 (Market Research)", "Validated Idea & Problem Statement", "Survey generation is disabled until validation runs, but no guidance or trigger CTA is shown on the Survey tab.", "Founder clicks Survey Intelligence tab and sees empty 'No surveys found' screen with no path forward.", "Add proactive CTA on Survey tab prompting the user to complete Idea Validation first."),
        ("GAP-02", "Stage 2 (Market Research)", "Stage 3 (Financial Planning)", "ICP Pricing, Willingness to Pay, and Target Market Size", "Stage 3 backend agent is an empty stub. No API exists to receive Stage 2 pricing data.", "Founder cannot translate validated customer pricing into runway or revenue projections.", "Implement FinancialReadinessAgent and connect it to context_builder output from Stage 2."),
        ("GAP-03", "Stage 3 (Financial Planning)", "Stage 4 (MVP Planning)", "Runway Budget and Safe Development Capital", "Stage 4 has zero backend agent code and no MoSCoW scoping engine.", "Founder cannot constrain MVP feature scope to fit actual available development budget.", "Build MvpPlanningAgent with MoSCoW categorization skill constrained by Stage 3 budget."),
        ("GAP-04", "Stage 4 (MVP Planning)", "Stage 5 (Business Setup)", "MVP Architecture, Delivery Mode, and Tech Stack", "Stage 5 has no agent or hiring/vendor evaluation engine.", "Founder cannot transition tech stack recommendations into job descriptions or contractor contracts.", "Build BusinessSetupAgent to ingest Stage 4 tech stack and generate required roles."),
        ("GAP-05", "Stage 5 (Business Setup)", "Stage 6 (Pre-Traction)", "Operational Entity, Brand Assets, and Team Readiness", "Stage 6 backend agent is an empty stub.", "Founder cannot build pre-traction waitlist or launch community before release.", "Implement GtmStrategyAgent and connect beachhead segmentation with Stage 2 ICP."),
        ("GAP-06", "Stage 6 (Pre-Traction)", "Stage 7 (Testing & Pilot)", "Waitlist Cohort and Pre-Registered Beta Users", "Stage 7 has no pilot tracking engine or Launch Readiness score.", "Founder cannot recruit beta users from waitlist or measure launch readiness objectively.", "Build TestingPilotAgent with Launch Readiness Scoring (0-100) algorithm."),
        ("GAP-07", "Stage 7 (Testing & Pilot)", "Stage 8 (Launch & Traction)", "Signed-off Release Candidate and Pilot Feedback", "Stage 8 has no commercial launchpad or PMF detector.", "Founder cannot track commercial launch conversion, CAC, or churn.", "Build CommercialLaunchAgent with cohort retention and revenue analytics."),
        ("GAP-08", "Stage 8 (Launch & Traction)", "Stage 9 (Break-Even & Growth)", "Paying Customers, MRR, Churn, and Unit Economics", "Stage 9 has no break-even tracking or margin expansion engine.", "Founder cannot identify cost leaks or optimize marketing ROI to reach profitability.", "Build BreakEvenGrowthAgent with ICE growth experimentation backlog."),
        ("GAP-09", "Stage 9 (Break-Even & Growth)", "Stage 10 (Scale & Expansion)", "Sustainable Profitability, Positive Cash Flow, and SOPs", "Stage 10 has no investor data room or international expansion engine.", "Founder cannot prepare institutional fundraising diligence or evaluate exit options.", "Build StrategicScaleAgent with data room assembly and valuation modeling.")
    ]

    for row in gaps:
        r += 1
        for c, val in enumerate(row, 1):
            cell = ws4.cell(row=r, column=c, value=val)
            cell.font = FONT_REGULAR
            cell.border = BORDER_THIN
            cell.alignment = ALIGN_LEFT
            if c in [1, 2, 3]:
                cell.alignment = ALIGN_CENTER

    autofit(ws4, max_len_cap=70)

    # Sheet 5: Lifecycle Progression Plan
    ws5 = wb.create_sheet(title="Lifecycle Progression Plan")
    ws5.views.sheetView[0].showGridLines = True

    ws5["A1"] = "AXIORA PULSE — LIFECYCLE PROGRESSION & REMEDIATION ROADMAP"
    ws5["A1"].font = FONT_TITLE
    ws5["A2"] = "Phased engineering roadmap to unblock Stages 3 through 10 and achieve end-to-end lifecycle validity"
    ws5["A2"].font = FONT_SUBTITLE

    plan_headers = [
        "Phase", "Target Stages", "Primary Engineering Deliverable", "Target Agent(s) to Build",
        "API & DB Actions", "Frontend Work Required", "Expected QA Exit Gate"
    ]
    r = 4
    for c, h in enumerate(plan_headers, 1):
        cell = ws5.cell(row=r, column=c, value=h)
        cell.font = FONT_HEADER
        cell.fill = FILL_NAVY
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_HEADER

    phases = [
        ("Phase 1 Polish", "Stage 2 (Market Research)", "Fix Survey empty state and surface Business Model canvas", "SurveyIntelligenceAgent, MarketResearchAgent", "Expose PUT /surveys/workspace/{id} and GET /market-research", "Add empty state CTA on Survey tab; create Business Model sub-view", "Stage 2 achieves 100% test pass rate with unprompted UX."),
        ("Phase 2A", "Stage 3 (Financial) & Stage 4 (MVP)", "Implement Capital Planning and MVP MoSCoW scoping engines", "FinancialReadinessAgent, MvpPlanningAgent", "Build /api/v1/workspaces/{id}/financial and /mvp routers", "Create FinancialPlanningPage and MvpScopingPage components", "Stages 3 & 4 advance from 'Coming Soon' to 'Active' in Journey."),
        ("Phase 2B", "Stage 5 (Setup) & Stage 6 (GTM)", "Implement Business Setup and GTM Pre-Traction launchpad", "BusinessSetupAgent, GtmStrategyAgent", "Build /api/v1/workspaces/{id}/business-setup and /gtm routers", "Create BusinessSetupPage and GtmStrategyPage with waitlist UI", "Stages 5 & 6 operational with passing E2E test runs."),
        ("Phase 3A", "Stage 7 (Testing) & Stage 8 (Launch)", "Implement Launch Readiness scoring and commercial traction engine", "TestingPilotAgent, CommercialLaunchAgent", "Build /api/v1/workspaces/{id}/pilot and /launch routers", "Build PilotDashboard and TractionRevenuePage components", "Stage 7 Launch Readiness verdict accurately gates Stage 8 launch."),
        ("Phase 3B", "Stage 9 (Break-Even) & Stage 10 (Scale)", "Implement Break-Even optimization and Enterprise Scale suite", "BreakEvenGrowthAgent, StrategicScaleAgent", "Build /api/v1/workspaces/{id}/growth and /scale routers", "Build BreakEvenDashboard and StrategicDataRoom components", "Full 10-stage lifecycle operational from Idea to Scaling.")
    ]
    for row in phases:
        r += 1
        for c, val in enumerate(row, 1):
            cell = ws5.cell(row=r, column=c, value=val)
            cell.font = FONT_REGULAR
            cell.border = BORDER_THIN
            cell.alignment = ALIGN_LEFT
            if c in [1, 2]:
                cell.alignment = ALIGN_CENTER

    autofit(ws5, max_len_cap=70)

    out_path = os.path.join(OUTPUT_DIR, "AxioraPulse_Overall_Testing_Summary.xlsx")
    wb.save(out_path)
    print(f"Saved: {out_path}")
    return out_path


# ─────────────────────────────────────────────────────────────────────────────
# 3. BUILD AxioraPulse_Overall_Testing_Summary.md
# ─────────────────────────────────────────────────────────────────────────────
def build_markdown_summary():
    md_path = os.path.join(OUTPUT_DIR, "AxioraPulse_Overall_Testing_Summary.md")

    content = f"""# Axiora Pulse — End-to-End QA Testing & Audit Report
## Comprehensive Assessment of All 10 Development Stages Across the Startup Lifecycle

- **QA Environment URL:** [https://qa.axiorapulse.com/login](https://qa.axiorapulse.com/login)
- **Execution Date:** 2026-10-22
- **Lead QA & Systems Evaluator:** Antigravity Autonomous QA Lead
- **Target Workspaces:** Workspace 424 (`Idea`) | Workspace 416 (`AI mentor`)
- **Reference Application Concept:** **AI Boss** (Autonomous Organizational Management & Team Evaluation Platform)
- **Reference Methodology:** `TESTING_Idea_Validation.xlsx`

---

## 1. Executive Summary & Key Findings

A thorough, evidence-based quality assurance audit was conducted on the Axiora Pulse platform across all ten development stages, spanning from **Stage 1: Idea Validation** through **Stage 10: Scale, Expansion & Strategic Future**.

### Overall System Reality:
1. **The Live Product Journey Currently Runs Two Stages:**
   - Both the frontend UI and backend architecture currently support **Stage 1 (Idea Validation)** and partially support **Stage 2 (Market Research & Business Model)**.
   - In `axiora-pulse-fe/src/utils/planFeatures.ts`, the system explicitly hardcodes:
     ```typescript
     const AVAILABLE_JOURNEY_STAGES = 2;
     const JOURNEY_STAGES: PlanFeatureDetail[] = AGENT_STEPS.map((step) =>
       step.id > AVAILABLE_JOURNEY_STAGES ? {{ label: step.name, comingSoon: true }} : {{ label: step.name }}
     );
     ```
   - Consequently, in both the **Pricing Plans** and the workspace **Entrepreneur Journey** card, Stages 3 through 10 are flagged as **`Coming soon`** and are rendered in an un-actionable, static drawer format.

2. **Backend Agent Implementation Status:**
   - **Implemented:** `idea_validation_agent.py`, `market_research_agent.py`, `survey_intelligence_agent.py`.
   - **Placeholder Stubs:** `financial_readiness_agent.py` (Stage 3) and `gtm_strategy_agent.py` (Stage 6) exist only as two-line comments (`# Reserved for Phase 2...`).
   - **Missing Entirely:** No agent code, prompts, or skills exist for:
     - Stage 4: MVP & Execution Planning
     - Stage 5: Business Setup & Build Execution
     - Stage 7: Testing, Pilot & Improvement
     - Stage 8: Launch, Traction & Customer Validation
     - Stage 9: Break-Even & Growth
     - Stage 10: Scale, Expansion & Strategic Future
   - `WORKFLOW_AGENT_MAP` in `app/orchestration/planner.py` only defines mappings for `IDEA_VALIDATION`, `SURVEY_GENERATION`, `SURVEY_ANALYTICS`, and `REPORT_GENERATION`.

3. **Database Pre-Allocation:**
   - The PostgreSQL `workspaces` table schema includes pre-allocated JSON columns for all 10 stages:
     `validation_result`, `financial_result`, `mvp_result`, `business_setup_result`, `gtm_result`, `test_pilot_result`, `launch_traction_result`, `break_even_growth_result`, and `scale_expansion_result`.
   - In the live QA database, columns for Stages 3–10 are `NULL` across all workspaces.

---

## 2. Authoritative 10-Stage Lifecycle Register

| Stage ID | Official Stage Name | Business Objective | Implemented Agents | UI Route / View | QA Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage 01** | **Idea Validation** | Problem identification, solution clarity, feasibility, customer hypothesis, Go/Pivot verdict | `idea_validation_agent`, `ARYA` Mentor | `/workspace/:id` (Chat) | **Validated (Reference)** |
| **Stage 02** | **Market Research & Business Model** | ICP profiling, competitor dynamics, survey intelligence, sentiment, pricing | `market_research_agent`, `survey_intelligence_agent` | `/workspace/:id/survey` | **Validated with Limitations** |
| **Stage 03** | **Financial & Capital Planning** | Capital requirements, burn rate, founder survival runway, break-even target | `financial_readiness_agent` *(Stub)* | *None (404)* | **Not Validated — Blocked** |
| **Stage 04** | **MVP & Execution Planning** | POC requirements, MoSCoW feature scoping, sprint roadmap, tech stack | *None (Missing)* | *None (404)* | **Not Validated — Blocked** |
| **Stage 05** | **Business Setup & Build Execution** | Team hiring, legal incorporation timing, tool stack, build velocity | *None (Missing)* | *None (404)* | **Not Validated — Blocked** |
| **Stage 06** | **Pre-Traction & GTM** | Beachhead customers, brand positioning, landing page messaging, waitlist | `gtm_strategy_agent` *(Stub)* | *None (404)* | **Not Validated — Blocked** |
| **Stage 07** | **Testing, Pilot & Improvement** | QA, UAT testing, beta pilot cohort, bug triage, Launch Readiness Score | *None (Missing)* | *None (404)* | **Not Validated — Blocked** |
| **Stage 08** | **Launch, Traction & Customer Validation** | Commercial launch, sales execution, revenue tracking, CAC/LTV, PMF signals | *None (Missing)* | *None (404)* | **Not Validated — Blocked** |
| **Stage 09** | **Break-Even & Growth** | Break-even tracking, cost optimization, gross margin, growth experiments | *None (Missing)* | *None (404)* | **Not Validated — Blocked** |
| **Stage 10** | **Scale, Expansion & Strategic Future** | Org hierarchy, SOPs, international expansion, fundraising data room, exit | *None (Missing)* | *None (404)* | **Not Validated — Blocked** |

---

## 3. Detailed Stage-by-Stage Findings (Stages 2–10)

### Stage 02: Market Research & Business Model
- **Findings:** Implemented in backend orchestration and partially in frontend. `MarketResearchAgent` runs successfully as Analysis 2 during full validation. `SurveyIntelligenceAgent` can generate surveys and analyze sentiment. Public survey route (`/surveys/public/:id`) is operational.
- **Defects:**
  - `S02-DEF-001` (High): When entering the Survey Intelligence tab on a fresh workspace, the screen displays a blank `No surveys found` message with no explanation or action button prompting the user to complete Idea Validation first.
  - `S02-DEF-002` (Medium): No dedicated interactive UI screens exist for Business Modeling, Pricing Strategy, or Competitor Canvas; these outputs are only rendered in static PDF/text reports.

### Stage 03: Financial & Capital Planning
- **Findings:** Defined across 92 capabilities in `Docs/Financial & Capital Planning (1).xlsx`. The backend file `app/agents/financial_readiness_agent.py` contains only `# Reserved for Phase 2: Financial Readiness Agent.`.
- **Defects:**
  - `S03-DEF-001` (Critical): Backend agent is completely unimplemented.
  - `S03-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/financial` returns `HTTP 404 Not Found`.
  - `S03-DEF-003` (High): Stage 3 in Journey sidebar cannot be activated or executed.

### Stage 04: MVP & Execution Planning
- **Findings:** Documented across 8 worksheets (100 capability rows) in `Docs/MVP & Execution Planning.xlsx`. No backend agent file exists in `app/agents/`.
- **Defects:**
  - `S04-DEF-001` (Critical): Missing MVP planning agent and MoSCoW scoping skill.
  - `S04-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/mvp` returns `HTTP 404 Not Found`.
  - `S04-DEF-003` (High): No interactive feature prioritization UI in workspace.

### Stage 05: Business Setup & Build Execution
- **Findings:** Documented across 9 layers (200 capability rows) in `Docs/Business Setup & Build Execution.xlsx`.
- **Defects:**
  - `S05-DEF-001` (Critical): Missing backend agent for legal entity advisory, team hiring, and vendor evaluation.
  - `S05-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/business-setup` returns `HTTP 404 Not Found`.
  - `S05-DEF-003` (High): No setup checklist or vendor management UI.

### Stage 06: Pre-Traction & GTM
- **Findings:** Documented across 8 layers (238 capability rows) in `Docs/V2 - PRE Traction & GTM.xlsx` and `Docs/Market Strategy Agent.xlsx`. The backend file `app/agents/gtm_strategy_agent.py` is a 2-line placeholder stub.
- **Defects:**
  - `S06-DEF-001` (Critical): Backend GTM strategy agent is an unimplemented stub.
  - `S06-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/gtm` returns `HTTP 404 Not Found`.
  - `S06-DEF-003` (High): No waitlist builder or brand positioning UI.

### Stage 07: Testing, Pilot & Improvement
- **Findings:** Documented across 9 layers (203 capability rows) in `Docs/Testing, Pilot & Improvement (1).xlsx`.
- **Defects:**
  - `S07-DEF-001` (Critical): Missing Testing & Pilot Governance agent.
  - `S07-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/pilot` returns `HTTP 404 Not Found`.
  - `S07-DEF-003` (High): No beta cohort tracker or Launch Readiness Score gauge.

### Stage 08: Launch, Traction & Customer Validation
- **Findings:** Documented across 10 layers (243 capability rows) in `Docs/Launch, Traction & Customer Validation (1).xlsx`.
- **Defects:**
  - `S08-DEF-001` (Critical): Missing commercial launch and customer traction agent.
  - `S08-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/launch` returns `HTTP 404 Not Found`.
  - `S08-DEF-003` (High): No revenue tracking, CAC/LTV, or PMF detection dashboard.

### Stage 09: Break-Even & Growth
- **Findings:** Documented across 10 layers (285 capability rows) in `Docs/Break Even & Growth (1).xlsx`.
- **Defects:**
  - `S09-DEF-001` (Critical): Missing break-even and growth experimentation agent.
  - `S09-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/growth` returns `HTTP 404 Not Found`.
  - `S09-DEF-003` (High): No unit-economics optimization or ICE growth backlog UI.

### Stage 10: Scale, Expansion & Strategic Future
- **Findings:** Documented across 12 layers (332 capability rows) in `Docs/Scale, Expansion & Strategic Future (1).xlsx`.
- **Defects:**
  - `S10-DEF-001` (Critical): Missing strategic scale and enterprise expansion agent.
  - `S10-DEF-002` (High): Endpoint `/api/v1/workspaces/{{id}}/scale` returns `HTTP 404 Not Found`.
  - `S10-DEF-003` (High): No international market modeler, investor data room, or exit planning UI.

---

## 4. Test Execution & Defect Metrics Summary

| Stage Number & Name | Identified Cases | Executed | Passed | Failed | Blocked | Partial | Pass Rate | Critical (P1) | High (P2) | Med (P3) | Low (P4) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Stage 01: Idea Validation (Ref)** | 35 | 35 | 27 | 4 | 1 | 3 | 77.1% | 1 | 3 | 5 | 2 | Validated w/ Obs |
| **Stage 02: Market Research & BM** | 10 | 10 | 7 | 2 | 0 | 1 | 70.0% | 0 | 1 | 1 | 0 | Validated w/ Limit |
| **Stage 03: Financial & Capital** | 8 | 8 | 4 | 3 | 0 | 1 | 50.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **Stage 04: MVP & Execution** | 5 | 5 | 2 | 3 | 0 | 0 | 40.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **Stage 05: Business Setup & Build** | 5 | 5 | 2 | 3 | 0 | 0 | 40.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **Stage 06: Pre-Traction & GTM** | 5 | 5 | 2 | 3 | 0 | 0 | 40.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **Stage 07: Testing & Pilot** | 5 | 5 | 2 | 3 | 0 | 0 | 40.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **Stage 08: Launch & Traction** | 5 | 5 | 2 | 3 | 0 | 0 | 40.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **Stage 09: Break-Even & Growth** | 5 | 5 | 2 | 3 | 0 | 0 | 40.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **Stage 10: Scale & Expansion** | 5 | 5 | 2 | 3 | 0 | 0 | 40.0% | 1 | 2 | 0 | 0 | Blocked / Missing |
| **TOTALS (Stages 2–10)** | **53** | **53** | **25** | **25** | **0** | **3** | **47.2%** | **8** | **17** | **1** | **0** | **Stage 2 Validated; 3-10 Blocked** |

---

## 5. Artifact & Deliverable Directory Inventory

All test reports and captured evidence artifacts are stored in the local workspace under `AxioraPulse_Test_Reports/`:

### A. Stage-Specific Testing Reports (.xlsx)
1. [`Stage_02_Market_Research_and_Business_Model_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_02_Market_Research_and_Business_Model_Testing_Report.xlsx)
2. [`Stage_03_Financial_and_Capital_Planning_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_03_Financial_and_Capital_Planning_Testing_Report.xlsx)
3. [`Stage_04_MVP_and_Execution_Planning_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_04_MVP_and_Execution_Planning_Testing_Report.xlsx)
4. [`Stage_05_Business_Setup_and_Build_Execution_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_05_Business_Setup_and_Build_Execution_Testing_Report.xlsx)
5. [`Stage_06_Pre_Traction_and_GTM_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_06_Pre_Traction_and_GTM_Testing_Report.xlsx)
6. [`Stage_07_Testing_Pilot_and_Improvement_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_07_Testing_Pilot_and_Improvement_Testing_Report.xlsx)
7. [`Stage_08_Launch_Traction_and_Customer_Validation_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_08_Launch_Traction_and_Customer_Validation_Testing_Report.xlsx)
8. [`Stage_09_Break_Even_and_Growth_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_09_Break_Even_and_Growth_Testing_Report.xlsx)
9. [`Stage_10_Scale_Expansion_and_Strategic_Future_Testing_Report.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/Stage_10_Scale_Expansion_and_Strategic_Future_Testing_Report.xlsx)

### B. Consolidated Executive Reports
- **Executive Summary Workbook:** [`AxioraPulse_Overall_Testing_Summary.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/AxioraPulse_Overall_Testing_Summary.xlsx)
- **Master Defect Register:** [`AxioraPulse_Cross_Stage_Defect_Register.xlsx`](file:///e:/Pulse/AxioraPulse_Test_Reports/AxioraPulse_Cross_Stage_Defect_Register.xlsx)
- **Executive Narrative Report:** [`AxioraPulse_Overall_Testing_Summary.md`](file:///e:/Pulse/AxioraPulse_Test_Reports/AxioraPulse_Overall_Testing_Summary.md)

### C. Evidence Directory
- **Location:** [`AxioraPulse_Test_Reports/Evidence/`](file:///e:/Pulse/AxioraPulse_Test_Reports/Evidence/)
  - Subdirectories `Stage_02/` through `Stage_10/` containing visual screenshots and API logs verifying the exact application behavior and state.

---

## 6. Strategic Progression Recommendation

1. **Short-Term (Next Sprint):** Resolve Stage 2 UX defects (`S02-DEF-001` and `S02-DEF-002`) by adding an empty-state action button on the Survey Intelligence page and surfacing a dedicated Business Model canvas in the workspace.
2. **Medium-Term (Q1 Roadmap):** Complete Phase 2 agents (`financial_readiness_agent.py` and `gtm_strategy_agent.py`) and develop `mvp_planning_agent.py` to enable Stages 3, 4, and 6.
3. **Long-Term (Q2 Roadmap):** Implement the operational execution and scale engines for Stages 5, 7, 8, 9, and 10 to realize the full end-to-end vision of Axiora Pulse.
"""

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Saved: {md_path}")
    return md_path

# Execute
build_defect_register_workbook()
build_overall_summary_workbook()
build_markdown_summary()
print("\nAll consolidated summary deliverables successfully built!")
