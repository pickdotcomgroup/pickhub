# Role-Based Routing Structure

## Overview
This document describes the role-based routing implementation for the TechPickHub application.

## Folder Structure

```
src/app/
├── auth/
│   └── page.tsx                 # Authentication page (signin/signup)
├── client/
│   ├── layout.tsx              # Client-specific layout with session management
│   ├── page.tsx                # Client landing page
│   └── dashboard/
│       └── page.tsx            # Client dashboard
├── talent/
│   ├── layout.tsx              # Talent-specific layout with session management
│   └── page.tsx                # Talent dashboard
├── agency/
│   ├── layout.tsx              # Agency-specific layout with session management
│   └── page.tsx                # Agency dashboard
└── dashboard/
    └── page.tsx                # General dashboard (for users without roles)
```

## Routing Flow

### 1. **User Signs In** (`/auth`)
- User enters credentials
- NextAuth validates credentials
- Session is created with user data + role + permissions
- User is redirected based on their role:
  - **Client** → `/client/dashboard`
  - **Talent** → `/talent`
  - **Agency** → `/agency`
  - **No Role** → `/dashboard`

### 2. **Layout Protection**
Each role folder has a `layout.tsx` that:
- Checks if user is authenticated
- Verifies user has the correct role
- Redirects to appropriate dashboard if role doesn't match
- Shows loading state during authentication check

#### Client Layout (`src/app/client/layout.tsx`)
```typescript
- Requires authentication
- Only allows users with role: "client"
- Redirects others to their appropriate dashboard
```

#### Talent Layout (`src/app/talent/layout.tsx`)
```typescript
- Requires authentication
- Only allows users with role: "talent"
- Redirects others to their appropriate dashboard
```

#### Agency Layout (`src/app/agency/layout.tsx`)
```typescript
- Requires authentication
- Only allows users with role: "agency"
- Redirects others to their appropriate dashboard
```

### 3. **Middleware Protection** (`middleware.ts`)
Server-side route protection that:
- Allows public routes: `/`, `/auth`, `/browse`, `/join`
- Protects all role-specific routes
- Redirects unauthenticated users to `/auth`
- Enforces role-based access:
  - `/client/*` → Only accessible by clients
  - `/talent/*` → Only accessible by talents
  - `/agency/*` → Only accessible by agencies

### 4. **Session Management**
Each page displays:
- User ID
- User name
- User email
- User role
- User permissions (role-specific)

## Authentication Configuration

### NextAuth Config (`src/server/auth/config.ts`)
- **JWT Callback**: Adds role to token for middleware access
- **Session Callback**: Fetches user role and permissions from database
- **Redirect Callback**: Handles post-signin redirects

### User Role Detection (`src/lib/user-roles.ts`)
Determines user role by checking which profile exists:
- `clientProfile` → role: "client"
- `talentProfile` → role: "talent"
- `agencyProfile` → role: "agency"
- No profile → role: null

## Role-Specific Features

### Client Role
**Permissions:**
- post_projects
- hire_talent
- manage_projects
- view_talent_profiles
- view_agency_profiles
- send_messages
- make_payments

**Dashboard Features:**
- Post new projects
- Manage existing projects
- Find and hire talent
- Payment management
- Messaging
- Profile settings

### Talent Role
**Permissions:**
- apply_to_projects
- create_portfolio
- receive_messages
- receive_payments
- view_client_profiles
- view_project_details

**Dashboard Features:**
- Find and apply to projects
- Manage applications
- Portfolio management
- Active projects tracking
- Earnings overview
- Skills assessment
- Profile settings

### Agency Role
**Permissions:**
- post_projects
- hire_talent
- manage_team
- manage_multiple_projects
- view_talent_profiles
- view_client_profiles
- send_messages
- make_payments
- receive_payments
- team_collaboration

**Dashboard Features:**
- Project portfolio management
- Team management
- Client acquisition
- Talent recruitment
- Financial hub
- Collaboration tools
- Analytics & reports
- Profile settings

## Security Features

1. **Double Protection**: Both client-side (layouts) and server-side (middleware) route protection
2. **Session Validation**: Continuous session checking in layouts
3. **Role Verification**: JWT tokens include role for fast middleware checks
4. **Automatic Redirects**: Users are automatically routed to their appropriate dashboards
5. **Loading States**: Proper loading indicators during authentication checks

## Testing the Flow

### Test Client User:
1. Sign in with client credentials
2. Should redirect to `/client/dashboard`
3. Can access `/client/*` routes
4. Cannot access `/talent/*` or `/agency/*` routes

### Test Talent User:
1. Sign in with talent credentials
2. Should redirect to `/talent`
3. Can access `/talent/*` routes
4. Cannot access `/client/*` or `/agency/*` routes

### Test Agency User:
1. Sign in with agency credentials
2. Should redirect to `/agency`
3. Can access `/agency/*` routes
4. Cannot access `/client/*` or `/talent/*` routes

### Test Unauthenticated User:
1. Try to access `/client/dashboard`, `/talent`, or `/agency`
2. Should redirect to `/auth`
3. After signin, should redirect to role-specific dashboard

## Notes

- All role-specific pages display full session information
- Each role has a unique color scheme (Client: Blue, Talent: Green, Agency: Indigo)
- Layouts handle authentication state and provide consistent user experience
- Middleware provides an additional security layer at the server level
