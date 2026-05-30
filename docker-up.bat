@echo off
setlocal

echo [1/2] Starting services with Docker Compose...
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d
if errorlevel 1 (
  echo Docker start failed.
  exit /b 1
)

echo [2/2] Current containers:
docker compose -f docker-compose.yml -f docker-compose.app.yml ps

echo.
echo Frontend:    http://localhost:5173
echo API Gateway: http://localhost:8000/health
echo.
echo To stop all: docker-down.bat
