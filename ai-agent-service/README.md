# AI Agent Service

Natural Language Booking Assistant for the Vehicle Rental System.

## Features

- **Bilingual NLP**: Understands Vietnamese and English
- **Intent Extraction**: Detects SEARCH_VEHICLE, BOOK_VEHICLE, QUERY_PRICE intents
- **Slot Filling**: Extracts vehicle type, location, dates, budget, purpose
- **Date Normalization**: Understands "thứ 6", "cuối tuần này", "Friday afternoon"
- **Smart Ranking**: Ranks vehicles by rating, trust score, and price fit
- **Fallback Suggestions**: Proposes alternatives when no vehicles are found

## Setup

```bash
cd ai-agent-service
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5011` | Port to listen on |
| `VEHICLE_SERVICE_URL` | `http://localhost:3002` | vehicle-service URL |
| `RENTAL_SERVICE_URL` | `http://localhost:3003` | rental-service URL |
| `OPENAI_API_KEY` | _(optional)_ | Future LLM upgrade |

## API Examples

### Chat

```http
POST /api/ai-agent/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "64abc...",
  "message": "Kiếm giùm anh chiếc xe 7 chỗ rộng rãi đi gia đình ở Ea Súp từ sáng thứ 6 đến chiều Chủ Nhật tuần này, giá tầm 1 triệu rưỡi đổ lại."
}
```

**Response:**
```json
{
  "message": "I found 2 suitable 7-seaters in Ea Súp for you.",
  "intent": "SEARCH_VEHICLE",
  "slots": {
    "intent": "SEARCH_VEHICLE",
    "vehicleType": "SEVEN_SEATER",
    "location": "Ea Súp",
    "startDate": "2026-06-05T08:00:00",
    "endDate": "2026-06-07T17:00:00",
    "maxPrice": 1500000,
    "passengerPurpose": "family trip"
  },
  "vehicles": [
    {
      "id": "64abc...",
      "name": "Toyota Innova 2022",
      "pricePerDay": 1200000,
      "rating": 4.8,
      "trustScore": 92,
      "imageUrl": "...",
      "bookingUrl": "/vehicles/.../booking"
    }
  ],
  "actions": [
    {
      "type": "BOOK_NOW",
      "label": "Confirm booking",
      "vehicleId": "64abc...",
      "bookingUrl": "/vehicles/.../booking"
    }
  ]
}
```

### Debug Intent Extraction

```http
POST /api/ai-agent/extract-intent
Content-Type: application/json

{
  "message": "Find me a motorcycle in Hội An for this Saturday"
}
```

## Intent Types

| Intent | Description |
|---|---|
| `SEARCH_VEHICLE` | User wants to find a vehicle |
| `BOOK_VEHICLE` | User wants to book a specific vehicle |
| `QUERY_PRICE` | User asking about pricing |
| `CANCEL_BOOKING` | User wants to cancel |
| `UNKNOWN` | Could not determine intent |

## Date Normalization Examples

| Input | Normalized |
|---|---|
| "sáng thứ 6" | Next Friday at 08:00:00 |
| "chiều Chủ Nhật tuần này" | Next Sunday at 17:00:00 |
| "this weekend" | Next Saturday at 08:00:00 |
| "ngày mai" | Tomorrow at 08:00:00 |

## Vehicle Type Mapping

| Input | Mapped To |
|---|---|
| "7 chỗ", "7 seat", "Innova" | `SEVEN_SEATER` |
| "4 chỗ", "sedan", "ô tô" | `CAR` |
| "bán tải", "pickup" | `PICKUP_TRUCK` |
| "xe máy", "motorbike" | `MOTORCYCLE` |
| "xe đạp", "bicycle" | `BICYCLE` |

## Running Tests

```bash
npm test
```

## Architecture

```
ai-agent-service/
├── src/
│   ├── index.js                       # Express entry point
│   ├── routes/
│   │   └── chatRoutes.js              # POST /api/ai-agent/chat
│   ├── services/
│   │   └── vehicleSearchClient.js     # Calls vehicle-service + ranking
│   └── utils/
│       └── intentExtractor.js         # Rule-based NLP engine
└── tests/
    └── intentExtractor.test.js
```

## Frontend Usage

The AI Assistant is available at `/ai-assistant` in the frontend.
A floating button appears on the vehicle search page (`/vehicles`) to open the assistant.

The assistant:
1. Extracts intent and slots from user message
2. Searches vehicle-service with extracted filters
3. Returns top 3 ranked vehicles with booking buttons
4. If no vehicles found, suggests alternatives

**Important**: The assistant does NOT book vehicles automatically.
The user must click "Confirm booking" which opens the existing booking flow.
