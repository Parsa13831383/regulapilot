"""
LLM extraction service — OpenAI backend.

To swap models or providers, only this file needs to change.
Public contract: extract_compliance_data(text) -> dict
Returns: {"obligations": [...], "risks": [...], "actions": [...]}
"""

import json
import logging
import os

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

load_dotenv()

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are a compliance AI. Extract obligations, risks, and actions from the text.
Return ONLY valid JSON matching the schema. Do not include explanations.

{
  "obligations": [
    { "text": "string", "priority": "low|medium|high" }
  ],
  "risks": [
    { "text": "string", "severity": "low|medium|high" }
  ],
  "actions": [
    { "text": "string" }
  ]
}

Rules:
- obligations: specific requirements or duties the organisation must fulfil
- risks: compliance risks, gaps, or exposures identified in the text
- actions: concrete steps that should be taken to address obligations or risks
- priority/severity "high": legal deadlines, sanctions, AML/KYC, suspicious activity reporting, fraud prevention
- priority/severity "medium": operational or process requirements without hard deadlines
- priority/severity "low": administrative, awareness, or best-practice items
- Every item must be grounded in the provided text — do not invent content
- If a section has no items, return an empty array for that key"""

_VALID_LEVELS = {"low", "medium", "high"}


def extract_compliance_data(text: str) -> dict:
    """
    Call OpenAI to extract compliance obligations, risks, and actions.

    Returns:
        {
            "obligations": [{"text": str, "priority": str}, ...],
            "risks":       [{"text": str, "severity": str}, ...],
            "actions":     [{"text": str}, ...],
        }

    Raises:
        RuntimeError: if OPENAI_API_KEY is missing, the API call fails,
                      or the response cannot be parsed as JSON.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to your .env file.")

    client = OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Extract compliance data from this text:\n\n{text}",
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
        logger.error("OpenAI returned non-JSON response: %r", raw[:500])
        raise RuntimeError(
            f"OpenAI returned non-JSON content: {raw[:200]!r}"
        ) from exc

    return {
        "obligations": [
            _validate_obligation(o, i)
            for i, o in enumerate(parsed.get("obligations", []))
        ],
        "risks": [
            _validate_risk(r, i)
            for i, r in enumerate(parsed.get("risks", []))
        ],
        "actions": [
            _validate_action(a, i)
            for i, a in enumerate(parsed.get("actions", []))
        ],
    }


def _validate_obligation(item: dict, index: int) -> dict:
    if not isinstance(item, dict):
        return {"text": f"Obligation {index + 1}", "priority": "medium"}
    priority = item.get("priority", "medium")
    if priority not in _VALID_LEVELS:
        priority = "medium"
    return {
        "text": str(item.get("text", f"Obligation {index + 1}")),
        "priority": priority,
    }


def _validate_risk(item: dict, index: int) -> dict:
    if not isinstance(item, dict):
        return {"text": f"Risk {index + 1}", "severity": "medium"}
    severity = item.get("severity", "medium")
    if severity not in _VALID_LEVELS:
        severity = "medium"
    return {
        "text": str(item.get("text", f"Risk {index + 1}")),
        "severity": severity,
    }


def _validate_action(item: dict, index: int) -> dict:
    if not isinstance(item, dict):
        return {"text": f"Action {index + 1}"}
    return {"text": str(item.get("text", f"Action {index + 1}"))}
