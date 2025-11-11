# GetawayHub Travel Booking Platform

## Overview

GetawayHub is a travel booking platform that enables users to search and discover travel destinations, compare flights and hotels, and plan trips. The application draws design inspiration from Booking.com and Airbnb, featuring a clean, conversion-focused interface with destination imagery and streamlined search functionality.

The platform is built as a full-stack TypeScript application with a React frontend and Express backend, utilizing PostgreSQL for data persistence through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (React Router alternative)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming support (light/dark mode capability)
- Custom design system defined in `design_guidelines.md` with typography, spacing, and layout standards

**State Management Strategy**
- TanStack Query handles server state caching and synchronization
- React hooks for local component state
- No global state management library (Redux/Zustand) currently implemented

**Component Architecture**
- Feature-based components: `DestinationCard`, `SearchBar`, `RecommendationCard`
- Layout components: `Header`, `Footer`
- Shared UI components from Shadcn/ui in `client/src/components/ui/`
- Page components using route-based code splitting

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Custom Vite integration for development mode HMR (Hot Module Replacement)
- Static file serving for production builds

**Data Layer**
- In-memory storage implementation (`MemStorage` class) as current storage mechanism
- Interface-based storage abstraction (`IStorage`) allows swapping to persistent storage
- Drizzle ORM configured for PostgreSQL with schema definition in `shared/schema.ts`
- Database migrations directory configured at `./migrations`

**API Design**
- RESTful API endpoints prefixed with `/api`
- Shared TypeScript types between frontend and backend via `shared/` directory
- Currently using mock JSON data from `backend/` directory (destinations, flights, hotels, recommendations)

**Development Tooling**
- TypeScript compilation with strict mode enabled
- Path aliases for clean imports (`@/`, `@shared/`, `@assets/`)
- Separate development and production build processes

### Authentication & Authorization

**Current State**
- Sign-in and sign-up pages implemented with form handling
- Mock authentication flow (no actual user verification)
- User schema defined in database with username/password fields
- Session management not yet implemented

**Planned Implementation**
- User authentication required for actual implementation
- Session-based authentication likely using `connect-pg-simple` (already in dependencies)
- Password hashing and secure credential storage needed

### Data Storage Solutions

**Database Configuration**
- PostgreSQL as the target database (via Neon serverless)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with Zod validation integration

**Current Data Model**
- Users table: id (UUID), username (unique), password
- Mock data stored in JSON files for destinations, flights, hotels, and recommendations
- No relationships or foreign keys currently defined

**Migration Strategy**
- Drizzle Kit configured for schema migrations
- Push-based workflow (`db:push` script) for development
- Migration files output to `./migrations` directory

### Third-Party Integrations

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui as the component system wrapper
- Embla Carousel for image carousels
- Lucide React for icon system

**Development Tools**
- Replit-specific plugins for development environment integration
- Runtime error overlay for better debugging experience

## External Dependencies

### Database & ORM
- **PostgreSQL** (via `@neondatabase/serverless`): Serverless PostgreSQL database
- **Drizzle ORM** (`drizzle-orm`, `drizzle-kit`, `drizzle-zod`): Type-safe ORM with Zod schema validation
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used)

### Frontend Libraries
- **React** with **React DOM**: UI framework
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing solution
- **React Hook Form** with **@hookform/resolvers**: Form validation
- **date-fns**: Date manipulation utilities

### UI & Styling
- **Tailwind CSS** with **PostCSS** and **Autoprefixer**: Utility-first styling
- **Radix UI components**: Accessible component primitives (20+ packages)
- **Lucide React**: Icon library
- **class-variance-authority**: CSS variant utilities
- **tailwind-merge** and **clsx**: Conditional class name handling

### Build & Development
- **Vite**: Build tool and dev server with React plugin
- **TypeScript**: Type safety across the stack
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast bundling for production server code

### Backend
- **Express**: Web server framework
- **Zod**: Runtime schema validation

### Asset Management
- Generated images stored in `attached_assets/generated_images/`
- Static assets served through Vite in development, Express in production