import json
import os
from fastapi import APIRouter, HTTPException

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

@router.get("/")
def get_incidents():
    return load_incidents()

@router.get("/{incident_id}")
def get_incident(incident_id: str):
    incidents = load_incidents()
    incident = next((i for i in incidents if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.get("/{incident_id}/logs")
def get_incident_logs(incident_id: str):
    incidents = load_incidents()
    incident = next((i for i in incidents if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    logs = load_logs(incident_id)
    return {"incident_id": incident_id, "logs": logs, "count": len(logs)}

@router.get("/stats/summary")
def get_stats():
    incidents = load_incidents()
    total = len(incidents)
    p1 = sum(1 for i in incidents if i["severity"] == "P1")
    p2 = sum(1 for i in incidents if i["severity"] == "P2")
    p3 = sum(1 for i in incidents if i["severity"] == "P3")
    resolved = sum(1 for i in incidents if i["status"] == "resolved")
    active = sum(1 for i in incidents if i["status"] == "active")
    total_users = sum(i["affected_users"] for i in incidents)
    avg_duration = sum(i["duration_minutes"] or 0 for i in incidents if i["duration_minutes"]) / max(resolved, 1)
    return {
        "total": total,
        "by_severity": {"P1": p1, "P2": p2, "P3": p3},
        "by_status": {"resolved": resolved, "active": active},
        "total_affected_users": total_users,
        "avg_resolution_minutes": round(avg_duration, 1),
        "mttr_minutes": round(avg_duration, 1)
    }
