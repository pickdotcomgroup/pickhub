# Admin System Documentation

## Overview

The PickHub admin system provides master administrators with the ability to verify talent developers, view all users (talents, clients, and agencies), and manage the platform's verification process.

## Master Admin Credentials

**IMPORTANT: Change these credentials after first login!**

- **Email:** `admin@pickhub.com`
- **Password:** `MasterAdmin2024!`

## Features

### 1. Admin Dashboard (`/admin/dashboard`)

The admin dashboard provides two main tabs:

#### Pending Verifications Tab
- View all talent developers awaiting verification
- Review talent profiles, skills, and portfolios
- Access verification review modal for each talent
- Approve or reject talent applications with detailed feedback

#### All Users Tab
- View all registered users on the platform
- Filter by user type (All, Talents, Clients, Agencies)
- See user details including:
  - Name and email
  - User type
  - Verification status (for talents)
  - Join date
- Paginated results (20 users per page)

### 2. Talent Verification Process

When reviewing a talent for verification, admins can:

1. **Review Portfolio** - Assign a score (0-100) and add notes
2. **Review Code Samples** - Assign a score (0-100) and add notes
3. **Assign Overall Score** - Overall assessment (0-100)
4. **Approve or Reject** - Make final decision
5. **Provide Rejection Reason** - If rejecting, explain why

#### Verification Scores
- **Portfolio Score:** Assessment of the talent's portfolio quality
- **Code Sample Score:** Evaluation of code quality and best practices
- **Skill Tests Score:** Results from skill verification tests
- **Overall Score:** Weighted average of all assessments

### 3. API Endpoints

#### Get All Users
```
GET /api/admin/users?type={type}&page={page}&limit={limit}
```
- **Query Parameters:**
  - `type`: Filter by user type (talent, client, agency, all)
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)
- **Authentication:** Requires admin role
- **Response:** List of users with profiles and pagination info

#### Get Pending Verifications
```
GET /api/admin/verify-talent
```
- **Authentication:** Requires admin role
- **Response:** List of talents with pending or in_review status

#### Verify/Reject Talent
```
POST /api/admin/verify-talent
```
- **Authentication:** Requires admin role
- **Body:**
  ```json
  {
    "talentProfileId": "string",
    "decision": "approved" | "rejected",
    "portfolioScore": number (optional),
    "codeSampleScore": number (optional),
    "skillTestsScore": number (optional),
    "overallScore": number (optional),
    "portfolioNotes": "string" (optional),
    "codeSampleNotes": "string" (optional),
    "rejectionReason": "string" (required if rejected)
  }
  ```
- **Response:** Updated talent profile and verification record

## Database Schema

### AdminProfile Model
```prisma
model AdminProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  firstName   String
  lastName    String
  role        String   @default("master") // master, moderator
  permissions Json?    // JSON object for granular permissions
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### User Model (Updated)
- Added `role` field: `String @default("user")` // user, admin
- Added `adminProfile` relation: `AdminProfile?`

## Admin Permissions

Master admins have the following permissions:
- `verify_talents` - Verify or reject talent applications
- `view_all_users` - View all users on the platform
- `manage_users` - Manage user accounts
- `view_analytics` - Access platform analytics
- `manage_projects` - Manage all projects
- `manage_verifications` - Handle verification requests
- `access_admin_dashboard` - Access admin dashboard
- `review_talent_applications` - Review talent applications
- `approve_reject_talents` - Approve or reject talents

## Security

### Authentication & Authorization
1. Admin routes are protected by the admin layout
2. All admin API endpoints verify:
   - User is authenticated (has valid session)
   - User has admin role (`user.role === "admin"`)
   - User has an admin profile
3. Non-admin users are redirected to home page

### Access Control
- Admin dashboard: `/admin/dashboard` - Protected by admin layout
- Admin API routes: `/api/admin/*` - Protected by role check in each route

## Setup Instructions

### 1. Run Database Migration
The admin system migration has already been applied:
```bash
npx prisma migrate dev --name add_admin_system
```

### 2. Seed Master Admin
The master admin has been created with:
```bash
npx prisma db seed
```

### 3. Access Admin Dashboard
1. Navigate to `/auth`
2. Login with master admin credentials
3. You'll be redirected based on your role
4. Access admin dashboard at `/admin/dashboard`

## Usage Guide

### Verifying a Talent

1. **Login as Admin**
   - Go to `/auth`
   - Use admin credentials

2. **Navigate to Dashboard**
   - Go to `/admin/dashboard`
   - View "Pending Verifications" tab

3. **Review Talent**
   - Click "Review" button on a talent card
   - Review their profile, skills, and portfolio
   - Click portfolio link to view their work

4. **Complete Verification**
   - Fill in scores (optional but recommended)
   - Add notes about portfolio and code quality
   - Click "Approve" to verify the talent
   - OR click "Reject" and provide a reason

5. **Result**
   - Approved talents get `verificationStatus: "verified"` and `platformAccess: true`
   - Rejected talents get `verificationStatus: "rejected"` and `platformAccess: false`
   - Talent is notified of the decision

### Viewing All Users

1. **Navigate to Users Tab**
   - Click "All Users" tab in admin dashboard

2. **Filter Users**
   - Use dropdown to filter by type:
     - All Users
     - Talents only
     - Clients only
     - Agencies only

3. **View User Details**
   - See user information in table format
   - Check verification status for talents
   - View join dates and user types

## Future Enhancements

Potential improvements for the admin system:

1. **Analytics Dashboard**
   - Platform statistics
   - User growth metrics
   - Verification success rates

2. **Bulk Actions**
   - Approve/reject multiple talents at once
   - Export user data

3. **Advanced Filtering**
   - Search by name, email, skills
   - Filter by verification status
   - Date range filters

4. **Audit Logs**
   - Track admin actions
   - View verification history
   - Monitor system changes

5. **Role Management**
   - Create moderator roles
   - Assign granular permissions
   - Manage admin team

6. **Communication Tools**
   - Send messages to users
   - Bulk email notifications
   - Verification feedback system

## Troubleshooting

### Cannot Access Admin Dashboard
- Verify you're logged in with admin credentials
- Check that user has `role: "admin"` in database
- Ensure admin profile exists for the user

### API Returns 403 Forbidden
- Confirm user is authenticated
- Verify user has admin role
- Check admin profile exists

### Verification Not Working
- Ensure talent profile ID is correct
- Verify all required fields are provided
- Check database connection
- Review server logs for errors

## Support

For issues or questions about the admin system:
1. Check server logs for errors
2. Verify database schema is up to date
3. Ensure all migrations have been applied
4. Review API endpoint responses for error messages
