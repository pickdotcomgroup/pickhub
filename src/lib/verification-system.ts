// Verification System Utilities for Quality Assurance Framework

export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected';
export type VerificationDecision = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export interface VerificationRequirements {
  portfolioRequired: boolean;
  codeRepositoryRequired: boolean;
  skillTestsRequired: boolean;
  linkedInRequired: boolean;
  identityVerificationRequired: boolean;
}

export interface VerificationScores {
  portfolioScore?: number;
  codeSampleScore?: number;
  skillTestsScore?: number;
  overallScore?: number;
}

export interface VerificationProgress {
  portfolioReviewed: boolean;
  codeSampleReviewed: boolean;
  skillTestsTaken: boolean;
  linkedInVerified: boolean;
  identityVerified: boolean;
  completionPercentage: number;
}

// Default verification requirements
export const DEFAULT_VERIFICATION_REQUIREMENTS: VerificationRequirements = {
  portfolioRequired: true,
  codeRepositoryRequired: true,
  skillTestsRequired: false, // Optional
  linkedInRequired: true,
  identityVerificationRequired: true,
};

// Scoring weights for overall verification score
export const VERIFICATION_WEIGHTS = {
  portfolio: 0.35,      // 35%
  codeSample: 0.35,     // 35%
  skillTests: 0.20,     // 20%
  identity: 0.10,       // 10%
};

// Minimum scores required for approval
export const MINIMUM_SCORES = {
  portfolio: 60,
  codeSample: 60,
  skillTests: 70,
  overall: 65,
};

/**
 * Calculate overall verification score based on individual component scores
 */
export function calculateOverallScore(scores: VerificationScores): number {
  let totalWeight = 0;
  let weightedSum = 0;

  if (scores.portfolioScore !== undefined) {
    weightedSum += scores.portfolioScore * VERIFICATION_WEIGHTS.portfolio;
    totalWeight += VERIFICATION_WEIGHTS.portfolio;
  }

  if (scores.codeSampleScore !== undefined) {
    weightedSum += scores.codeSampleScore * VERIFICATION_WEIGHTS.codeSample;
    totalWeight += VERIFICATION_WEIGHTS.codeSample;
  }

  if (scores.skillTestsScore !== undefined) {
    weightedSum += scores.skillTestsScore * VERIFICATION_WEIGHTS.skillTests;
    totalWeight += VERIFICATION_WEIGHTS.skillTests;
  }

  // If no scores available, return 0
  if (totalWeight === 0) return 0;

  // Calculate weighted average
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Check if verification meets minimum requirements for approval
 */
export function meetsVerificationRequirements(
  scores: VerificationScores,
  requirements: VerificationRequirements = DEFAULT_VERIFICATION_REQUIREMENTS
): { approved: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check portfolio score
  if (requirements.portfolioRequired) {
    if (!scores.portfolioScore) {
      reasons.push('Portfolio review not completed');
    } else if (scores.portfolioScore < MINIMUM_SCORES.portfolio) {
      reasons.push(`Portfolio score (${scores.portfolioScore}) below minimum (${MINIMUM_SCORES.portfolio})`);
    }
  }

  // Check code sample score
  if (requirements.codeRepositoryRequired) {
    if (!scores.codeSampleScore) {
      reasons.push('Code sample review not completed');
    } else if (scores.codeSampleScore < MINIMUM_SCORES.codeSample) {
      reasons.push(`Code sample score (${scores.codeSampleScore}) below minimum (${MINIMUM_SCORES.codeSample})`);
    }
  }

  // Check skill tests score (if required)
  if (requirements.skillTestsRequired && scores.skillTestsScore) {
    if (scores.skillTestsScore < MINIMUM_SCORES.skillTests) {
      reasons.push(`Skill tests score (${scores.skillTestsScore}) below minimum (${MINIMUM_SCORES.skillTests})`);
    }
  }

  // Check overall score
  const overallScore = scores.overallScore ?? calculateOverallScore(scores);
  if (overallScore < MINIMUM_SCORES.overall) {
    reasons.push(`Overall score (${overallScore}) below minimum (${MINIMUM_SCORES.overall})`);
  }

  return {
    approved: reasons.length === 0,
    reasons,
  };
}

/**
 * Calculate verification progress percentage
 */
export function calculateVerificationProgress(
  verification: {
    portfolioReviewed: boolean;
    codeSampleReviewed: boolean;
    skillTestsTaken?: unknown;
    linkedInVerified: boolean;
    identityVerified: boolean;
  },
  requirements: VerificationRequirements = DEFAULT_VERIFICATION_REQUIREMENTS
): VerificationProgress {
  let completed = 0;
  let total = 0;

  // Portfolio
  if (requirements.portfolioRequired) {
    total++;
    if (verification.portfolioReviewed) completed++;
  }

  // Code sample
  if (requirements.codeRepositoryRequired) {
    total++;
    if (verification.codeSampleReviewed) completed++;
  }

  // Skill tests (optional)
  if (requirements.skillTestsRequired) {
    total++;
    const skillTests = verification.skillTestsTaken as unknown[];
    if (skillTests && Array.isArray(skillTests) && skillTests.length > 0) completed++;
  }

  // LinkedIn
  if (requirements.linkedInRequired) {
    total++;
    if (verification.linkedInVerified) completed++;
  }

  // Identity
  if (requirements.identityVerificationRequired) {
    total++;
    if (verification.identityVerified) completed++;
  }

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    portfolioReviewed: verification.portfolioReviewed,
    codeSampleReviewed: verification.codeSampleReviewed,
    skillTestsTaken: !!verification.skillTestsTaken,
    linkedInVerified: verification.linkedInVerified,
    identityVerified: verification.identityVerified,
    completionPercentage,
  };
}

