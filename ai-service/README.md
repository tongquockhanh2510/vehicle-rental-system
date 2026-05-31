# AI Service

Smart pricing, review summarization, and trust score calculation for the Vehicle Rental System.

## Features

| Feature | Endpoint | Description |
|---|---|---|
| Smart Pricing | `POST /api/ai/pricing/suggest` | Rule-based dynamic price suggestion |
| Review Summary | `POST /api/ai/reviews/summarize` | AI summary of vehicle reviews |
| Trust Score | `POST /api/ai/trust-score/calculate` | 1–100 trust score for vehicle + owner |

## Setup

```bash
cd ai-service
npm install
cp .env.example .env   # edit as needed
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5010` | Port to listen on |
| `STATISTIC_SERVICE_URL` | `http://localhost:3011` | statistic-service URL |
| `REVIEW_SERVICE_URL` | `http://localhost:3009` | review-service URL |
| `VEHICLE_SERVICE_URL` | `http://localhost:3002` | vehicle-service URL |
| `RENTAL_SERVICE_URL` | `http://localhost:3003` | rental-service URL |
| `INSPECTION_SERVICE_URL` | `http://localhost:3012` | inspection-service URL |
| `USER_SERVICE_URL` | `http://localhost:3001` | user-service URL |
| `OPENAI_API_KEY` | _(optional)_ | Future LLM integration |

## API Examples

### Smart Pricing

```http
POST /api/ai/pricing/suggest
Content-Type: application/json

{
  "vehicleId": "64abc...",
  "vehicleType": "SEVEN_SEATER",
  "location": "Đà Lạt, Lâm Đồng",
  "basePrice": 800000,
  "startDate": "2026-06-06",
  "endDate": "2026-06-08",
  "smartPricingEnabled": true
}
```

**Response:**
```json
{
  "vehicleId": "64abc...",
  "basePrice": 800000,
  "suggestedPrice": 1104000,
  "normalDayPrice": 920000,
  "weekendPrice": 1104000,
  "confidence": 0.73,
  "reason": "Date range includes weekend — demand is higher. Location \"Đà Lạt\" is a high-demand tourist area.",
  "factors": {
    "hasWeekend": true,
    "hasHoliday": false,
    "hasTet": false,
    "highDemand": true,
    "vehicleTypeMultiplier": 1.15,
    "finalMultiplier": 1.2
  }
}
```

### Review Summary

```http
POST /api/ai/reviews/summarize
Content-Type: application/json

{
  "vehicleId": "64abc..."
}
```

**Response:**
```json
{
  "vehicleId": "64abc...",
  "summary": {
    "pros": ["Owner is very responsive, friendly and professional.", "Vehicle is clean."],
    "cons": ["Air conditioning may not cool the cabin effectively."],
    "commonComplaints": [],
    "ownerBehavior": "Owner is very responsive, friendly and professional.",
    "vehicleCondition": "Vehicle is in acceptable condition.",
    "recommendation": "Good choice overall. Minor issues reported but generally positive experience."
  },
  "averageRating": 4.2,
  "reviewCount": 15,
  "updatedAt": "2026-05-31T10:00:00Z"
}
```

### Trust Score

```http
POST /api/ai/trust-score/calculate
Content-Type: application/json

{
  "vehicleId": "64abc...",
  "ownerId": "64xyz..."
}
```

**Response:**
```json
{
  "vehicleId": "64abc...",
  "ownerId": "64xyz...",
  "trustScore": 87,
  "level": "Excellent",
  "explanation": "Verified owner. High review sentiment. Low cancellation rate. 25 completed rentals.",
  "breakdown": {
    "sentiment": 30,
    "averageRating": 17,
    "cancellationRate": 14,
    "inspection": 12,
    "history": 9,
    "verification": 5
  },
  "calculatedAt": "2026-05-31T10:00:00Z"
}
```

## RabbitMQ Events

| Event | Direction | Description |
|---|---|---|
| `vehicle.smart_pricing.requested` | Consumed | Trigger pricing recalculation |
| `ai.smart_pricing.generated` | Published | Pricing result ready |

## Running Tests

```bash
npm test
```

## Architecture

```
ai-service/
├── src/
│   ├── index.js                 # Express entry point
│   ├── routes/
│   │   ├── pricingRoutes.js     # POST /api/ai/pricing/suggest
│   │   ├── reviewRoutes.js      # POST /api/ai/reviews/summarize
│   │   └── trustScoreRoutes.js  # POST /api/ai/trust-score/calculate
│   ├── services/
│   │   └── serviceClient.js     # HTTP clients for other services
│   └── utils/
│       ├── pricingEngine.js     # Rule-based pricing logic
│       ├── reviewSummarizer.js  # NLP review analysis
│       └── trustScoreEngine.js  # Trust score formula
└── tests/
    ├── pricingEngine.test.js
    ├── reviewSummarizer.test.js
    └── trustScoreEngine.test.js
```

## Fallback Behavior

All service calls to external services (review-service, statistic-service, etc.) are wrapped in try/catch. If a service is unavailable, the AI service continues with default values and does **not** crash.

- Missing statistic data → pricing uses rule-based logic only
- Missing reviews → returns "no reviews yet" summary
- Missing inspection/rental data → trust score uses neutral defaults
