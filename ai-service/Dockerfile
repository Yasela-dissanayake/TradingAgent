FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy and install root package (the tradingagents library + its deps)
COPY pyproject.toml ./
COPY tradingagents/ ./tradingagents/
RUN pip install --no-cache-dir .

# Copy and install ai-service-specific deps
COPY ai-service/requirements.txt ./ai-service/requirements.txt
RUN pip install --no-cache-dir -r ./ai-service/requirements.txt

# Copy the FastAPI app
COPY ai-service/main.py ./ai-service/main.py

# Expose 8000 so Railway can forward traffic
EXPOSE 8000

CMD ["sh", "-c", "cd ai-service && uvicorn main:app --host 0.0.0.0 --port 8000"]
