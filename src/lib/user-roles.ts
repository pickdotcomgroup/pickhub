import { db } from "~/server/db";

export type UserRole = "talent" | "admin" | "trainer" | "employer" | null;

export interface UserRoleData {
  role: UserRole;
  profile: unknown;
  permissions: string[];
}

export async function getUserRole(userId: string): Promise<UserRoleData> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        employerProfile: true,
        trainerProfile: true,
        talentProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return { role: null, profile: null, permissions: [] };
    }

    // Check if user is admin first
    if (user.role === "admin" && user.adminProfile) {
      return {
        role: "admin",
        profile: user.adminProfile,
        permissions: [
          "verify_talents",
          "view_all_users",
          "manage_users",
          "view_analytics",
          "manage_projects",
          "manage_verifications",
          "access_admin_dashboard",
          "review_talent_applications",
          "approve_reject_talents",
        ],
      };
    }

    // Determine role based on which profile exists
    if (user.employerProfile) {
      return {
        role: "employer",
        profile: user.employerProfile,
        permissions: [
          "post_projects",
          "hire_talent",
          "manage_projects",
          "manage_team",
          "view_talent_profiles",
          "view_trainer_profiles",
          "send_messages",
          "make_payments",
        ],
      };
    }

    if (user.trainerProfile) {
      return {
        role: "trainer",
        profile: user.trainerProfile,
        permissions: [
          "create_courses",
          "manage_courses",
          "view_talent_profiles",
          "send_messages",
          "receive_payments",
          "create_certifications",
        ],
      };
    }

    if (user.talentProfile) {
      return {
        role: "talent",
        profile: user.talentProfile,
        permissions: [
          "apply_to_projects",
          "create_portfolio",
          "receive_messages",
          "receive_payments",
          "view_employer_profiles",
          "view_project_details",
          "enroll_in_courses",
        ],
      };
    }

    return { role: null, profile: null, permissions: [] };
  } catch (error) {
    console.error("Error getting user role:", error);
    return { role: null, profile: null, permissions: [] };
  }
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "employer":
      return "Employer";
    case "talent":
      return "Talent Developer";
    case "trainer":
      return "Trainer";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case "employer":
      return "blue";
    case "talent":
      return "green";
    case "trainer":
      return "purple";
    case "admin":
      return "red";
    default:
      return "gray";
  }
}
