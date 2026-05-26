import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def analyze_incident(incident: dict, logs: list) -> dict:
    log_text = "\n".join([
        f"[{l['timestamp']}] [{l['level']}] [{l['service']}] [{l['host']}] {l['message']}"
        for l in logs
    ])

    prompt = f"""You are an expert Site Reliability Engineer (SRE) performing a root cause analysis.

INCIDENT DETAILS:
- ID: {incident['id']}
- Title: {incident['title']}
- Severity: {incident['severity']}
- Service: {incident['service']}
- Started: {incident['started_at']}
- Resolved: {incident.get('resolved_at', 'ONGOING')}
- Duration: {incident.get('duration_minutes', 'N/A')} minutes
- Affected Users: {incident['affected_users']:,}
- Error Rate: {incident['error_rate']}%
- Summary: {incident['summary']}

RAW LOGS:
{log_text}

Perform a thorough root cause analysis. Return a JSON object with exactly these fields:
{{
  "root_cause": "One clear sentence stating the exact root cause",
  "root_cause_detail": "3-4 sentences explaining the technical details of what went wrong and why",
  "trigger_event": "The specific event or action that triggered the incident",
  "contributing_factors": ["factor1", "factor2", "factor3"],
  "timeline": [
    {{"time": "HH:MM", "event": "brief description", "type": "trigger|escalation|detection|mitigation|resolution"}}
  ],
  "affected_systems": ["system1", "system2"],
  "impact_summary": "2 sentences on business/user impact",
  "detection_gap_minutes": number,
  "blast_radius": "low|medium|high|critical",
  "remediation_steps": [
    {{"step": 1, "action": "what was done", "result": "what happened"}}
  ],
  "prevention_actions": [
    {{"priority": "high|medium|low", "action": "specific preventive action", "category": "code|process|monitoring|infrastructure"}}
  ],
  "confidence_score": number between 0 and 100,
  "similar_incident_pattern": "name of known incident pattern (e.g. thundering herd, cascade failure, config drift)"
}}

Return ONLY valid JSON, no markdown, no explanation."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def generate_postmortem(incident: dict, rca: dict) -> str:
    prompt = f"""You are a senior SRE writing a professional postmortem document.

INCIDENT: {incident['id']} - {incident['title']}
SEVERITY: {incident['severity']}
DURATION: {incident.get('duration_minutes', 'N/A')} minutes
AFFECTED USERS: {incident['affected_users']:,}
ROOT CAUSE: {rca.get('root_cause', '')}
ROOT CAUSE DETAIL: {rca.get('root_cause_detail', '')}
TRIGGER: {rca.get('trigger_event', '')}
CONTRIBUTING FACTORS: {', '.join(rca.get('contributing_factors', []))}
BLAST RADIUS: {rca.get('blast_radius', '')}
PREVENTION ACTIONS: {rca.get('prevention_actions', [])}

Write a complete, professional postmortem in Markdown format following Google SRE postmortem culture.
Include these sections:
1. Executive Summary
2. Impact
3. Timeline (use the data provided)
4. Root Cause Analysis
5. Contributing Factors
6. Detection & Response
7. Lessons Learned
8. Action Items (with owners and due dates - use placeholder names like "SRE Team", "Platform Team")
9. Supporting Data

Make it thorough, honest, and blameless. Use professional SRE language. Include specific metrics.
Format with proper Markdown headers, tables for action items, and code blocks where appropriate."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text
