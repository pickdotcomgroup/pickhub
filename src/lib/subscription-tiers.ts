/**
 * Subscription Tiers Configuration
 * Defines pricing, benefits, and features for each user role's subscription tiers
 */

export type TierKey = "free" | "professional" | "premium" | "enterprise";

export interface TierBenefit {
  label: string;
  included: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year" | "one_time";
  description: string;
  benefits: TierBenefit[];
  polarProductId?: string; // Set these after creating products in Polar dashboard
  recommended?: boolean;
}

// ==================== TALENT TIERS ====================

export const TALENT_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: "talent_free",
    name: "Free",
    price: 0,
    interval: "month",
    description: "Get started with basic features",
    benefits: [
      { label: "Browse job listings", included: true },
      { label: "Apply to 5 jobs per month", included: true },
      { label: "Basic profile", included: true },
      { label: "Access to free courses", included: true },
      { label: "Unlimited job applications", included: false },
      { label: "Featured profile", included: false },
      { label: "Priority support", included: false },
      { label: "Direct employer contact", included: false },
    ],
  },
  professional: {
    id: "talent_professional",
    name: "Professional",
    price: 19,
    interval: "month",
    description: "For serious job seekers",
    recommended: true,
    benefits: [
      { label: "Browse job listings", included: true },
      { label: "Unlimited job applications", included: true },
      { label: "Enhanced profile with badges", included: true },
      { label: "Access to all courses", included: true },
      { label: "Skill verification badges", included: true },
      { label: "Priority support", included: true },
      { label: "Featured profile", included: false },
      { label: "Direct employer contact", included: false },
    ],
    polarProductId: undefined, // Set after creating in Polar
  },
  premium: {
    id: "talent_premium",
    name: "Premium",
    price: 49,
    interval: "month",
    description: "Maximum visibility and features",
    benefits: [
      { label: "Browse job listings", included: true },
      { label: "Unlimited job applications", included: true },
      { label: "Enhanced profile with badges", included: true },
      { label: "Access to all courses", included: true },
      { label: "Skill verification badges", included: true },
      { label: "Priority support", included: true },
      { label: "Featured profile in search", included: true },
      { label: "Direct employer contact", included: true },
    ],
    polarProductId: undefined,
  },
};

// ==================== TRAINER TIERS ====================

export const TRAINER_TIERS: Record<string, SubscriptionTier & { platformFee: number }> = {
  free: {
    id: "trainer_free",
    name: "Starter",
    price: 0,
    interval: "month",
    description: "Start selling your courses",
    platformFee: 0.20, // 20%
    benefits: [
      { label: "List up to 3 courses", included: true },
      { label: "Basic analytics", included: true },
      { label: "Standard support", included: true },
      { label: "20% platform fee on sales", included: true },
      { label: "Unlimited courses", included: false },
      { label: "Advanced analytics", included: false },
      { label: "Priority support", included: false },
      { label: "Reduced platform fee", included: false },
    ],
  },
  professional: {
    id: "trainer_professional",
    name: "Professional",
    price: 29,
    interval: "month",
    description: "Grow your training business",
    platformFee: 0.15, // 15%
    recommended: true,
    benefits: [
      { label: "Unlimited courses", included: true },
      { label: "Advanced analytics dashboard", included: true },
      { label: "Priority support", included: true },
      { label: "15% platform fee on sales", included: true },
      { label: "Featured trainer badge", included: true },
      { label: "Student messaging", included: true },
      { label: "Custom branding", included: false },
      { label: "10% platform fee", included: false },
    ],
    polarProductId: undefined,
  },
  enterprise: {
    id: "trainer_enterprise",
    name: "Enterprise",
    price: 99,
    interval: "month",
    description: "For established training providers",
    platformFee: 0.10, // 10%
    benefits: [
      { label: "Unlimited courses", included: true },
      { label: "Advanced analytics dashboard", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "10% platform fee on sales", included: true },
      { label: "Featured trainer badge", included: true },
      { label: "Student messaging", included: true },
      { label: "Custom branding", included: true },
      { label: "API access", included: true },
    ],
    polarProductId: undefined,
  },
};

