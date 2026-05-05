# Run locally:     uvicorn main:app --reload --port 8000
# Run production:  uvicorn main:app --host 0.0.0.0 --port $PORT

import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# load_dotenv is a no-op when .env is absent (e.g. on Render, which injects
# env vars directly). In development it reads backend/.env.
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
from database import Base, engine, get_db, InviteCode, SessionRecord

app = FastAPI(title="RegulaPilot API", version="0.1.0")

# ── CORS ───────────────────────────────────────────────────────────────────
# Set ALLOWED_ORIGINS on Render as a comma-separated list, e.g.:
#   https://parsananavazadeh.com,https://regula-pilot.vercel.app
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ─────────────────────────────────────────────────────────────────

ADMIN_SECRET: str = os.getenv("ADMIN_SECRET", "")
CODE_TTL = timedelta(days=3)
SESSION_RUNS = 2  # LLM processing runs granted per redeemed code

# ── In-memory stores (users / documents / obligations only) ────────────────

users_db: dict[str, User] = {}
documents_db: dict[str, Document] = {}
obligations_db: dict[str, Obligation] = {}


# ── Startup ────────────────────────────────────────────────────────────────

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


# ── Helpers ────────────────────────────────────────────────────────────────

def now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_aware_utc(dt: datetime) -> datetime:
    """Normalise a datetime from the DB to UTC-aware.

    SQLite stores datetimes without timezone info; Postgres preserves it.
    This makes comparisons with now() safe on both.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def new_id() -> str:
    return str(uuid.uuid4())


# ── Health ─────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"api": "RegulaPilot", "status": "ok"}


# ── Admin ──────────────────────────────────────────────────────────────────

@app.post("/admin/invite-codes", response_model=AdminInviteCodeResponse)
def create_invite_code(
    x_admin_secret: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not ADMIN_SECRET or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="unauthorized")

    n = now()
    invite = InviteCode(
        id=new_id(),
        code=secrets.token_urlsafe(16),
        created_at=n,
        expires_at=n + CODE_TTL,
        redeemed_at=None,
    )
    db.add(invite)
    db.commit()

    return AdminInviteCodeResponse(code=invite.code, expiresInDays=CODE_TTL.days)


# ── Auth ───────────────────────────────────────────────────────────────────

@app.post("/auth/redeem-code", response_model=RedeemCodeResponse)
def redeem_code(body: RedeemCodeRequest, db: Session = Depends(get_db)):
    code = body.inviteCode.strip()

    # SELECT FOR UPDATE prevents two simultaneous requests redeeming the same code
    invite = (
        db.query(InviteCode)
        .filter(InviteCode.code == code)
        .with_for_update()
        .first()
    )

    if invite is None:
        raise HTTPException(status_code=403, detail="invalid_code")
    if invite.redeemed_at is not None:
        raise HTTPException(status_code=403, detail="already_used")
    if now() > ensure_aware_utc(invite.expires_at):
        raise HTTPException(status_code=403, detail="expired_code")

    invite.redeemed_at = now()

    token = new_id()
    session = SessionRecord(
        id=new_id(),
        token=token,
        invite_code_id=invite.id,
        remaining_runs=SESSION_RUNS,
        created_at=now(),
    )
    db.add(session)
    db.commit()

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
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="invalid_token")
    token = authorization.removeprefix("Bearer ").strip()

    # SELECT FOR UPDATE holds a row lock until commit/rollback, preventing two
    # concurrent requests from both passing the remaining_runs > 0 check.
    session_record = (
        db.query(SessionRecord)
        .filter(SessionRecord.token == token)
        .with_for_update()
        .first()
    )
    if session_record is None:
        raise HTTPException(status_code=401, detail="invalid_token")
    if session_record.remaining_runs <= 0:
        raise HTTPException(status_code=403, detail="no_remaining_runs")

    doc = documents_db.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = doc.model_copy(update={"status": DocumentStatus.processing, "updatedAt": now()})
    documents_db[document_id] = doc

    try:
        extracted = extract_obligations_from_text(doc.content)
    except RuntimeError as exc:
        # Roll back doc status and release the DB lock without decrementing
        documents_db[document_id] = doc.model_copy(
            update={"status": DocumentStatus.uploaded, "updatedAt": now()}
        )
        db.rollback()
        raise HTTPException(status_code=502, detail=str(exc))

    # Decrement only after successful extraction
    session_record.remaining_runs -= 1
    db.commit()

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
        remainingRuns=session_record.remaining_runs,
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
