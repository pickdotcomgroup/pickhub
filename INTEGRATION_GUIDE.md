# QA Framework Integration Guide

## Where the Verification System is Implemented

The Unified Quality Assurance Framework has been integrated into the PickHub platform at multiple key points to ensure only verified developers can access platform features.

## 1. Entry Points & Access Control

### Talent Dashboard (`/talent/dashboard`)
**File**: `src/app/talent/dashboard/page.tsx`

**Integration**:
- Checks verification status on page load
- Redirects unverified developers to `/talent/verification`
- Only displays dashboard if `platformAccess: true`

```typescript
// Verification check in useEffect
const checkVerification = async () => {
  const response = await fetch("/api/verification/status");
  const data = await response.json();
  
  if (!data.platformAccess) {
    router.push("/talent/verification");
    return;
  }
};
```

### Browse Projects Page (`/talent/browse`)
**File**: `src/app/talent/browse/page.tsx`

**Integration**:
- Checks verification before loading projects
- Redirects to verification page if not verified
- Prevents unverified developers from seeing or picking projects

```typescript
// Verification check before fetching projects
const checkVerification = async () => {
  const response = await fetch("/api/verification/status");
  const data = await response.json();
  
  if (!data.platformAccess) {
    router.push("/talent/verification");
    return;
  }
  
  // Only fetch data if verified
  void fetchTalentProfile();
  void fetchProjects();
};
```

## 2. Verification Page

### Verification Interface (`/talent/verification`)
**File**: `src/app/talent/verification/page.tsx`

**Features**:
- Displays current verification status
- Shows progress bar and checklist
- Form for submitting verification information
- Real-time status updates
- Score display (when available)
- Feedback for rejections
- Redirect to browse page when verified

**User Flow**:
1. Developer lands on verification page
2. Sees current status (pending/in_review/verified/rejected)
3. Completes verification form with:
   - Portfolio URL
   - GitHub username
   - GitLab username (optional)
   - Code repository URL (optional)
   - LinkedIn profile URL
4. Submits for review
5. Status changes to "in_review"
6. Waits for admin review
7. Once approved, gains platform access

## 3. API Endpoints

### Submit Verification
**Endpoint**: `POST /api/verification/submit`
**File**: `src/app/api/verification/submit/route.ts`

**Purpose**: Accept and validate verification submissions

**Validation**:
- GitHub username format
- GitLab username format
- LinkedIn URL format
- Creates/updates TalentVerification record
- Updates TalentProfile status to "in_review"

### Get Verification Status
**Endpoint**: `GET /api/verification/status`
**File**: `src/app/api/verification/status/route.ts`

**Purpose**: Return current verification status and progress

**Returns**:
- Verification status
- Platform access flag
- Progress percentage
- Checklist of requirements
- Scores (if available)
- Feedback (if rejected)

## 4. Database Schema

### TalentProfile (Enhanced)
```prisma
model TalentProfile {
  // ... existing fields ...
  
  // QA Framework fields
  verificationStatus  String   @default("pending")
  platformAccess      Boolean  @default(false)
  verification        TalentVerification?
}
```

### TalentVerification (New)
```prisma
model TalentVerification {
  id                    String   @id @default(cuid())
  talentProfileId       String   @unique
  
  // Portfolio Review
  portfolioReviewed     Boolean  @default(false)
  portfolioScore        Float?
  portfolioNotes        String?
  
  // Code Sample Analysis
  githubUsername        String?
  gitlabUsername        String?
  codeRepositoryUrl     String?
  codeSampleReviewed    Boolean  @default(false)
  codeSampleScore       Float?
  codeSampleNotes       String?
  
  // Skill Tests
  skillTestsTaken       Json?
  skillTestsScore       Float?
  
  // Identity Verification
  linkedInUrl           String?
  linkedInVerified      Boolean  @default(false)
  identityVerified      Boolean  @default(false)
  
  // Overall
  overallScore          Float?
  verificationDecision  String   @default("pending")
  reviewedBy            String?
  reviewedAt            DateTime?
  rejectionReason       String?
}
```

## 5. Verification Utilities

### Verification System Library
**File**: `src/lib/verification-system.ts`

