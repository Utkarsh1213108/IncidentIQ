from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import incidents, analyze, postmortem

app = FastAPI(
    title="IncidentIQ API",
    description="AI-powered incident root cause analysis for SRE teams",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])
app.include_router(postmortem.router, prefix="/api/postmortem", tags=["postmortem"])

@app.get("/")
def root():
    return {"status": "ok", "service": "IncidentIQ API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
