# RegulaPilot – AI Compliance Workflow for Fintech Teams

> Turn complex regulatory documents into structured obligations, risks, and action plans in minutes — not weeks.

---

## 🚀 Overview

RegulaPilot is an AI-powered system designed to help fintech and regulated teams process complex compliance documents quickly and effectively.

Instead of spending hours manually reviewing FCA guidance, AML/KYC policies, or internal compliance reports, RegulaPilot transforms unstructured regulatory text into:

- ✅ Key obligations  
- ⚠️ Potential risks  
- 📋 Actionable compliance tasks  

All within seconds.

This project was built as a **rapid prototype** to demonstrate how AI-native backend workflows can transform regulatory operations.

---

## 🌐 Live Demo

👉 https://regulapilot-nf6wduubo-parsananavazadps-projects.vercel.app/

---

## 🧠 Problem

Compliance teams face a major bottleneck:

- Large, dense regulatory documents  
- Manual interpretation and breakdown  
- Time-consuming risk identification  
- Lack of structured, actionable outputs  

This leads to:
- Slow decision-making  
- Increased operational costs  
- Higher risk of missed obligations  

---

## 💡 Solution

RegulaPilot converts unstructured regulatory text into structured, traceable compliance data:

1. Upload or paste regulatory text  
2. Backend processes the content using an LLM  
3. Outputs structured entities:
   - Obligations
   - Risks
   - Actionable tasks  

These are presented in a clean dashboard for review and workflow management.

---

## 🧱 System Architecture

RegulaPilot is built as a full-stack AI workflow system:

- **Frontend**: React + Tailwind (deployed on Vercel)
- **Backend API**: FastAPI (Python)
- **AI Layer**: OpenAI (`gpt-4.1-mini`)
- **Validation Layer**: Pydantic schemas
- **Storage (MVP)**: In-memory data stores (designed for easy migration to PostgreSQL)

### Core Flow

1. User uploads a regulatory document  
2. Backend sends content to LLM with a structured prompt  
3. LLM returns JSON-formatted obligations  
4. Backend validates and normalises the output  
5. Structured data is exposed via REST API  

---

## ⚙️ Backend API

The system exposes a RESTful API for managing compliance workflows.

### Key Endpoints

- `POST /users` → Create users  
- `POST /documents` → Upload regulatory content  
- `POST /documents/{id}/process` → Trigger AI extraction  
- `GET /documents/{id}/obligations` → Retrieve extracted obligations  
- `PATCH /obligations/{id}` → Update status, assign owner, set deadlines  

### Design Highlights

- Strong schema validation using **Pydantic**
- Deterministic AI extraction (`temperature=0`)
- JSON-only LLM responses (no brittle parsing)
- Clean separation of concerns:
  - `main.py` → API layer  
  - `schemas.py` → data contracts  
  - `LlmService.py` → AI pipeline  

---

## 🧠 AI Extraction Engine

RegulaPilot transforms unstructured regulatory text into structured compliance entities.

Each obligation includes:

- Title  
- Description  
- Priority (`low` / `medium` / `high`)  
- Status (`draft` → `review` → `approved` → `completed`)  
- Source quote (verbatim traceability to original text)  

### Key Design Decisions

- **No hallucination policy** — all outputs must be grounded in source text  
- **Verbatim traceability** — every obligation links back to exact text  
- **Deterministic output** — consistent results across runs  
- **Lenient validation** — partial extraction errors do not break the pipeline  

---

## ⚙️ Features

- 📄 Regulatory document analysis (FCA, AML/KYC, internal policies)  
- 🧩 Structured obligation extraction  
- ⚠️ Risk identification  
- 📋 Task generation  
- 📊 Dashboard-style output  
- 🧪 Demo-ready sample workflow  

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui  
- **Backend**: FastAPI (Python)  
- **Validation**: Pydantic v2  
- **AI Integration**: OpenAI API (`gpt-4.1-mini`)  
- **Deployment**: Vercel (frontend)  
- **Storage (MVP)**: In-memory (designed for PostgreSQL upgrade)  

---

## 🧪 MVP Scope

This is a **rapid prototype (MVP)** focused on:

- Speed of execution  
- Validating the core AI workflow  
- Demonstrating structured extraction from real regulatory text  

Some production features (auth, database, async jobs) are intentionally deferred.

---

## 🔮 Future Improvements

- 🗄️ PostgreSQL + SQLAlchemy integration  
- 🔐 JWT authentication & role-based access  
- 📤 Exportable audit reports (PDF/CSV)  
- 🔄 Workflow automation (task lifecycle + assignment)  
- 📡 Async processing for large documents  
- 📂 File upload (PDF/DOCX parsing)  

---

## 🚀 Why This Project

This project demonstrates:

- Building **AI-native backend systems**, not just UI demos  
- Designing **structured extraction pipelines using LLMs**  
- Applying **clean API architecture and validation layers**  
- Solving **real-world fintech compliance problems**  

---

## 🤝 Feedback

If you're working in fintech, compliance, or AI products, I’d love your feedback.

---

## 👨‍💻 Author

**Parsa Nanavazadeh**  
Full-Stack Developer  

🌐 Portfolio: https://parsananavazadeh.com  
💼 LinkedIn: www.linkedin.com/in/parsa13831383  

---

## ⚡ Note

This project was built as a **high-speed proof-of-concept**, prioritising execution, clarity of idea, and system design over production completeness.
