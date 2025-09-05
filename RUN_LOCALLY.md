# How to Run AutoFlow GMS Locally

This guide explains how to set up and run the AutoFlow Garage Management System on your local computer.

## System Requirements

### Required Software
1. **Node.js** - Version 18.x or 20.x (required for all dependencies)
2. **npm** - Comes with Node.js (for package management)
3. **Database**: Either PostgreSQL OR Neon Database (cloud PostgreSQL)

## Project Dependencies

### Production Dependencies (81 packages)
The project uses these key libraries:
- **Frontend**: React 18.3.1, TypeScript, Vite
- **UI Components**: Radix UI (18 components), Tailwind CSS, Framer Motion
- **State Management**: TanStack React Query
- **Backend**: Express.js, Passport.js for authentication
- **Database**: Drizzle ORM, PostgreSQL/Neon
- **Forms**: React Hook Form with Zod validation

### Development Dependencies (22 packages)
- TypeScript compilation and type definitions
- Vite for build tooling
- Tailwind CSS and PostCSS for styling
- Drizzle Kit for database management
- ESBuild for production builds

## Required Environment Variables

Create a `.env` file in your project root with these variables:

```env
# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database_name

# Authentication & Security
SESSION_SECRET=your-super-secret-session-key-make-it-very-long-and-random
REPL_ID=your-app-identifier
REPLIT_DOMAINS=localhost,your-domain.com
ISSUER_URL=https://replit.com/oidc

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Database Setup Options

### Option 1: Local PostgreSQL
1. Download and install PostgreSQL from https://www.postgresql.org/download/
2. Create a database and user:
   ```sql
   CREATE DATABASE garage_management;
   CREATE USER garage_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE garage_management TO garage_user;
   ```
3. Use this DATABASE_URL format:
   ```
   DATABASE_URL=postgresql://garage_user:your_password@localhost:5432/garage_management
   ```

### Option 2: Neon Cloud Database
1. Go to https://neon.tech and create a free account
2. Create a new project called "garage-management"
3. Copy the connection string from your dashboard
4. Use the provided connection string (includes `?sslmode=require`)

## Setup Steps

### 1. Extract Project Files
- Extract your downloaded project ZIP to a folder
- Navigate to the project folder in terminal/command prompt

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Database Schema
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

The application will start with:
- **Backend**: http://localhost:5000 (Express API server)
- **Frontend**: Served by Vite through Express (same port)

## Available Scripts

### Development
- `npm run dev` - Starts development server with hot reloading
- `npm run check` - TypeScript type checking

### Database
- `npm run db:push` - Creates/updates database schema using Drizzle

### Build & Production
- `npm run build` - Builds both frontend and backend for production
- `npm run start` - Starts production server

## Project Structure

```
your-project/
├── .env (you need to create this)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── client/
│   ├── index.html
│   └── src/
│       ├── components/    (UI components)
│       ├── pages/        (Application pages)
│       ├── hooks/        (Custom React hooks)
│       ├── lib/          (Utilities)
│       ├── App.tsx       (Main app component)
│       └── main.tsx      (React entry point)
├── server/
│   ├── index.ts          (Express server)
│   ├── routes.ts         (API endpoints)
│   ├── db.ts            (Database connection)
│   ├── storage.ts       (Data access layer)
│   ├── replitAuth.ts    (Authentication)
│   └── vite.ts          (Vite integration)
├── shared/
│   └── schema.ts         (Database schema)
└── migrations/           (Created by Drizzle)
```

## Important Notes

### Authentication
- The project uses Replit's OpenID Connect for authentication
- Authentication will not work locally (expected behavior)
- You'll see the login page but authentication will fail in local development

### Ports and Proxying
- Backend runs on port 5000 (Express server)
- Frontend is served through the same port via Vite integration
- All `/api` requests are handled by the Express backend

### Database Features
- Uses Drizzle ORM for type-safe database operations
- Supports both local PostgreSQL and Neon cloud databases
- Automatic schema migrations with `npm run db:push`
- Sample data can be added through the application interface

## Troubleshooting

### Common Issues

**npm install fails:**
- Ensure you have Node.js 18+ installed
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then try again

**Database connection fails:**
- Verify your DATABASE_URL in `.env` is correct
- For local PostgreSQL: ensure the service is running
- For Neon: ensure connection string includes `?sslmode=require`

**Port 5000 already in use:**
- Kill the process using port 5000
- Or change the PORT in your `.env` file

**TypeScript errors:**
- Run `npm run check` to see detailed type errors
- Ensure all dependencies are installed correctly

**Build failures:**
- Ensure all environment variables are set
- Check that the database is accessible
- Verify all required files are present

## Development Tips

1. **Hot Reloading**: Changes to frontend code reload automatically
2. **API Changes**: Backend changes require restarting the dev server
3. **Database Changes**: Run `npm run db:push` after schema modifications
4. **Type Safety**: The project uses TypeScript throughout for better development experience
5. **UI Components**: Built with Radix UI primitives and Tailwind CSS for consistency

Your AutoFlow Garage Management System should now be running locally with full functionality including customer management, appointments, digital inspections, and all other features!