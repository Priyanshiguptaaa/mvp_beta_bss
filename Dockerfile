# Use official Python image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy backend code
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Install dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Expose port (Railway will set $PORT)
EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]