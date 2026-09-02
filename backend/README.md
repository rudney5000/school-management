# School Management Backend

A modular school management system backend built with TypeScript, Express, Drizzle ORM, and PostgreSQL.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm
- Docker and Docker Compose

## Installation

**Important: Start Docker first**
Before proceeding, navigate to the project root directory and start the Docker containers:

```bash
cd ..
docker-compose up -d
```

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/school_management
PORT=3000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

3. Run database migrations:

```bash
pnpm run db:push
```

4. Seed the database (optional):

```bash
pnpm run db:seed
```

## Running the Backend

### Development Mode

```bash
pnpm run dev
```

### Production Mode

```bash
pnpm run build
pnpm start
```

The API will be available at `http://localhost:3000`

## Project Structure

The backend follows a modular architecture pattern, where each feature is organized into its own module with its own schema, service, controller, and router.

```
backend/
├── src/
│   ├── db/                      # Database configuration and schemas
│   │   ├── index.ts            # Database connection and export
│   │   ├── migrations/         # Database migration files
│   │   ├── schema/             # Drizzle ORM table definitions
│   │   │   ├── index.ts        # Main schema export
│   │   │   ├── enums.ts        # Database enums
│   │   │   ├── attendances.ts
│   │   │   ├── city.ts
│   │   │   ├── classes.ts
│   │   │   ├── country.ts
│   │   │   ├── courses.ts
│   │   │   ├── department.ts
│   │   │   ├── district.ts
│   │   │   ├── enrollments.ts
│   │   │   ├── payments.ts
│   │   │   ├── parents.ts
│   │   │   ├── schedule.ts
│   │   │   ├── school.ts
│   │   │   ├── subSchool.ts
│   │   │   ├── students.ts
│   │   │   ├── teacher.ts
│   │   │   └── users.ts
│   │   └── seed.ts             # Database seeding script
│   │
│   ├── middleware/             # Express middleware
│   │   ├── authenticate.ts    # JWT authentication middleware
│   │   └── authorize.ts       # Role-based authorization middleware
│   │
│   ├── modules/                # Feature modules (modular architecture)
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.router.ts
│   │   │   └── auth.schema.ts
│   │   │
│   │   ├── cities/            # Cities management module
│   │   │   ├── cities.controller.ts
│   │   │   ├── cities.router.ts
│   │   │   ├── cities.schema.ts
│   │   │   └── cities.service.ts
│   │   │
│   │   ├── classes/           # Classes management module
│   │   │   ├── classes.controller.ts
│   │   │   ├── classes.router.ts
│   │   │   ├── classes.schema.ts
│   │   │   └── classes.service.ts
│   │   │
│   │   ├── courses/           # Courses management module
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.router.ts
│   │   │   ├── courses.schema.ts
│   │   │   └── courses.service.ts
│   │   │
│   │   ├── countries/         # Countries management module
│   │   │   ├── countries.controller.ts
│   │   │   ├── countries.router.ts
│   │   │   ├── countries.schema.ts
│   │   │   └── countries.service.ts
│   │   │
│   │   ├── departments/       # Departments management module
│   │   │   ├── departments.controller.ts
│   │   │   ├── departments.router.ts
│   │   │   ├── departments.schema.ts
│   │   │   └── departments.service.ts
│   │   │
│   │   ├── districts/         # Districts management module
│   │   │   ├── districts.controller.ts
│   │   │   ├── districts.router.ts
│   │   │   ├── districts.schema.ts
│   │   │   └── districts.service.ts
│   │   │
│   │   ├── enrollments/       # Student enrollments module
│   │   │   ├── enrollments.controller.ts
│   │   │   ├── events.router.ts
│   │   │   ├── events.schema.ts
│   │   │   └── events.service.ts
│   │   │
│   │   ├── events/       # Student events module
│   │   │   ├── events.controller.ts
│   │   │   ├── events.router.ts
│   │   │   ├── events.schema.ts
│   │   │   └── events.service.ts
│   │   │
│   │   ├── grades/            # Grades management module
│   │   │   ├── grades.controller.ts
│   │   │   ├── grades.router.ts
│   │   │   ├── grades.schema.ts
│   │   │   └── grades.service.ts
│   │   │
│   │   ├── notifications/     # Notifications module
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.router.ts
│   │   │   ├── notifications.schema.ts
│   │   │   └── notifications.service.ts
│   │   │
│   │   ├── parents/           # Parents management module
│   │   │   ├── parents.controller.ts
│   │   │   ├── parents.router.ts
│   │   │   ├── parents.schema.ts
│   │   │   └── parents.service.ts
│   │   │
│   │   ├── payments/          # Payments management module
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.router.ts
│   │   │   ├── payments.schema.ts
│   │   │   └── payments.service.ts
│   │   │
│   │   ├── schedules/         # Schedules management module
│   │   │   ├── schedules.controller.ts
│   │   │   ├── schedules.router.ts
│   │   │   ├── schedules.schema.ts
│   │   │   └── schedules.service.ts
│   │   │
│   │   ├── schools/           # Schools management module
│   │   │   ├── schools.controller.ts
│   │   │   ├── schools.router.ts
│   │   │   ├── schools.schema.ts
│   │   │   └── schools.service.ts
│   │   │
│   │   ├── students/         # Students management module
│   │   │   ├── students.controller.ts
│   │   │   ├── students.router.ts
│   │   │   ├── students.schema.ts
│   │   │   └── students.service.ts
│   │   │
│   │   ├── sub-schools/       # Sub-schools management module
│   │   │   ├── sub-schools.controller.ts
│   │   │   ├── sub-schools.router.ts
│   │   │   ├── sub-schools.schema.ts
│   │   │   └── sub-schools.service.ts
│   │   │
│   │   ├── teachers/          # Teachers management module
│   │   │   ├── teachers.controller.ts
│   │   │   ├── teachers.router.ts
│   │   │   ├── teachers.schema.ts
│   │   │   └── teachers.service.ts
│   │   │
│   │   └── workers/           # Workers management module
│   │       ├── workers.controller.ts
│   │       ├── workers.router.ts
│   │       ├── workers.schema.ts
│   │       └── workers.service.ts
│   │
│   ├── shared/                # Shared utilities and types
│   │   ├── errors/            # Custom error classes
│   │   │   └── app-error.ts
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── express.ts
│   │   └── utils/             # Utility functions
│   │       ├── async-handler.ts
│   │       ├── respond.ts
│   │       └── validate.ts
│   │
│   └── index.ts               # Application entry point
│
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── drizzle.config.ts          # Drizzle ORM configuration
└── README.md                  # This file
```

