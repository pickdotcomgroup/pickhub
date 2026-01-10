"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Calendar,
  Download,
  ChevronLeft,
  Loader2,
  Wallet,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { api } from "~/trpc/react";

interface PayoutSummary {
  totalEarnings: number;
  pendingEarnings: number;
  completedEarnings: number;
}

export default function TrainerPayoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch earnings summary
  const { data: earningsData } =
    api.payments.getTrainerEarnings.useQuery(undefined, {
      enabled: !!session?.user?.id,
    });

  // Fetch payout history
  const { data: payoutsData, isLoading: payoutsLoading } =
    api.payments.getPayoutHistory.useQuery(
      statusFilter !== "all"
        ? { status: statusFilter as "pending" | "processing" | "completed" | "failed" }
        : undefined,
      { enabled: !!session?.user?.id }
    );

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role !== "trainer") {
      router.push("/dashboard");
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  const summary: PayoutSummary = {
    totalEarnings: earningsData?.totalEarnings ?? 0,
    pendingEarnings: earningsData?.pendingEarnings ?? 0,
    completedEarnings: earningsData?.completedEarnings ?? 0,
  };

  const payouts = payoutsData?.payouts ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/trainer/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
              <p className="text-sm text-gray-500">
                Track your earnings and payout history
              </p>
            </div>
          </div>
          <Link
            href="/trainer/settings"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <CreditCard className="w-4 h-4" />
            Payout Settings
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Lifetime</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${summary.totalEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 text-yellow-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Processing</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${summary.pendingEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Pending Payouts</p>
          </div>

          {/* Completed Payouts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-blue-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${summary.completedEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Paid Out</p>
          </div>
        </div>

        {/* Platform Fee Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Platform Fee: 15%</p>
              <p className="text-sm text-blue-700 mt-1">
                Your earnings shown are after the platform fee. For each course sale,
                you receive 85% of the purchase price. Upgrade to Professional or
                Enterprise to reduce your platform fee.
              </p>
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Payout History
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {payoutsLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
              <p className="text-gray-500 mt-2">Loading payouts...</p>
            </div>
          ) : payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {payout.order?.course?.title ?? "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {payout.order?.user?.name ?? payout.order?.user?.email ?? "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            +${payout.amount.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                            payout.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : payout.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : payout.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payout.status === "completed" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {payout.status === "pending" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {payout.status.charAt(0).toUpperCase() +
                            payout.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No payouts yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When students purchase your courses, your earnings will appear here.
                Start by creating and publishing courses to begin earning.
              </p>
              <Link
                href="/trainer/course-management"
                className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create a Course
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Payout Schedule Info */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Payout Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Payout Schedule
              </h4>
              <p className="text-sm text-gray-600">
                Payouts are processed automatically every month. You&apos;ll receive
                your earnings on the 1st of each month for the previous month&apos;s
                sales.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Minimum Payout
              </h4>
              <p className="text-sm text-gray-600">
                A minimum balance of $50 is required for payouts. If your balance
                is below this threshold, it will be carried over to the next month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
