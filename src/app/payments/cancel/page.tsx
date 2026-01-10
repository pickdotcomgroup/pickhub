"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, HelpCircle, Loader2 } from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const type = searchParams.get("type") ?? "purchase";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Canceled
        </h1>

        <p className="text-gray-600 mb-6">
          {type === "course"
            ? "Your course purchase was canceled. No charges were made to your account."
            : type === "subscription"
            ? "Your subscription signup was canceled. No charges were made to your account."
            : "Your payment was canceled. No charges were made to your account."}
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 text-left">
            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Need help?
              </p>
              <p className="text-sm text-blue-700 mt-1">
                If you encountered an issue during checkout, please contact our
                support team.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {courseId ? (
            <Link
              href={`/talent/upskilling/provider/${courseId}`}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Course
            </Link>
          ) : (
            <Link
              href="/talent/upskilling"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Courses
            </Link>
          )}

          <Link
            href="/talent/dashboard"
            className="block w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto" />
        <p className="text-gray-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCancelContent />
    </Suspense>
  );
}
