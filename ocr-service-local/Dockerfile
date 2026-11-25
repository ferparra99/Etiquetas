# Variante local para CPU sin AVX2 (Sandy Bridge).
# PaddlePaddle 3.x muere con SIGILL (exit 132) en este equipo; 2.6.2 funciona.
FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1

WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app

# Descarga y deja cacheados los modelos dentro de la imagen.
RUN python -c "from app.engine import OcrEngine; OcrEngine().warm_up()"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
