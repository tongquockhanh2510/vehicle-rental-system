#!/bin/bash

# Script to install dependencies for all services

echo "Installing dependencies for all services..."

services=(
  "config-service"
  "user-service"
  "vehicle-service"
  "rental-service"
  "contract-service"
  "payment-service"
  "tracking-service"
  "inspection-service"
  "dispute-service"
  "review-service"
  "notification-service"
  "statistic-service"
  "api-gateway"
  "web"
)

for service in "${services[@]}"
do
  echo "Installing dependencies for $service..."
  cd "$service"
  npm install
  cd ..
done

echo "All dependencies installed successfully!"
