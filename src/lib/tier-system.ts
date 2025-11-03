// Tier system configuration and utilities

export type TierLevel = 'bronze' | 'silver' | 'gold';

export interface TierConfig {
  name: TierLevel;
  displayName: string;
  maxConcurrentPicks: number;
  minCompletedProjects: number;
  minSuccessRate: number;
  minTotalEarnings: number;
  benefits: string[];
  color: string;
}

export const TIER_CONFIGS: Record<TierLevel, TierConfig> = {
  bronze: {
    name: 'bronze',
    displayName: 'Bronze',
    maxConcurrentPicks: 3,
    minCompletedProjects: 0,
    minSuccessRate: 0,
    minTotalEarnings: 0,
    benefits: [
      'Access to basic projects',
      'Up to 3 concurrent picks',
      'Portfolio showcase',
      'Direct client communication after mutual interest',
    ],
    color: '#CD7F32',
  },
  silver: {
    name: 'silver',
    displayName: 'Silver',
    maxConcurrentPicks: 4,
    minCompletedProjects: 5,
    minSuccessRate: 80,
    minTotalEarnings: 5000,
    benefits: [
      'Access to intermediate projects',
      'Up to 4 concurrent picks',
      'Priority in search results',
      'Enhanced portfolio showcase',
      'Direct client communication after mutual interest',
      'Featured talent badge',
    ],
    color: '#C0C0C0',
  },
  gold: {
    name: 'gold',
    displayName: 'Gold',
    maxConcurrentPicks: 5,
    minCompletedProjects: 15,
    minSuccessRate: 90,
    minTotalEarnings: 15000,
    benefits: [
      'Access to premium projects',
      'Up to 5 concurrent picks',
      'Top priority in search results',
      'Premium portfolio showcase',
      'Direct client communication after mutual interest',
      'Gold talent badge',
      'Exclusive project invitations',
      'Reduced platform fees',
    ],
    color: '#FFD700',
  },
};

export function getTierConfig(tier: TierLevel): TierConfig {
  return TIER_CONFIGS[tier];
}

export function getMaxConcurrentPicks(tier: TierLevel): number {
  return TIER_CONFIGS[tier].maxConcurrentPicks;
}

export function canPickProject(
  currentPicks: number,
  tier: TierLevel
): boolean {
  return currentPicks < getMaxConcurrentPicks(tier);
}

export function calculateEligibleTier(
  completedProjects: number,
  successRate: number,
  totalEarnings: number
): TierLevel {
  // Check from highest to lowest tier
  if (
    completedProjects >= TIER_CONFIGS.gold.minCompletedProjects &&
    successRate >= TIER_CONFIGS.gold.minSuccessRate &&
    totalEarnings >= TIER_CONFIGS.gold.minTotalEarnings
  ) {
    return 'gold';
  }

  if (
    completedProjects >= TIER_CONFIGS.silver.minCompletedProjects &&
    successRate >= TIER_CONFIGS.silver.minSuccessRate &&
    totalEarnings >= TIER_CONFIGS.silver.minTotalEarnings
  ) {
    return 'silver';
  }

  return 'bronze';
}

export function canAccessProject(
  talentTier: TierLevel,
  projectMinimumTier: TierLevel
): boolean {
  const tierOrder: TierLevel[] = ['bronze', 'silver', 'gold'];
  const talentTierIndex = tierOrder.indexOf(talentTier);
  const projectTierIndex = tierOrder.indexOf(projectMinimumTier);
  
  return talentTierIndex >= projectTierIndex;
}

export function getNextTierRequirements(
  currentTier: TierLevel
): TierConfig | null {
  if (currentTier === 'bronze') {
    return TIER_CONFIGS.silver;
  }
  if (currentTier === 'silver') {
    return TIER_CONFIGS.gold;
  }
  return null; // Already at max tier
}

export function calculateProgressToNextTier(
  currentTier: TierLevel,
  completedProjects: number,
  successRate: number,
  totalEarnings: number
): {
  nextTier: TierLevel | null;
  projectsProgress: number;
  successRateProgress: number;
  earningsProgress: number;
  overallProgress: number;
} | null {
  const nextTierConfig = getNextTierRequirements(currentTier);
  
  if (!nextTierConfig) {
    return null; // Already at max tier
  }

  const projectsProgress = Math.min(
    (completedProjects / nextTierConfig.minCompletedProjects) * 100,
    100
  );
  
  const successRateProgress = Math.min(
    (successRate / nextTierConfig.minSuccessRate) * 100,
    100
  );
  
  const earningsProgress = Math.min(
    (totalEarnings / nextTierConfig.minTotalEarnings) * 100,
    100
  );

  const overallProgress =
    (projectsProgress + successRateProgress + earningsProgress) / 3;

  return {
    nextTier: nextTierConfig.name,
    projectsProgress,
    successRateProgress,
    earningsProgress,
    overallProgress,
  };
}

export function shouldUpgradeTier(
  currentTier: TierLevel,
  completedProjects: number,
  successRate: number,
  totalEarnings: number
): boolean {
  const eligibleTier = calculateEligibleTier(
    completedProjects,
    successRate,
    totalEarnings
  );
  
  const tierOrder: TierLevel[] = ['bronze', 'silver', 'gold'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const eligibleIndex = tierOrder.indexOf(eligibleTier);
  
  return eligibleIndex > currentIndex;
}
