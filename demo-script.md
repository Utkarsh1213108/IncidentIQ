# IncidentIQ — Hackathon Demo Script
## Total demo time: 3-5 minutes

---

## SETUP (before judges arrive)
1. Backend running: `uvicorn main:app --reload`
2. Frontend running: `npm run dev`
3. Browser open at: http://localhost:3000
4. Have INC-001 incident page ready in second tab

---

## SCRIPT

### [0:00] Hook — The Problem
> "It's 2am. Your payment service is down. 50,000 users can't checkout.
> Your team is in a war room, 4 engineers manually grepping logs across
> 8 services. This takes 90 minutes on average. IncidentIQ solves this in 30 seconds."

### [0:20] Landing Page
- Show the hero section
- Point out: "AI-powered, built for SRE teams"
- Click "Open Dashboard →"

### [0:30] Dashboard
- "This is your incident command center"
- Point to: Severity chart, resolution donut, MTTR line chart
- "P1 incidents, real-time status, affecting 350,000+ users total"
- Filter by P1 to show critical incidents
- Click INC-001

### [1:00] Incident Detail — Overview
- "Payment service completely down — 98.4% error rate, 47,832 affected users"
- "Duration: 93 minutes. This is a real incident pattern."
- Click "Logs" tab

### [1:20] Log Viewer
- "24 raw log entries across 4 services"
- "An engineer would spend 45 minutes reading these"
- Filter by ERROR to show just errors
- "Notice the pattern — slow queries, then pool exhaustion, then cascade"
- Click "Run AI Analysis"

### [1:40] AI Analysis (loading)
> While loading: "Claude is reading every log line, correlating timestamps across
> services, and identifying the causal chain."

### [1:50] RCA Results
- **Root Cause panel**: "Missing database index introduced in v2.4.1"
- **Confidence: 95%** — "This is the exact root cause, confirmed"
- **Timeline**: Walk through trigger → escalation → detection → resolution
- **Prevention Actions**: "3 high-priority actions to prevent recurrence"
- "This took 30 seconds. Would have taken 90 minutes manually."

### [2:30] Postmortem Generation
- Click "Generate Postmortem"
- Show the loading state
- When done: "A complete, blameless postmortem document"
- Scroll through: Executive Summary, Timeline, Root Cause, Action Items
- Click "Download .md" — show the file download
- "Ready to share with leadership immediately."

### [3:00] The Pitch Close
> "IncidentIQ turns 90-minute war rooms into 30-second answers.
> For any SRE team running microservices, this is the difference between
> losing $10,000/minute or having answers before your coffee gets cold.
> Next step: integrate with PagerDuty, Datadog, and Slack for zero-click analysis."

---

## BACKUP — if AI API is unavailable
The incident page still shows:
- Full log viewer with filtering
- Incident metadata and charts
- Dashboard with all statistics

Say: "The AI analysis requires the API key — here's what the full analysis looks like"
and show a screenshot or the demo video.

---

## JUDGE QUESTIONS — Prepared Answers

**Q: How is this different from existing tools like Datadog APM?**
A: "Datadog shows you dashboards. IncidentIQ tells you why. We provide natural language root cause explanation and auto-write the postmortem. Those tools are data; we're intelligence."

**Q: How accurate is the AI analysis?**
A: "We get 95% confidence on well-logged incidents. The model is transparent about uncertainty and provides contributing factors. It's a force multiplier for the SRE, not a replacement."

**Q: Can it handle real production logs?**
A: "Yes — our backend accepts any JSON log format. Add a connector to your existing log aggregator (ELK, Cloudwatch, Datadog) and point it at our /api/analyze endpoint."

**Q: What happens if the AI is wrong?**
A: "The analysis includes confidence scores and contributing factors. The SRE always validates. We never auto-remediate — we just surface the signal faster."

**Q: Business model?**
A: "SaaS per seat, targeting engineering teams at Series A+ companies. $50/engineer/month. A single hour of reduced MTTR at a startup is worth more than a year's subscription."
