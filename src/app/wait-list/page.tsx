"use client";

import { useState } from "react";
import Footer from "../_components/footer";


export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "duplicate">("idle");

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as { success?: boolean; error?: string; message?: string };

      if (response.ok && data.success) {
        setSubmitStatus("success");
        setEmail("");
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 5000);
      } else if (response.status === 409) {
        // Handle duplicate email specifically
        setSubmitStatus("duplicate");
        // Reset duplicate message after 5 seconds
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 5000);
      } else {
        setSubmitStatus("error");
        // Reset error message after 5 seconds
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      setSubmitStatus("error");
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4">
              <span className="text-blue-600">TechPick</span>
              <span className="text-gray-900">Hub</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="h-px w-12 bg-gray-300"></div>
              <p className="text-lg sm:text-xl font-medium">
                The Future of Freelancing
              </p>
              <div className="h-px w-12 bg-gray-300"></div>
            </div>
          </div>

          {/* Launching Soon Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-full mb-8 animate-pulse">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-lg">Launching Soon</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Stop Bidding. Start Picking.
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The modern tech freelance platform where developers choose projects and clients choose from interested developers. 
            Join the waitlist to be the first to experience the future of work.
          </p>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </button>
            </form>

            {/* Success Message */}
            {submitStatus === "success" && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">You&apos;re on the list! We&apos;ll notify you when we launch.</span>
              </div>
            )}

            {/* Duplicate Email Message */}
            {submitStatus === "duplicate" && (
              <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">This email is already on the waitlist! We&apos;ll notify you when we launch.</span>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === "error" && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Something went wrong. Please try again.</span>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Clients</h3>
              <p className="text-gray-600">
                Post projects and let qualified developers come to you. Pick from interested professionals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">👨‍💻</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Developers</h3>
              <p className="text-gray-600">
                Browse projects that match your skills. Express interest and get picked by clients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Agencies</h3>
              <p className="text-gray-600">
                Scale your business with team collaboration tools and multi-project management.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Early Signups</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Beta Testers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">Q1 2025</div>
              <div className="text-gray-600">Launch Date</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
