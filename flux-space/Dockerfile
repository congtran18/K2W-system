FROM python:3.11-slim

WORKDIR /app

# Only install what's actually needed (no GUI libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV PORT=7860
EXPOSE 7860

CMD ["gunicorn", "-w", "1", "-t", "300", "-b", "0.0.0.0:7860", "app:app"]
