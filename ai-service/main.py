# ai-service/main.py
# This service wraps the TradingAgentsGraph pipeline behind a simple HTTP API.
# The frontend sends { asset, timeframe } and gets back { signal, confidence, explanation }.

import os
import sys
import re
from datetime import date
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Bootstrap: make the project root importable so "tradingagents" package can
# be found when uvicorn runs from the ai-service subdirectory.
# ---------------------------------------------------------------------------
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

# Load root .env (contains OPENROUTER_API_KEY, etc.)
load_dotenv(os.path.join(_project_root, ".env"))

from tradingagents.graph.trading_graph import TradingAgentsGraph  # noqa: E402
from tradingagents.default_config import DEFAULT_CONFIG  # noqa: E402

# ---------------------------------------------------------------------------
# Configuration — OpenRouter + free Gemma model
# ---------------------------------------------------------------------------
OPENROUTER_MODEL = os.getenv("TRADINGAGENTS_MODEL", "google/gemini-2.5-flash:free")

_AI_CONFIG = {
    **DEFAULT_CONFIG,
    "llm_provider": "openrouter",
    "deep_think_llm": OPENROUTER_MODEL,
    "quick_think_llm": OPENROUTER_MODEL,
    "output_language": "English",
    "max_debate_rounds": 1,
    "max_risk_discuss_rounds": 1,
}

# Default analysts to use for every analysis request
_DEFAULT_ANALYSTS = ["market", "news", "fundamentals"]

# Thread pool for blocking TradingAgentsGraph calls
_executor = ThreadPoolExecutor(max_workers=2)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    _executor.shutdown(wait=False)


app = FastAPI(
    title="AI Trading Assistant Service",
    version="2.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    asset: str   # e.g. "BTC-USD", "SPY", "EURUSD=X"


class AnalyzeResponse(BaseModel):
    signal: str       # "buy" | "sell" | "hold"
    confidence: int   # 0-100
    explanation: str  # full analyst report excerpt


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _timeframe_to_analysts(timeframe: str) -> list[str]:
    """Select analysts based on requested timeframe depth."""
    short = {"5m", "15m", "1h"}
    if timeframe in short:
        # Shorter timeframes → faster, market + news only
        return ["market", "news"]
    return _DEFAULT_ANALYSTS


def _signal_to_enum(raw: str) -> str:
    """Normalise BUY / OVERWEIGHT / SELL / UNDERWEIGHT / HOLD → buy/sell/hold."""
    upper = raw.strip().upper()
    if upper in ("BUY", "OVERWEIGHT"):
        return "buy"
    if upper in ("SELL", "UNDERWEIGHT"):
        return "sell"
    return "hold"


def _estimate_confidence(signal_enum: str, full_text: str) -> int:
    """
    Heuristic confidence score based on signal strength keywords in the report.
    Returns an integer between 50 and 95.
    """
    text_lower = full_text.lower()
    strong_keywords = [
        "strongly", "clear", "confident", "high conviction",
        "significant", "decisive", "robust"
    ]
    weak_keywords = [
        "uncertain", "cautious", "mixed", "volatile", "risk",
        "unclear", "watch", "wait"
    ]
    score = 65  # baseline
    for kw in strong_keywords:
        if kw in text_lower:
            score += 4
    for kw in weak_keywords:
        if kw in text_lower:
            score -= 3
    return max(50, min(95, score))


def _extract_explanation(full_decision: str) -> str:
    """
    Extract a clean summary paragraph from the full agent decision text.
    Returns up to ~800 characters for the UI card.
    """
    if not full_decision:
        return "Analysis complete."
    # Try to grab the first substantial paragraph (after any markdown headers)
    lines = [l.strip() for l in full_decision.split("\n") if l.strip()]
    paragraphs = []
    for line in lines:
        # Skip markdown headers and bullet separators
        if re.match(r"^#+\s", line) or line.startswith("---"):
            continue
        paragraphs.append(line)
        if sum(len(p) for p in paragraphs) > 600:
            break
    text = " ".join(paragraphs)
    return text[:800] + ("…" if len(text) > 800 else "")


def _run_analysis(asset: str) -> AnalyzeResponse:
    """
    Synchronous worker that runs the full TradingAgentsGraph pipeline.
    Executed in a thread pool so FastAPI remains non-blocking.
    """
    graph = TradingAgentsGraph(
        selected_analysts=_DEFAULT_ANALYSTS,
        debug=False,
        config=_AI_CONFIG,
    )

    trade_date = str(date.today())
    _final_state, processed_signal = graph.propagate(asset, trade_date)

    signal_enum = _signal_to_enum(processed_signal or "hold")
    full_text = _final_state.get("final_trade_decision", "")
    explanation = _extract_explanation(full_text)
    confidence = _estimate_confidence(signal_enum, full_text)

    return AnalyzeResponse(
        signal=signal_enum,
        confidence=confidence,
        explanation=explanation,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_market(request: AnalyzeRequest):
    """
    Run the TradingAgents multi-agent pipeline for the given asset.
    This is a long-running operation (typically 1–5 minutes).
    """
    import asyncio

    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(
            _executor,
            _run_analysis,
            request.asset,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return result


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model": OPENROUTER_MODEL,
        "provider": "openrouter",
    }
