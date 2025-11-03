# Developer Tier System Documentation

## Overview

The tier system is designed to ensure quality commitment from developers by limiting concurrent project picks based on their performance and experience. Developers progress through three tiers (Bronze → Silver → Gold) by successfully completing projects and maintaining high success rates.

**Note**: Before accessing the tier system, developers must first complete the [Quality Assurance Framework](./QA_FRAMEWORK.md) verification process. Only verified developers with `platformAccess: true` can browse projects and participate in the tier system.

## Tier Levels

### Bronze Tier (Default)
- **Concurrent Picks**: 3 projects maximum
- **Requirements**: None (starting tier)
- **Benefits**:
  - Access to basic projects
  - Portfolio showcase capabilities
  - Direct client communication after mutual interest

### Silver Tier
- **Concurrent Picks**: 4 projects maximum
- **Requirements**:
  - 5+ completed projects
  - 80%+ success rate
  - $5,000+ total earnings
- **Benefits**:
  - All Bronze benefits
  - Access to intermediate projects
  - Priority in search results
  - Enhanced portfolio showcase
  - Featured talent badge

### Gold Tier
- **Concurrent Picks**: 5 projects maximum
- **Requirements**:
  - 15+ completed projects
  - 90%+ success rate
  - $15,000+ total earnings
- **Benefits**:
  - All Silver benefits
  - Access to premium projects
  - Top priority in search results
  - Premium portfolio showcase
  - Gold talent badge
  - Exclusive project invitations
  - Reduced platform fees

## Key Features

### 1. Limited Concurrent Picks
- Developers can only "pick" a limited number of projects simultaneously
- Limit is based on their current tier (3-5 projects)
- Ensures developers focus on quality over quantity
- Prevents overcommitment and project abandonment

### 2. Tier-Based Project Access
- Projects can specify minimum tier requirements
- Higher-tier projects are only visible to qualified developers
- Encourages developers to improve their performance
- Ensures clients get experienced developers for complex projects

### 3. Success-Based Progression
- Automatic tier upgrades when requirements are met
- Based on three metrics:
  - Completed projects count
  - Success rate (client ratings)
  - Total earnings
- All three criteria must be met for tier upgrade

### 4. Portfolio Showcase
All tiers include portfolio showcase capabilities:
- External portfolio URL
- Portfolio projects (JSON format)
- Certifications
- Professional bio
- Skills and experience display

### 5. Direct Communication
- Messaging enabled after mutual interest
- Client must show interest in developer's application
- Developer must have picked the project
- Prevents spam and ensures serious engagement

## Database Schema

### TalentProfile Fields
```typescript
{
  tier: string              // "bronze" | "silver" | "gold"
  activePicks: number       // Current number of picked projects
  completedProjects: number // Total completed projects
  successRate: number       // Success rate (0-100)
  totalEarnings: number     // Total earnings for tier progression
  portfolioUrl: string?     // External portfolio URL
  portfolioProjects: Json?  // JSON array of portfolio projects
  certifications: string[]  // Array of certifications
  bio: string?              // Professional bio
}
```

### Application Fields
```typescript
{
  isPicked: boolean         // Whether talent has picked this project
  pickedAt: DateTime?       // When the project was picked
  completedAt: DateTime?    // When the project was completed
  clientRating: number?     // Client rating (1-5)
  clientFeedback: string?   // Client feedback text
}
```

### Project Fields
```typescript
{
  minimumTier: string       // Minimum tier required ("bronze" | "silver" | "gold")
}
```

### Conversation Fields
```typescript
{
  mutualInterest: boolean   // True when both parties have shown interest
}
```

## API Endpoints

### Pick/Unpick Projects
- **POST** `/api/applications/pick`
  - Pick a project (marks application as picked)
  - Validates tier limits
  - Increments activePicks counter
  
- **DELETE** `/api/applications/pick?applicationId={id}`
  - Unpick a project
  - Decrements activePicks counter

### Tier Progress
- **GET** `/api/tier/progress`
  - Get current tier information
  - Calculate progress to next tier
  - Check upgrade eligibility
  
- **POST** `/api/tier/progress`
  - Upgrade tier if eligible
  - Validates all requirements
  - Updates tier level

### Talent Profile
- **GET** `/api/talents`
  - For talents: Returns own profile with tier info
  - For clients: Returns list of talents with tier badges

## Utility Functions

Located in `src/lib/tier-system.ts`:

- `getTierConfig(tier)` - Get configuration for a tier
- `getMaxConcurrentPicks(tier)` - Get max picks for tier
- `canPickProject(currentPicks, tier)` - Check if can pick more
- `calculateEligibleTier(stats)` - Calculate eligible tier based on stats
- `canAccessProject(talentTier, projectTier)` - Check project access
- `getNextTierRequirements(tier)` - Get requirements for next tier
- `calculateProgressToNextTier(tier, stats)` - Calculate progress percentage
- `shouldUpgradeTier(tier, stats)` - Check if should upgrade

## UI Components

### Browse Projects Page
- Displays developer's current tier and stats
- Shows active picks vs. maximum allowed
- Filters projects by tier access
- Visual indicators for tier requirements
- Disabled pick button for inaccessible projects

### Tier Badge Display
- Color-coded badges (Bronze/Silver/Gold)
- Displayed on project cards
- Shows minimum tier requirement
- Visual feedback for access level

## Workflow

### Developer Journey

1. **Start as Bronze**
   - Can pick up to 3 projects
   - Access to all bronze-tier projects
   - Build portfolio and reputation

2. **Work on Projects**
   - Pick projects within limit
   - Complete work with quality
   - Receive client ratings
   - Earn money

3. **Progress to Silver**
   - Complete 5+ projects successfully
   - Maintain 80%+ success rate
   - Earn $5,000+
   - Automatic upgrade when eligible

4. **Advance to Gold**
   - Complete 15+ projects
   - Maintain 90%+ success rate
   - Earn $15,000+
   - Access premium opportunities

### Client Benefits

1. **Quality Assurance**
   - Tier system filters experienced developers
   - Success rates indicate reliability
   - Limited picks ensure commitment

2. **Project Matching**
   - Set minimum tier for complex projects
   - Get qualified developers only
   - Reduce risk of project failure

3. **Communication**
   - Direct messaging after mutual interest
   - Reduced spam from unqualified applicants
   - Focused on serious candidates

## Best Practices

### For Developers
1. Start with projects you can complete successfully
2. Don't overcommit - respect your pick limit
3. Maintain high quality to improve success rate
4. Build a strong portfolio to attract clients
5. Focus on completing projects before picking new ones

### For Clients
1. Set appropriate tier requirements for your project
2. Review developer portfolios and success rates
3. Provide fair ratings to help the ecosystem
4. Use direct messaging for qualified candidates
5. Consider tier badges when evaluating applications

## Future Enhancements

Potential improvements to consider:
- Tier-specific platform fee discounts
- Exclusive project invitations for Gold tier
- Mentorship programs for Bronze developers
- Tier-based priority support
- Annual tier reviews and adjustments
- Special badges for consistent high performers
- Client preference settings for tier filtering