## Modular Architecture Pattern

Each module follows a consistent structure with four main files:

### 1. **Schema** (`*.schema.ts`)

Defines Zod validation schemas for request/response DTOs:

- Create schemas (for POST requests)
- Update schemas (for PATCH requests)
- Query schemas (for query parameters)
- Params schemas (for route parameters)
- TypeScript type exports

### 2. **Service** (`*.service.ts`)

Contains business logic and database operations:

- CRUD operations (Create, Read, Update, Delete)
- Database queries using Drizzle ORM
- Error handling and validation
- Type exports for record types

### 3. **Controller** (`*.controller.ts`)

Handles HTTP requests and responses:

- Request handler methods (getAll, getById, create, update, remove)
- Calls service methods for business logic
- Uses asyncHandler for error handling
- Uses respond utility for consistent responses

### 4. **Router** (`*.router.ts`)

Defines Express routes with middleware:

- Route definitions (GET, POST, PATCH, DELETE)
- Authentication middleware
- Authorization middleware (role-based)
- Validation middleware (using Zod schemas)
- Exports router for app integration

## Available Modules

- **auth** - User authentication and authorization
- **cities** - Geographic cities management
- **classes** - School classes management
- **courses** - Academic courses management
- **countries** - Geographic countries management
- **departments** - Administrative departments
- **districts** - Geographic districts management
- **enrollments** - Student enrollment management
- **grades** - Student grades management
- **notifications** - System notifications
- **parents** - Parents/guardians management
- **payments** - Payment processing
- **schedules** - Class schedules and timetables
- **schools** - School institutions management
- **students** - Student records management
- **sub-schools** - Sub-school/campus management
- **teachers** - Teaching staff management
- **workers** - Non-teaching staff management

## API Endpoints

Each module exposes RESTful API endpoints following this pattern:

- `GET /{module}` - List all records
- `GET /{module}/:id` - Get a specific record
- `POST /{module}` - Create a new record
- `PATCH /{module}/:id` - Update a record
- `DELETE /{module}/:id` - Delete a record

## Authentication & Authorization

Most endpoints require:

- **Authentication** - Valid JWT token in the Authorization header
- **Authorization** - Appropriate role (super_admin, admin, director, teacher, parent, student)

## Database

The project uses Drizzle ORM with PostgreSQL. Database schemas are defined in `src/db/schema/` and migrations are managed automatically.

## Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm run db:push` - Push database schema changes
- `pnpm run db:seed` - Seed database with initial data
- `pnpm run db:studio` - Open Drizzle Studio for database management

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT
- **Architecture**: Modular/Feature-based
