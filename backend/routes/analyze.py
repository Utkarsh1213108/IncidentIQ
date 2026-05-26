import json
import os
from fastapi import APIRouter, HTTPException
from services.ai_service import analyze_incident

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def load_incidents():
    with open(os.path.join(DATA_DIR, "incidents.json")) as f:
        return json.load(f)

def load_logs(incident_id: str):
    log_file = os.path.join(DATA_DIR, "logs", f"{incident_id}.json")
    if not os.path.exists(log_file):
        return []
    with open(log_file) as f:
        return json.load(f)

@router.post("/{incident_id}")
def analyze(incident_id: str):
    incidents = load_incidents()
    incident = next((i for i in incidents if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    logs = load_logs(incident_id)
    if not logs:
        raise HTTPException(status_code=400, detail="No logs available for this incident")

    try:
        result = analyze_incident(incident, logs)
        return {"incident_id": incident_id, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