**Key Functions**:
- `calculateOverallScore()` - Weighted score calculation
- `meetsVerificationRequirements()` - Check if meets minimums
- `calculateVerificationProgress()` - Progress percentage
- `canAccessPlatform()` - Check platform access
- `getVerificationStatusInfo()` - Status display info
- `isValidGitHubUsername()` - GitHub validation
- `isValidGitLabUsername()` - GitLab validation
- `isValidLinkedInUrl()` - LinkedIn validation
- `extractGitHubUsername()` - Extract username from URL
- `generateVerificationChecklist()` - Create checklist

## 6. User Journey

### New Developer Registration Flow

```
1. Sign Up → Create Account
   ↓
2. Create Talent Profile
   ↓
3. Redirected to /talent/verification
   ↓
4. Submit Verification Info
   - Portfolio URL
   - GitHub/GitLab
   - LinkedIn
   ↓
5. Status: "in_review"
   ↓
6. Admin Reviews Submission
   - Assigns scores
   - Makes decision
   ↓
7a. APPROVED                    7b. REJECTED
    Status: "verified"              Status: "rejected"
    platformAccess: true            Feedback provided
    ↓                               ↓
8a. Access Dashboard/Browse     8b. Review Feedback
    Can pick projects               Make improvements
                                    Resubmit
```

### Existing Developer Flow

```
1. Login
   ↓
2. Navigate to Dashboard/Browse
   ↓
3. Verification Check
   ↓
4a. VERIFIED                    4b. NOT VERIFIED
    platformAccess: true            platformAccess: false
    ↓                               ↓
5a. Access Granted              5b. Redirect to /talent/verification
    View projects                   Complete verification
    Pick projects                   Wait for approval
```

## 7. Integration with Tier System

The QA Framework works seamlessly with the existing tier system:

1. **Verification First**: Developers must be verified before accessing tier features
2. **Bronze Tier Start**: Verified developers start at Bronze tier
3. **Tier Progression**: As developers complete projects, they progress through tiers
4. **Pick Limits**: Tier-based concurrent pick limits (3-5 projects)

## 8. Admin Review Process (Future Enhancement)

While not yet implemented, the admin review process would work as follows:

1. Admin accesses review dashboard
2. Views pending verifications
3. Reviews portfolio and code samples
4. Assigns scores for each component
5. Makes decision (approve/reject/needs_revision)
6. Provides feedback if rejected
7. System updates verification status
8. Developer notified of decision

## 9. Testing the Integration

### Manual Testing Steps:

1. **Create New Talent Account**
   - Sign up as a developer
   - Complete profile setup
   - Should redirect to `/talent/verification`

2. **Submit Verification**
   - Fill out verification form
   - Submit with valid GitHub/LinkedIn
   - Check status changes to "in_review"

3. **Test Access Control**
   - Try accessing `/talent/browse` while unverified
   - Should redirect to verification page
   - Try accessing `/talent/dashboard` while unverified
   - Should redirect to verification page

4. **Simulate Approval** (Database)
   - Update TalentProfile: `platformAccess = true`, `verificationStatus = 'verified'`
   - Access dashboard/browse pages
   - Should work normally

5. **Test Rejection Flow**
   - Update status to 'rejected' with feedback
   - View verification page
   - Should see rejection reason
   - Can resubmit

## 10. Key Files Reference

### Core Implementation:
- `prisma/schema.prisma` - Database models
- `src/lib/verification-system.ts` - Verification utilities
- `src/app/api/verification/submit/route.ts` - Submit endpoint
- `src/app/api/verification/status/route.ts` - Status endpoint
- `src/app/talent/verification/page.tsx` - Verification UI

### Integration Points:
- `src/app/talent/dashboard/page.tsx` - Dashboard access control
- `src/app/talent/browse/page.tsx` - Browse access control

### Documentation:
- `QA_FRAMEWORK.md` - Framework documentation
- `TIER_SYSTEM.md` - Tier system (updated with QA reference)
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `INTEGRATION_GUIDE.md` - This file

## 11. Environment Variables

No additional environment variables required. The system uses the existing database connection.

## 12. Next Steps

To complete the QA framework implementation:

1. **Admin Dashboard** - Create interface for reviewing submissions
2. **Email Notifications** - Notify developers of status changes
3. **Automated Code Analysis** - Integrate GitHub API for code quality checks
4. **Skill Tests** - Implement optional skill assessment system
5. **Identity Verification** - Integrate with ID verification service
6. **Analytics** - Track verification metrics and success rates

## Conclusion

The QA Framework is fully integrated and functional. Developers must
