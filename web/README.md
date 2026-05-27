# Vehicle Rental System - Web Application

A modern web application for a vehicle rental system built with React, Vite, and Tailwind CSS.

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Vehicle Browsing**: Filter and search available vehicles
- **Rental Management**: Request, confirm, and manage rental requests
- **Contract Management**: Track pickup, return, and contract status
- **Dispute Management**: Create and manage compensation claims
- **Notifications**: Real-time notifications for rental activities
- **User Profiles**: Manage personal information and vehicle inventory

## Architecture

The application follows a modular architecture with:
- **Pages**: Full-page components for main routes
- **Components**: Reusable UI components
- **Context**: Authentication state management
- **API**: Centralized API client with axios

## Prerequisites

- Node.js 16+ or higher
- pnpm (recommended) or npm

## Installation

1. Install dependencies using pnpm:
```bash
pnpm install
```

Or with npm:
```bash
npm install
```

## Setup

The application connects to the API Gateway at `http://localhost:8000`. Ensure all backend services are running before starting the web application.

### Environment Configuration

The API base URL is configured in `src/api/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Development

Start the development server:

```bash
pnpm dev
```

Or with npm:
```bash
npm run dev
```

The application will open at `http://localhost:5173` by default.

## Build for Production

Build the application:

```bash
pnpm build
```

Or with npm:
```bash
npm run build
```

Preview the production build:

```bash
pnpm preview
```

## Application Structure

```
src/
├── api/
│   └── api.js              # Axios API client with interceptors
├── components/
│   ├── Navbar.jsx          # Navigation component
│   └── PrivateRoute.jsx    # Protected route wrapper
├── context/
│   └── AuthContext.jsx     # Authentication state management
├── pages/
│   ├── HomePage.jsx        # Home page
│   ├── LoginPage.jsx       # Login page
│   ├── RegisterPage.jsx    # Registration page
│   ├── VehicleListPage.jsx # Vehicle browsing
│   ├── VehicleDetailPage.jsx # Vehicle details & rental request
│   ├── MyRentalsPage.jsx   # Rental request management
│   ├── MyContractsPage.jsx # Contract management
│   ├── MyVehiclesPage.jsx  # Vehicle inventory management
│   ├── AddVehiclePage.jsx  # Add new vehicle
│   ├── DisputesPage.jsx    # Dispute management
│   └── NotificationsPage.jsx # Notifications
├── App.jsx                 # Main router and app component
├── main.jsx                # Application entry point
└── index.css               # Global styles
```

## Key Features

### Authentication
- User registration with email, name, and phone
- JWT-based authentication
- Automatic token refresh and logout on 401

### Vehicle Management
- Browse available vehicles with filters
- Filter by type, price range
- Pagination support
- Add new vehicles with multiple images
- Edit and delete vehicles

### Rental Process
1. User requests a rental (specify dates)
2. Vehicle owner confirms or rejects
3. System auto-creates contract on confirmation
4. Renter picks up and records odometer/fuel
5. Renter returns and records damage report

### Dispute Management
- Create compensation claims with damage reports
- Track claim status (pending/approved/rejected)
- Admin dashboard for claim review
- Approve with compensation amount or reject with notes

### Notifications
- Real-time notifications for rental status changes
- Mark notifications as read
- Event-driven architecture (RabbitMQ)

## API Integration

All endpoints connect through the API Gateway (`http://localhost:8000`):

### User Service
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/verify-personal-information` - Verify ID

### Vehicle Service
- `GET /api/vehicles/available/list` - List available vehicles
- `GET /api/vehicles/:vehicleId` - Get vehicle details
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:vehicleId` - Update vehicle
- `DELETE /api/vehicles/:vehicleId` - Delete vehicle
- `GET /api/vehicles/owner/me/list` - Get user's vehicles

### Rental Service
- `POST /api/rentals/request` - Create rental request
- `GET /api/rentals/:rentalId` - Get rental details
- `PUT /api/rentals/:rentalId/confirm` - Confirm request
- `PUT /api/rentals/:rentalId/reject` - Reject request
- `PUT /api/rentals/:rentalId/cancel` - Cancel request
- `GET /api/rentals/renter/my-rentals` - User's rental requests
- `GET /api/rentals/owner/my-rentals` - Owner's rental requests

### Contract Service
- `GET /api/contracts/:contractId` - Get contract details
- `PUT /api/contracts/:contractId/pickup` - Record pickup
- `PUT /api/contracts/:contractId/return` - Record return
- `GET /api/contracts/renter/my-contracts` - User's contracts
- `GET /api/contracts/owner/my-contracts` - Owner's contracts

### Dispute Service
- `POST /api/disputes` - Create dispute
- `GET /api/disputes/:disputeId` - Get dispute details
- `PUT /api/disputes/:disputeId/approve` - Approve dispute
- `PUT /api/disputes/:disputeId/reject` - Reject dispute
- `GET /api/disputes/pending/list` - List pending disputes

### Notification Service
- `GET /api/notifications/my-notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/:notificationId/read` - Mark as read

## Technologies Used

- **React 18**: UI library
- **React Router DOM 6**: Client-side routing
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Lucide React**: Icon library
- **date-fns**: Date utilities

## Authentication Flow

1. User enters email and password on login page
2. Login request sent to API Gateway → User Service
3. User Service returns JWT token and user data
4. Token stored in localStorage
5. Token included in all subsequent requests via axios interceptor
6. On 401 response, token is cleared and user redirected to login

## State Management

- **Auth Context**: Manages global authentication state
  - `user`: Current user data
  - `token`: JWT token
  - `loading`: Loading state
  - `login()`: Set auth state
  - `logout()`: Clear auth state

## Error Handling

- API errors are caught and displayed to users
- 401 responses trigger automatic logout
- Form validation on client side
- User-friendly error messages

## Available Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Home page |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/vehicles` | Public | List available vehicles |
| `/vehicles/:vehicleId` | Public | Vehicle details |
| `/my-rentals` | Protected | Rental request management |
| `/my-contracts` | Protected | Contract management |
| `/my-vehicles` | Protected | Vehicle inventory |
| `/add-vehicle` | Protected | Add new vehicle |
| `/disputes` | Protected | Dispute management |
| `/notifications` | Protected | Notifications |

## Development Tips

- Use React DevTools for debugging
- Network tab in browser DevTools to inspect API calls
- Check localStorage for stored token
- All API responses follow consistent error format: `{ error: "message" }`

## Future Enhancements

- Payment integration for deposits and rentals
- Real-time location tracking
- Vehicle damage assessment with AI
- Chat/messaging between users
- Advanced analytics dashboard
- Mobile app (React Native)

## Support

For issues or questions, please refer to the backend service documentation and API Gateway configuration.
