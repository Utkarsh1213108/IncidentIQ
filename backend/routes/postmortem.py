import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import generate_postmortem

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

class PostmortemRequest(BaseModel):
    rca: dict

def load_incidents():
    with open(os.path.join(DATA_DIR, "incidents.json")) as f:
        return json.load(f)

@router.post("/{incident_id}")
def create_postmortem(incident_id: str, body: PostmortemRequest):
    incidents = load_incidents()
    incident = next((i for i in incidents if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    try:
        postmortem_md = generate_postmortem(incident, body.rca)
        return {
            "incident_id": incident_id,
            "postmortem": postmortem_md,
            "format": "markdown"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Postmortem generation failed: {str(e)}")
