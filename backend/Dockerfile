FROM python:3.12-slim

WORKDIR /app

RUN pip install --upgrade pip

COPY pyproject.toml .

RUN pip install -e .

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]