import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from schemas import (
    User, UserCreate,
    Document, DocumentCreate, DocumentStatus,
    Obligation, ObligationUpdate, ObligationStatus,
    ProcessDocumentResponse,
)
from LlmService import extract_obligations_from_text

app = FastAPI(title="RegulaPilot API", version="0.1.0")

# ── In-memory stores ───────────────────────────────────────────────────────

users_db: dict[str, User] = {}
documents_db: dict[str, Document] = {}
obligations_db: dict[str, Obligation] = {}


# ── Helpers ────────────────────────────────────────────────────────────────

def now() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid.uuid4())


# ── Health ─────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"api": "RegulaPilot", "status": "ok"}


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
def process_document(document_id: str):
    doc = documents_db.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Mark as processing
    doc = doc.model_copy(update={"status": DocumentStatus.processing, "updatedAt": now()})
    documents_db[document_id] = doc

    # Extract obligations via OpenAI
    try:
        extracted = extract_obligations_from_text(doc.content)
    except RuntimeError as exc:
        # Roll back to uploaded so the caller can retry after fixing config
        documents_db[document_id] = doc.model_copy(
            update={"status": DocumentStatus.uploaded, "updatedAt": now()}
        )
        raise HTTPException(status_code=502, detail=str(exc))

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

    # Mark as processed
    doc = doc.model_copy(update={"status": DocumentStatus.processed, "updatedAt": now()})
    documents_db[document_id] = doc

    return ProcessDocumentResponse(document=doc, obligations=created_obligations)


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

    # Only apply fields that were explicitly provided in the request
    changes = body.model_dump(exclude_none=True)
    changes["updatedAt"] = now()

    obligation = obligation.model_copy(update=changes)
    obligations_db[obligation_id] = obligation
    return obligation
