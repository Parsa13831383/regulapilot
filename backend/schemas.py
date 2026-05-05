from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel


# ── Enums ──────────────────────────────────────────────────────────────────

class DocumentStatus(str, Enum):
    uploaded = "uploaded"
    processing = "processing"
    processed = "processed"
    archived = "archived"


class ObligationPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ObligationStatus(str, Enum):
    draft = "draft"
    review = "review"
    approved = "approved"
    completed = "completed"


# ── User ───────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    role: str


class User(BaseModel):
    id: str
    name: str
    email: str
    role: str
    createdAt: datetime
    lastLoginAt: Optional[datetime] = None


# ── Document ───────────────────────────────────────────────────────────────

class DocumentCreate(BaseModel):
    title: str
    content: str
    fileType: str
    uploadedByUserId: str


class Document(BaseModel):
    id: str
    title: str
    content: str
    fileType: str
    status: DocumentStatus
    uploadedByUserId: str
    createdAt: datetime
    updatedAt: datetime


# ── Obligation ─────────────────────────────────────────────────────────────

class ObligationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[ObligationPriority] = None
    status: Optional[ObligationStatus] = None
    dueDate: Optional[datetime] = None
    ownerUserId: Optional[str] = None


class Obligation(BaseModel):
    id: str
    documentId: str
    title: str
    description: str
    sourceQuote: str
    priority: ObligationPriority
    status: ObligationStatus
    dueDate: Optional[datetime] = None
    ownerUserId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime


# ── Response wrappers ──────────────────────────────────────────────────────

class ProcessDocumentResponse(BaseModel):
    document: Document
    obligations: list[Obligation]
