@echo off

echo Starting all services...

start cmd /k "cd /d user-service && npm.cmd run dev"
start cmd /k "cd /d image-service && npm.cmd run dev"
start cmd /k "cd /d vehicle-service && npm.cmd run dev"
start cmd /k "cd /d rental-service && npm.cmd run dev"
start cmd /k "cd /d contract-service && npm.cmd run dev"
start cmd /k "cd /d payment-service && npm.cmd run dev"
start cmd /k "cd /d tracking-service && npm.cmd run dev"
start cmd /k "cd /d dispute-service && npm.cmd run dev"
start cmd /k "cd /d review-service && npm.cmd run dev"
start cmd /k "cd /d notification-service && npm.cmd run dev"
start cmd /k "cd /d statistic-service && npm.cmd run dev"
start cmd /k "cd /d api-gateway && npm.cmd run dev"
start cmd /k "cd /d web && npm.cmd run dev"

echo.
echo All services started!
echo Frontend: http://localhost:5173
echo API Gateway: http://localhost:8000

pause
