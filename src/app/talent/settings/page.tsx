"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Lock,
  Globe,
  CreditCard,
  Shield,
  Mail,
  Smartphone,
  Eye,
  CheckCircle,
  ExternalLink,
  Loader2,
  Crown,
  Star,
} from "lucide-react";
import { TALENT_TIERS, formatTierPrice } from "~/lib/subscription-tiers";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function TalentSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("account");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [currentSubscription] = useState<{
    tier: string;
    status: string;
    currentPeriodEnd: string;
  } | null>(null);
  const [orderHistory] = useState<Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    course?: { title: string };
  }>>([]);

  // Settings sections
  const settingSections: SettingSection[] = [
    {
      id: "account",
      title: "Account",
      description: "Manage your account details and preferences",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure how you receive notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "privacy",
      title: "Privacy",
      description: "Control your privacy and visibility settings",
      icon: <Eye className="w-5 h-5" />,
    },
    {
      id: "security",
      title: "Security",
      description: "Manage your password and security options",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: "billing",
      title: "Billing",
      description: "Manage your payment methods and billing",
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailMessages: true,
    emailNewsletter: false,
    pushJobAlerts: true,
    pushMessages: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "talent") {
      router.push("/dashboard");
      return;
    }

    // Check verification status
    const checkVerification = async () => {
      try {
        const response = await fetch("/api/verification/status");
        if (response.ok) {
          const data = await response.json() as { platformAccess?: boolean };
          if (!data.platformAccess) {
            router.push("/talent/verification");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkVerification();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="md:col-span-3 h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              defaultValue={session?.user?.name ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              defaultValue={session?.user?.email ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              placeholder="e.g., Full Stack Developer"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Job Alerts</p>
                <p className="text-sm text-gray-500">Get notified about new job matches</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailJobAlerts}
              onChange={(e) => setNotifications({ ...notifications, emailJobAlerts: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Messages</p>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailMessages}
              onChange={(e) => setNotifications({ ...notifications, emailMessages: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-500">Receive tips and platform updates</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailNewsletter}
              onChange={(e) => setNotifications({ ...notifications, emailNewsletter: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Job Alerts</p>
                <p className="text-sm text-gray-500">Push notifications for job matches</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.pushJobAlerts}
              onChange={(e) => setNotifications({ ...notifications, pushJobAlerts: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Messages</p>
                <p className="text-sm text-gray-500">Push notifications for new messages</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.pushMessages}
              onChange={(e) => setNotifications({ ...notifications, pushMessages: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Save Preferences
        </button>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Public Profile</p>
                <p className="text-sm text-gray-500">Make your profile visible to employers</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.profileVisible}
              onChange={(e) => setPrivacy({ ...privacy, profileVisible: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Show Email</p>
                <p className="text-sm text-gray-500">Display email on your public profile</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.showEmail}
              onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Allow Direct Messages</p>
                <p className="text-sm text-gray-500">Allow employers to message you directly</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={privacy.allowMessages}
              onChange={(e) => setPrivacy({ ...privacy, allowMessages: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Save Privacy Settings
        </button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
          </div>
          <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
            Enable
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Update Password
        </button>
      </div>
    </div>
  );

  const handleUpgradePlan = async (tierId: string) => {
    const tier = Object.values(TALENT_TIERS).find(t => t.id === tierId);
    if (!tier?.polarProductId) {
      alert("This plan is not yet available for purchase. Please contact support.");
      return;
    }

    setSubscriptionLoading(true);
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscription",
          productId: tier.polarProductId,
          tier: tierId,
          successUrl: `${window.location.origin}/payments/success?type=subscription`,
          cancelUrl: `${window.location.origin}/talent/settings`,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout");

      const data = (await response.json()) as { checkoutUrl?: string };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to start upgrade. Please try again.");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/trpc/payments.getCustomerPortalUrl");
      const data = (await response.json()) as { result?: { data?: { url?: string } } };
      if (data?.result?.data?.url) {
        window.open(data.result.data.url, "_blank");
      } else {
        alert("Billing portal is not available. Please contact support.");
      }
    } catch (error) {
      console.error("Portal error:", error);
    }
  };

  const renderBillingSection = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-600 font-medium">
                  {currentSubscription ? currentSubscription.tier : "Free"} Plan
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {currentSubscription
                  ? formatTierPrice(TALENT_TIERS[currentSubscription.tier] ?? TALENT_TIERS.free!)
                  : "$0/month"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {currentSubscription
                  ? `Renews on ${new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}`
                  : "Basic access to job listings and profile"}
              </p>
            </div>
            {currentSubscription ? (
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-50 transition"
              >
                Manage Billing
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleUpgradePlan("talent_professional")}
                disabled={subscriptionLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {subscriptionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Upgrade Plan"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TALENT_TIERS).map(([key, tier]) => (
            <div
              key={tier.id}
              className={`p-5 rounded-xl border-2 ${
                tier.recommended
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {tier.recommended && (
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-2">
                  <Star className="w-4 h-4" />
                  Recommended
                </div>
              )}
              <h4 className="font-bold text-gray-900">{tier.name}</h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatTierPrice(tier)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{tier.description}</p>

              <ul className="mt-4 space-y-2">
                {tier.benefits.slice(0, 4).map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        benefit.included ? "text-green-500" : "text-gray-300"
                      }`}
                    />
                    <span className={benefit.included ? "text-gray-700" : "text-gray-400"}>
                      {benefit.label}
                    </span>
                  </li>
                ))}
              </ul>

              {key !== "free" && (
                <button
                  onClick={() => handleUpgradePlan(tier.id)}
                  disabled={subscriptionLoading || currentSubscription?.tier === key}
                  className={`w-full mt-4 py-2 rounded-lg font-medium transition ${
                    currentSubscription?.tier === key
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : tier.recommended
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {currentSubscription?.tier === key ? "Current Plan" : "Select Plan"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order History */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order History</h3>
        {orderHistory.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderHistory.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.course?.title ?? order.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your purchase history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return renderAccountSection();
      case "notifications":
        return renderNotificationsSection();
      case "privacy":
        return renderPrivacySection();
      case "security":
        return renderSecuritySection();
      case "billing":
        return renderBillingSection();
      default:
        return renderAccountSection();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className={activeSection === section.id ? "text-blue-600" : "text-gray-400"}>
                  {section.icon}
                </span>
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
