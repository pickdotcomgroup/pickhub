import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getUserRole } from "~/lib/user-roles";

export async function withAuth(
  request: NextRequest,
  requiredPermissions: string[] = [],
  allowedRoles: string[] = []
) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Get user role data
  const roleData = await getUserRole(token.sub!);

  // Determine role-specific dashboard
  const dashboardUrl = roleData.role === "client"
    ? "/client/dashboard"
    : roleData.role === "talent"
    ? "/talent/dashboard"
    : roleData.role === "admin"
    ? "/admin/dashboard"
    : "/dashboard";

  // Check if user has required role
  if (allowedRoles.length > 0 && roleData.role && !allowedRoles.includes(roleData.role)) {
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      roleData.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  return NextResponse.next();
}

export function createAuthMiddleware(
  requiredPermissions: string[] = [],
  allowedRoles: string[] = []
) {
  return async (request: NextRequest) => {
    return withAuth(request, requiredPermissions, allowedRoles);
  };
}
