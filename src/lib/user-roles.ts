import { db } from "~/server/db";

export type UserRole = "client" | "talent" | "agency" | null;

export interface UserRoleData {
  role: UserRole;
  profile: any;
  permissions: string[];
}

export async function getUserRole(userId: string): Promise<UserRoleData> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        talentProfile: true,
        agencyProfile: true,
      },
    });

    if (!user) {
      return { role: null, profile: null, permissions: [] };
    }

    // Determine role based on which profile exists
    if (user.clientProfile) {
      return {
        role: "client",
        profile: user.clientProfile,
        permissions: [
          "post_projects",
          "hire_talent",
          "manage_projects",
          "view_talent_profiles",
          "view_agency_profiles",
          "send_messages",
          "make_payments",
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
          "view_client_profiles",
          "view_project_details",
        ],
      };
    }

    if (user.agencyProfile) {
      return {
        role: "agency",
        profile: user.agencyProfile,
        permissions: [
          "post_projects",
          "hire_talent",
          "manage_team",
          "manage_multiple_projects",
          "view_talent_profiles",
          "view_client_profiles",
          "send_messages",
          "make_payments",
          "receive_payments",
          "team_collaboration",
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
    case "client":
      return "Client";
    case "talent":
      return "Talent Developer";
    case "agency":
      return "Agency";
    default:
      return "User";
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case "client":
      return "blue";
    case "talent":
      return "green";
    case "agency":
      return "indigo";
    default:
      return "gray";
  }
}
