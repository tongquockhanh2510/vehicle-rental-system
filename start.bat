@echo off

echo Starting all services...

start cmd /k "cd /d config-service && npm run dev"
start cmd /k "cd /d user-service && npm run dev"
start cmd /k "cd /d vehicle-service && npm run dev"
start cmd /k "cd /d rental-service && npm run dev"
start cmd /k "cd /d contract-service && npm run dev"
start cmd /k "cd /d payment-service && npm run dev"
start cmd /k "cd /d tracking-service && npm run dev"
start cmd /k "cd /d inspection-service && npm run dev"
start cmd /k "cd /d dispute-service && npm run dev"
start cmd /k "cd /d review-service && npm run dev"
start cmd /k "cd /d notification-service && npm run dev"
start cmd /k "cd /d statistic-service && npm run dev"
start cmd /k "cd /d api-gateway && npm run dev"
start cmd /k "cd /d web && npm run dev"

echo.
echo All services started!
echo Frontend: http://localhost:5173
echo API Gateway: http://localhost:8000

pause