/**
 * Determine if talent can access platform based on verification status
 */
export function canAccessPlatform(
  verificationStatus: VerificationStatus,
  platformAccess: boolean
): boolean {
  return verificationStatus === 'verified' && platformAccess === true;
}

/**
 * Get verification status display information
 */
export function getVerificationStatusInfo(status: VerificationStatus): {
  label: string;
  color: string;
  description: string;
} {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending Verification',
        color: 'yellow',
        description: 'Your profile is awaiting verification. Please complete all required steps.',
      };
    case 'in_review':
      return {
        label: 'Under Review',
        color: 'blue',
        description: 'Our team is reviewing your submission. This typically takes 1-2 business days.',
      };
    case 'verified':
      return {
        label: 'Verified',
        color: 'green',
        description: 'Your profile has been verified. You now have full access to the platform.',
      };
    case 'rejected':
      return {
        label: 'Verification Failed',
        color: 'red',
        description: 'Your verification was not approved. Please review the feedback and resubmit.',
      };
    default:
      return {
        label: 'Unknown',
        color: 'gray',
        description: 'Verification status unknown.',
      };
  }
}

/**
 * Validate GitHub username format
 */
export function isValidGitHubUsername(username: string): boolean {
  // GitHub username rules: alphanumeric and hyphens, cannot start/end with hyphen, max 39 chars
  const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return githubUsernameRegex.test(username);
}

/**
 * Validate GitLab username format
 */
export function isValidGitLabUsername(username: string): boolean {
  // GitLab username rules: alphanumeric, underscores, dots, and hyphens
  const gitlabUsernameRegex = /^[a-zA-Z0-9._-]+$/;
  return gitlabUsernameRegex.test(username);
}

/**
 * Validate LinkedIn URL format
 */
export function isValidLinkedInUrl(url: string): boolean {
  const linkedInUrlRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9-]+\/?$/;
  return linkedInUrlRegex.test(url);
}

/**
 * Extract GitHub username from various GitHub URL formats
 */
export function extractGitHubUsername(input: string): string | null {
  // Handle direct username
  if (isValidGitHubUsername(input)) {
    return input;
  }

  // Handle GitHub URLs
  const patterns = [
    /github\.com\/([a-zA-Z0-9-]+)/,
    /^@?([a-zA-Z0-9-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1] && isValidGitHubUsername(match[1])) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate verification checklist for talent
 */
export function generateVerificationChecklist(
  requirements: VerificationRequirements = DEFAULT_VERIFICATION_REQUIREMENTS
): Array<{ id: string; label: string; required: boolean }> {
  const checklist = [];

  if (requirements.portfolioRequired) {
    checklist.push({
      id: 'portfolio',
      label: 'Submit portfolio for review',
      required: true,
    });
  }

  if (requirements.codeRepositoryRequired) {
    checklist.push({
      id: 'code_repository',
      label: 'Connect GitHub/GitLab account and submit code samples',
      required: true,
    });
  }

  if (requirements.skillTestsRequired) {
    checklist.push({
      id: 'skill_tests',
      label: 'Complete skill verification tests',
      required: true,
    });
  } else {
    checklist.push({
      id: 'skill_tests',
      label: 'Complete skill verification tests (optional, boosts credibility)',
      required: false,
    });
  }

  if (requirements.linkedInRequired) {
    checklist.push({
      id: 'linkedin',
      label: 'Verify LinkedIn profile',
      required: true,
    });
  }

  if (requirements.identityVerificationRequired) {
    checklist.push({
      id: 'identity',
      label: 'Complete identity verification',
      required: true,
    });
  }

  return checklist;
}
