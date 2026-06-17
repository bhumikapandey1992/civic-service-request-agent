"""Agent service: classifies civic service requests via LLM or rule-based fallback."""

import os
import json


def classify_request_agent(request_text: str) -> dict:
    """
    Classify a service request into category, priority, summary, action, and department.

    Uses Gemini gemini-2.0-flash if GEMINI_API_KEY is set; otherwise applies
    keyword-based rule logic as a fully offline fallback.
    """
    api_key = os.environ.get("GEMINI_API_KEY")

    if api_key:
        return _classify_with_llm(request_text, api_key)
    else:
        return _classify_with_rules(request_text)


def _classify_with_llm(request_text: str, api_key: str) -> dict:
    """Call Gemini to classify the request."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    system_prompt = (
        "You are a civic service request triage agent for the City of Los Angeles.\n"
        "Given a service request, respond ONLY with a valid JSON object containing these keys:\n"
        '- category: one of ["Facility Maintenance", "Public Works", "Procurement", '
        '"IT Support", "Safety Issue", "General Inquiry"]\n'
        '- priority: one of ["Low", "Medium", "High", "Critical"]\n'
        "- summary: a 1-2 sentence plain English summary of the request\n"
        "- recommended_action: a specific next step for the intake coordinator\n"
        "- department: the responsible department name\n"
        "Do not include any text outside the JSON object."
    )

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=request_text,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.2,
        ),
    )

    raw = response.text.strip()
    # Strip markdown code fences if Gemini wraps the JSON
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def _classify_with_rules(request_text: str) -> dict:
    """Apply keyword matching rules to classify the request without an LLM."""
    text = request_text.lower()

    keywords = {
        "Facility Maintenance": [
            "elevator", "hvac", "plumbing", "roof", "door",
            "window", "light", "ceiling", "floor", "restroom",
        ],
        "Public Works": [
            "road", "sidewalk", "pothole", "streetlight",
            "drain", "sewer", "tree", "curb",
        ],
        "Procurement": [
            "supply", "vendor", "contract", "purchase",
            "order", "equipment", "bid",
        ],
        "IT Support": [
            "computer", "network", "wifi", "software",
            "hardware", "access", "password", "printer",
        ],
        "Safety Issue": [
            "hazard", "fire", "emergency", "leak",
            "chemical", "injury", "unsafe", "violation",
        ],
    }

    priority_keywords = {
        "Critical": ["emergency", "fire", "injury", "flood", "gas leak", "collapse"],
        "High": ["broken", "not working", "stopped", "failed", "urgent"],
        "Medium": ["issue", "problem", "need", "request", "repair"],
        "Low": ["inquiry", "question", "information", "general"],
    }

    department_map = {
        "Facility Maintenance": "Building & Facility Operations",
        "Public Works": "Bureau of Street Services",
        "Procurement": "Procurement & Contract Services",
        "IT Support": "Information Technology Agency",
        "Safety Issue": "Environmental Health & Safety",
        "General Inquiry": "General Administration",
    }

    action_map = {
        "Facility Maintenance": "Create a facility maintenance work order and notify the building operations team.",
        "Public Works": "Log a public works ticket and dispatch field inspection crew.",
        "Procurement": "Initiate a procurement review and contact the relevant vendor or contract officer.",
        "IT Support": "Open an IT helpdesk ticket and assign to the technical support team.",
        "Safety Issue": "Escalate immediately to the safety officer and initiate incident response protocol.",
        "General Inquiry": "Route to general administration for review and response.",
    }

    # Determine category by first keyword match
    category = "General Inquiry"
    for cat, words in keywords.items():
        if any(word in text for word in words):
            category = cat
            break

    # Determine priority by first keyword match (highest priority wins)
    priority = "Low"
    for pri in ["Critical", "High", "Medium", "Low"]:
        if any(kw in text for kw in priority_keywords[pri]):
            priority = pri
            break

    summary = f"Service request submitted regarding: {request_text[:80]}..."
    recommended_action = action_map[category]
    department = department_map[category]

    return {
        "category": category,
        "priority": priority,
        "summary": summary,
        "recommended_action": recommended_action,
        "department": department,
    }
