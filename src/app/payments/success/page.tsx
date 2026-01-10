"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, BookOpen, ArrowRight, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const type = searchParams.get("type") ?? "purchase";
  const courseId = searchParams.get("courseId");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect based on purchase type
          if (type === "course" && courseId) {
            router.push(`/talent/my-learning`);
          } else if (type === "subscription") {
            router.push("/talent/settings");
          } else {
            router.push("/talent/my-learning");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, type, courseId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          {type === "course"
            ? "You have been enrolled in the course. Start learning now!"
            : type === "subscription"
            ? "Your subscription is now active. Enjoy your premium features!"
            : "Your payment has been processed successfully."}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting in {countdown} seconds...</span>
          </div>
        </div>

        <div className="space-y-3">
          {type === "course" ? (
            <Link
              href="/talent/my-learning"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Go to My Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : type === "subscription" ? (
            <Link
              href="/talent/settings"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Subscription
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/talent/dashboard"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/talent/upskilling"
            className="block w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto" />
        <p className="text-gray-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
