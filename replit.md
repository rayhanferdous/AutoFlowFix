# AutoFlow GMS - Garage Management System

## Overview

AutoFlow GMS is a comprehensive garage management system designed for auto repair shops. The application provides end-to-end operational management including customer interactions, service workflows, inventory control, employee management, and financial reporting. Built as a modern full-stack application with React frontend and Express backend, the system emphasizes reliable data persistence, audit trails, and user-friendly interfaces for both staff and customers.

The system supports multiple user roles (admin, technician, customer) with role-based access control and includes features such as digital vehicle inspections, appointment scheduling, repair order management, customer portal access, and automated marketing campaigns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management with custom query client
- **Routing**: Wouter for client-side routing with role-based route protection
- **Forms**: React Hook Form with Zod validation schemas for type-safe form handling
- **Authentication Flow**: Client-side authentication state management integrated with backend auth system

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Authentication**: Replit OpenID Connect (OIDC) integration with Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL session store using connect-pg-simple
- **API Design**: RESTful API endpoints with consistent error handling and request logging middleware
- **Database Layer**: Drizzle ORM with schema-first approach for type safety

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless database provider
- **ORM**: Drizzle ORM with TypeScript schema definitions in shared directory
- **Schema Management**: Drizzle Kit for database migrations and schema changes
- **Session Storage**: PostgreSQL-backed session store for authentication persistence
- **Connection Pooling**: Neon serverless connection pooling for optimal database performance

### Authentication and Authorization
- **Provider**: Replit OpenID Connect for seamless integration with Replit platform
- **Session Management**: Server-side sessions with HttpOnly cookies for security
- **Role-Based Access**: User roles (user, manager, admin) with middleware protection
- **API Security**: Authentication required for all API endpoints except health checks
- **Client Protection**: Route-level authentication checks with automatic login redirects

### Design Patterns and Architecture Decisions
- **Monorepo Structure**: Shared TypeScript schemas between client and server for type consistency
- **Clean Architecture**: Separation of concerns with storage abstraction layer and route handlers
- **Error Handling**: Global error boundaries on frontend with consistent API error responses
- **Development Experience**: Hot module reloading with Vite and comprehensive TypeScript configuration
- **Code Organization**: Feature-based directory structure with reusable UI components
- **Performance**: Query caching with TanStack Query and optimized bundle splitting

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL provider with connection pooling and automated backups
- **Drizzle ORM**: Type-safe database interactions with schema migration support
- **Replit Platform**: Authentication provider and deployment infrastructure

### Frontend Libraries
- **Radix UI**: Accessible component primitives for complex UI elements (dialogs, dropdowns, forms)
- **TanStack Query**: Server state management with caching, background updates, and error handling
- **Tailwind CSS**: Utility-first CSS framework with custom design system variables
- **React Hook Form**: Form library with validation and optimized re-rendering
- **Zod**: Runtime type validation for form inputs and API data

### Backend Services
- **OpenID Connect**: Standardized authentication protocol for secure user verification
- **Express Session**: Session management with PostgreSQL persistence
- **WebSocket Support**: Real-time capabilities through Neon's WebSocket constructor

### Development Tools
- **Vite**: Fast build tool with development server and optimized production builds
- **TypeScript**: Static type checking across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production server builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Integration Capabilities
The system is architected to support future integrations with:
- Payment processing systems (Stripe mentioned in requirements)
- Google APIs for reviews and mapping services
- SMS/Email marketing platforms
- Third-party automotive data providers
- Mobile applications for technicians and customers