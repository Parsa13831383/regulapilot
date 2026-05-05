import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from schemas import (
    User, UserCreate,
    Document, DocumentCreate, DocumentStatus,
    Obligation, ObligationUpdate, ObligationStatus,
    ProcessDocumentResponse,
    RedeemCodeRequest, RedeemCodeResponse,
    AdminInviteCodeResponse,
)
from LlmService import extract_obligations_from_text

app = FastAPI(title="RegulaPilot API", version="0.1.0")

# ── CORS ───────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ─────────────────────────────────────────────────────────────────

ADMIN_SECRET: str = os.getenv("ADMIN_SECRET", "")
CODE_TTL = timedelta(days=3)
SESSION_RUNS = 2  # LLM processing runs granted per redeemed code

# ── In-memory stores ───────────────────────────────────────────────────────

users_db: dict[str, User] = {}
documents_db: dict[str, Document] = {}
obligations_db: dict[str, Obligation] = {}

# invite_codes_db: code → { created_at, redeemed }
invite_codes_db: dict[str, dict] = {}

# sessions_db: token → { remaining_runs }
sessions_db: dict[str, dict] = {}


# ── Helpers ────────────────────────────────────────────────────────────────

def now() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid.uuid4())


def get_session(authorization: Optional[str]) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    return sessions_db.get(token)


# ── Health ─────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"api": "RegulaPilot", "status": "ok"}


# ── Admin ──────────────────────────────────────────────────────────────────

@app.post("/admin/invite-codes", response_model=AdminInviteCodeResponse)
def create_invite_code(x_admin_secret: Optional[str] = Header(None)):
    if not ADMIN_SECRET or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="unauthorized")

    code = secrets.token_urlsafe(16)
    invite_codes_db[code] = {"created_at": now(), "redeemed": False}

    return AdminInviteCodeResponse(code=code, expiresInDays=CODE_TTL.days)


# ── Auth ───────────────────────────────────────────────────────────────────

@app.post("/auth/redeem-code", response_model=RedeemCodeResponse)
def redeem_code(body: RedeemCodeRequest):
    code = body.inviteCode.strip()
    record = invite_codes_db.get(code)

    if record is None:
        raise HTTPException(status_code=403, detail="invalid_code")

    if record["redeemed"]:
        raise HTTPException(status_code=403, detail="already_used")

    if now() - record["created_at"] > CODE_TTL:
        raise HTTPException(status_code=403, detail="expired_code")

    # Mark as redeemed — one-time use enforced here
    record["redeemed"] = True

    token = new_id()
    sessions_db[token] = {"remaining_runs": SESSION_RUNS}

    return RedeemCodeResponse(token=token, remainingRuns=SESSION_RUNS)


# ── Users ──────────────────────────────────────────────────────────────────

@app.post("/users", response_model=User, status_code=201)
def create_user(body: UserCreate):
    user = User(
        id=new_id(),
        name=body.name,
        email=body.email,
        role=body.role,
        createdAt=now(),
    )
    users_db[user.id] = user
    return user


@app.get("/users", response_model=list[User])
def list_users():
    return list(users_db.values())


# ── Documents ──────────────────────────────────────────────────────────────

@app.post("/documents", response_model=Document, status_code=201)
def create_document(body: DocumentCreate):
    if body.uploadedByUserId not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    doc = Document(
        id=new_id(),
        title=body.title,
        content=body.content,
        fileType=body.fileType,
        status=DocumentStatus.uploaded,
        uploadedByUserId=body.uploadedByUserId,
        createdAt=now(),
        updatedAt=now(),
    )
    documents_db[doc.id] = doc
    return doc


@app.get("/documents", response_model=list[Document])
def list_documents():
    return list(documents_db.values())


@app.get("/documents/{document_id}", response_model=Document)
def get_document(document_id: str):
    doc = documents_db.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@app.post("/documents/{document_id}/process", response_model=ProcessDocumentResponse)
def process_document(
    document_id: str,
    authorization: Optional[str] = Header(None),
):
    # Auth check — must happen before any work
    session = get_session(authorization)
    if session is None:
        raise HTTPException(status_code=401, detail="invalid_token")
    if session["remaining_runs"] <= 0:
        raise HTTPException(status_code=403, detail="no_remaining_runs")

    doc = documents_db.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Mark as processing
    doc = doc.model_copy(update={"status": DocumentStatus.processing, "updatedAt": now()})
    documents_db[document_id] = doc

    # Call OpenAI — run is only counted if this succeeds
    try:
        extracted = extract_obligations_from_text(doc.content)
    except RuntimeError as exc:
        # Roll back status so the caller can retry without losing a run
        documents_db[document_id] = doc.model_copy(
            update={"status": DocumentStatus.uploaded, "updatedAt": now()}
        )
        raise HTTPException(status_code=502, detail=str(exc))

    # Decrement only after a successful extraction
    session["remaining_runs"] -= 1

    created_obligations: list[Obligation] = []
    for item in extracted:
        obligation = Obligation(
            id=new_id(),
            documentId=document_id,
            title=item["title"],
            description=item["description"],
            sourceQuote=item["sourceQuote"],
            priority=item["priority"],
            status=item.get("status", ObligationStatus.draft),
            createdAt=now(),
            updatedAt=now(),
        )
        obligations_db[obligation.id] = obligation
        created_obligations.append(obligation)

    doc = doc.model_copy(update={"status": DocumentStatus.processed, "updatedAt": now()})
    documents_db[document_id] = doc

    return ProcessDocumentResponse(
        document=doc,
        obligations=created_obligations,
        remainingRuns=session["remaining_runs"],
    )


# ── Obligations ────────────────────────────────────────────────────────────

@app.get("/obligations", response_model=list[Obligation])
def list_obligations():
    return list(obligations_db.values())


@app.get("/documents/{document_id}/obligations", response_model=list[Obligation])
def list_document_obligations(document_id: str):
    if document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    return [o for o in obligations_db.values() if o.documentId == document_id]


@app.patch("/obligations/{obligation_id}", response_model=Obligation)
def update_obligation(obligation_id: str, body: ObligationUpdate):
    obligation = obligations_db.get(obligation_id)
    if not obligation:
        raise HTTPException(status_code=404, detail="Obligation not found")

    changes = body.model_dump(exclude_none=True)
    changes["updatedAt"] = now()

    obligation = obligation.model_copy(update=changes)
    obligations_db[obligation_id] = obligation
    return obligation
