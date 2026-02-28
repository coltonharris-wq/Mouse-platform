# Base Python image
FROM python:3.11-slim as base

# Security updates
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r openclaw && useradd -r -g openclaw openclaw

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM base as production

COPY --chown=openclaw:openclaw api/ ./api/
COPY --chown=openclaw:openclaw bot-handlers/ ./bot-handlers/
COPY --chown=openclaw:openclaw orchestrator/ ./orchestrator/
COPY --chown=openclaw:openclaw security/ ./security/

USER openclaw

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# Development stage
FROM base as development

RUN pip install pytest pytest-asyncio httpx

COPY . .

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
