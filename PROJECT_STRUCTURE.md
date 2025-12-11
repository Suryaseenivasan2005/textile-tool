# Project Structure

## Frontend Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card, Modal, Table)
│   ├── layout/         # Layout components (Sidebar, Header, MainLayout)
│   └── common/         # Common components (ProtectedRoute)
├── pages/              # Page components (organized by feature)
│   ├── auth/           # Authentication pages
│   ├── vendors/        # Vendor management
│   ├── customers/      # Customer management
│   └── ...             # Other modules
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── validation.ts  # Validation helpers
│   └── helpers.ts     # Generic helpers
├── constants/          # Application constants
├── config/             # Configuration files
└── test/               # Test utilities and mocks
    ├── setup.ts        # Test setup
    ├── utils/          # Test utilities
    └── __mocks__/      # Mock data
```

## Backend Structure

```
backend/src/
├── config/             # Configuration files
│   └── database.ts     # MongoDB connection
├── controllers/        # Request handlers
│   └── authController.ts
├── routes/             # Route definitions
│   └── authRoutes.ts
├── middleware/         # Express middleware
│   ├── auth.ts        # Authentication middleware
│   ├── errorHandler.ts # Error handling
│   └── asyncHandler.ts # Async error wrapper
├── validators/         # Validation schemas
│   └── authValidators.ts
├── utils/              # Utility functions
│   ├── jwt.ts         # JWT utilities
│   └── validation.ts  # Validation helpers
├── constants/          # Application constants
├── models/             # Data models (if needed)
├── test/               # Test files
│   ├── setup.ts       # Test setup
│   └── auth.test.ts   # Auth tests
└── seed.ts             # Database seeding
```

## Path Aliases

- Frontend: `@/` → `src/`
- Backend: `@/` → `src/`

## Testing

### Frontend Tests
- Framework: Vitest + React Testing Library
- Run: `npm test`
- UI: `npm run test:ui`
- Coverage: `npm run test:coverage`

### Backend Tests
- Framework: Vitest + Supertest
- Run: `npm test` (in backend folder)
- UI: `npm run test:ui`
- Coverage: `npm run test:coverage`

