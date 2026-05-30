FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies from backend/requirements.txt
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy manage.py (lives at repo root)
COPY manage.py .

# Copy the backend Django apps
COPY backend/ ./backend/

# Create necessary directories
RUN mkdir -p logs staticfiles media

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "backend.procompare.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
