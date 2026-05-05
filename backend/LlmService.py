"""
LLM extraction service — OpenAI backend.

To swap models or providers, only this file needs to change.
The public contract is: extract_obligations_from_text(text) -> list[dict]
Each dict contains: title, description, sourceQuote, priority, status.
"""

import json
import os

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

load_dotenv()

# ---------------------------------------------------------------------------
# System prompt — sent with every extraction request
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """
You are a compliance extraction engine. Read the provided regulatory or compliance text and extract every compliance obligation it contains.

Return ONLY a valid JSON array — no markdown fences, no explanation, nothing else. Use this exact shape:

[
  {
    "title": "short obligation title",
    "description": "detailed explanation of what must be done and by whom",
    "sourceQuote": "verbatim excerpt copied from the input text that grounds this obligation",
    "priority": "high | medium | low",
    "status": "draft"
  }
]

Rules:
- Do NOT invent obligations. Every obligation must be directly grounded in the provided text.
- sourceQuote must be an exact verbatim excerpt from the input text — copy-paste, not paraphrased.
- Set priority to "high" when the obligation involves: legal deadlines, sanctions, AML/KYC requirements, suspicious activity reporting, fraud prevention, or high-risk customer procedures.
- Set priority to "medium" for operational or process requirements without hard deadlines.
- Set priority to "low" for administrative, awareness, or best-practice items.
- status must always be "draft".
- If no compliance obligations are found, return an empty JSON array: []
""".strip()

# ---------------------------------------------------------------------------
# Public function
# ---------------------------------------------------------------------------

def extract_obligations_from_text(text: str) -> list[dict]:
    """
    Call OpenAI to extract compliance obligations from regulatory text.

    Raises:
        RuntimeError: if OPENAI_API_KEY is missing.
        RuntimeError: if the OpenAI call fails or returns unparseable JSON.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is missing. Add it to your .env file."
        )

    client = OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Extract all compliance obligations from the following text:\n\n"
                        + text
                    ),
                },
            ],
            temperature=0,  # deterministic — extraction is not a creative task
        )
    except OpenAIError as exc:
        raise RuntimeError(f"OpenAI request failed: {exc}") from exc

    raw = response.choices[0].message.content or ""

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"OpenAI returned non-JSON content: {raw[:200]!r}"
        ) from exc

    # The model wraps arrays in an object when json_object mode is on.
    # Unwrap common wrapper keys if needed.
    if isinstance(parsed, dict):
        for key in ("obligations", "items", "results", "data"):
            if isinstance(parsed.get(key), list):
                parsed = parsed[key]
                break
        else:
            # Fallback: grab the first list value in the dict
            lists = [v for v in parsed.values() if isinstance(v, list)]
            parsed = lists[0] if lists else []

    if not isinstance(parsed, list):
        raise RuntimeError(
            f"Expected a JSON array of obligations, got: {type(parsed).__name__}"
        )

    return [_validate_obligation(item, i) for i, item in enumerate(parsed)]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_VALID_PRIORITIES = {"low", "medium", "high"}
_VALID_STATUSES = {"draft", "review", "approved", "completed"}


def _validate_obligation(item: dict, index: int) -> dict:
    """
    Coerce and fill in any missing/invalid fields rather than crashing,
    so a single bad obligation doesn't discard the whole extraction.
    """
    if not isinstance(item, dict):
        raise RuntimeError(
            f"Obligation at index {index} is not a JSON object: {item!r}"
        )

    priority = item.get("priority", "medium")
    if priority not in _VALID_PRIORITIES:
        priority = "medium"

    status = item.get("status", "draft")
    if status not in _VALID_STATUSES:
        status = "draft"

    return {
        "title": str(item.get("title", f"Untitled Obligation {index + 1}")),
        "description": str(item.get("description", "")),
        "sourceQuote": str(item.get("sourceQuote", "")),
        "priority": priority,
        "status": status,
    }