// ==================== EMPLOYER TIERS ====================

export const EMPLOYER_TIERS: Record<string, SubscriptionTier> = {
  pay_per_post: {
    id: "employer_single",
    name: "Single Post",
    price: 49,
    interval: "one_time",
    description: "One job posting",
    benefits: [
      { label: "1 job posting", included: true },
      { label: "30-day visibility", included: true },
      { label: "Basic applicant tracking", included: true },
      { label: "Standard support", included: true },
      { label: "Featured listing", included: false },
      { label: "Multiple active postings", included: false },
      { label: "Advanced filters", included: false },
    ],
    polarProductId: undefined,
  },
  professional: {
    id: "employer_professional",
    name: "Professional",
    price: 149,
    interval: "month",
    description: "For growing companies",
    recommended: true,
    benefits: [
      { label: "5 active job postings", included: true },
      { label: "60-day visibility per post", included: true },
      { label: "Featured listings", included: true },
      { label: "Advanced applicant tracking", included: true },
      { label: "Priority support", included: true },
      { label: "Talent search access", included: true },
      { label: "Unlimited postings", included: false },
      { label: "Dedicated account manager", included: false },
    ],
    polarProductId: undefined,
  },
  enterprise: {
    id: "employer_enterprise",
    name: "Enterprise",
    price: 399,
    interval: "month",
    description: "For large organizations",
    benefits: [
      { label: "Unlimited job postings", included: true },
      { label: "90-day visibility per post", included: true },
      { label: "Premium featured listings", included: true },
      { label: "Advanced applicant tracking", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Full talent search access", included: true },
      { label: "Custom integrations", included: true },
      { label: "Bulk hiring tools", included: true },
    ],
    polarProductId: undefined,
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get tiers for a specific user role
 */
export function getTiersForRole(role: "talent" | "trainer" | "client") {
  switch (role) {
    case "talent":
      return TALENT_TIERS;
    case "trainer":
      return TRAINER_TIERS;
    case "client":
      return EMPLOYER_TIERS;
    default:
      return TALENT_TIERS;
  }
}

/**
 * Get a specific tier by ID
 */
export function getTierById(tierId: string): SubscriptionTier | undefined {
  const allTiers = {
    ...TALENT_TIERS,
    ...TRAINER_TIERS,
    ...EMPLOYER_TIERS,
  };

  return Object.values(allTiers).find((tier) => tier.id === tierId);
}

/**
 * Get platform fee rate for a trainer tier
 */
export function getTrainerPlatformFee(tierKey: string): number {
  const tier = TRAINER_TIERS[tierKey];
  return tier?.platformFee ?? 0.20; // Default 20% for free tier
}

/**
 * Check if a feature is available for a subscription tier
 */
export function hasFeature(
  userTier: string,
  feature: string,
  role: "talent" | "trainer" | "client"
): boolean {
  const tiers = getTiersForRole(role);
  const tier = tiers[userTier];

  if (!tier) return false;

  const benefit = tier.benefits.find((b) =>
    b.label.toLowerCase().includes(feature.toLowerCase())
  );

  return benefit?.included ?? false;
}

/**
 * Get recommended tier for a role
 */
export function getRecommendedTier(role: "talent" | "trainer" | "client"): SubscriptionTier | undefined {
  const tiers = getTiersForRole(role);
  return Object.values(tiers).find((tier) => tier.recommended);
}

/**
 * Format price for display
 */
export function formatTierPrice(tier: SubscriptionTier): string {
  if (tier.price === 0) return "Free";

  const priceStr = `$${tier.price}`;

  switch (tier.interval) {
    case "month":
      return `${priceStr}/mo`;
    case "year":
      return `${priceStr}/yr`;
    case "one_time":
      return priceStr;
    default:
      return priceStr;
  }
}
