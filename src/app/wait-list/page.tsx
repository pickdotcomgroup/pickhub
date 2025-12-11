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
        
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 5000);
      } else if (response.status === 409) {
        setSubmitStatus("duplicate");
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 5000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      setSubmitStatus("error");
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&display=swap');

        :root {
          --color-primary: #0F172A;
          --color-accent: #3B82F6;
          --color-accent-light: #60A5FA;
          --color-surface: #F8FAFC;
          --color-surface-elevated: #FFFFFF;
          --color-text-primary: #0F172A;
          --color-text-secondary: #64748B;
          --color-success: #10B981;
          --color-warning: #F59E0B;
          --color-error: #EF4444;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-600 {
          animation-delay: 0.6s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.15);
        }

        .input-focus {
          transition: all 0.3s ease;
        }

        .input-focus:focus {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
        }

        .bg-pattern {
          background-color: var(--color-surface);
          background-image: 
            radial-gradient(at 20% 30%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(147, 51, 234, 0.08) 0px, transparent 50%),
            radial-gradient(at 40% 80%, rgba(59, 130, 246, 0.06) 0px, transparent 50%);
        }

        .status-message {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>

      <main className="min-h-screen bg-pattern flex flex-col relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-300"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-500"></div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20 relative z-10">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-16 opacity-0 animate-fade-in-up">
              {/* Logo/Brand */}
              <div className="mb-8">
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <span className="gradient-text">Talent</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>Bridge</span>
                </h1>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                  <p className="text-xl sm:text-2xl font-semibold tracking-wide" style={{ color: 'var(--color-text-secondary)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em' }}>
                    Grow Your Skills, Land Your Dream Job
                  </p>
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                </div>
              </div>

              {/* Launch Badge */}
              <div className="inline-flex items-center gap-3 px-8 py-4 glass-effect rounded-full mb-10 opacity-0 animate-fade-in delay-200 shadow-lg">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </div>
                <span className="font-bold text-lg tracking-wide" style={{ color: 'var(--color-accent)' }}>
                  Launching Q1 2025
                </span>
              </div>

              {/* Hero Description */}
              <p className="text-lg sm:text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in-up delay-300" style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>
                The all-in-one platform that combines personalized skill development with AI-powered job matching to accelerate your career.
              </p>
              
              <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up delay-400" style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                Join thousands of professionals transforming their careers through targeted learning and smart job matching.
              </p>
            </div>

            {/* Waitlist Form */}
            <div className="max-w-xl mx-auto mb-20 opacity-0 animate-fade-in-up delay-500">
              <form onSubmit={handleWaitlistSubmit} className="relative">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      disabled={isSubmitting}
                      className="w-full px-8 py-5 glass-effect rounded-2xl input-focus text-lg outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      style={{ 
                        color: 'var(--color-text-primary)',
                        border: '2px solid rgba(59, 130, 246, 0.1)'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%)',
                      color: 'white'
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining...
                      </span>
                    ) : (
                      "Join Waitlist"
                    )}
                  </button>
                </div>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="mt-6 p-5 glass-effect rounded-2xl flex items-center gap-3 status-message" style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <svg className="w-6 h-6" style={{ color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-success)' }}>You&apos;re on the list!</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>We&apos;ll notify you when we launch.</p>
                    </div>
                  </div>
                )}

                {submitStatus === "duplicate" && (
                  <div className="mt-6 p-5 glass-effect rounded-2xl flex items-center gap-3 status-message" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                      <svg className="w-6 h-6" style={{ color: 'var(--color-warning)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-warning)' }}>Already registered!</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>This email is already on our waitlist.</p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mt-6 p-5 glass-effect rounded-2xl flex items-center gap-3 status-message" style={{ borderLeft: '4px solid var(--color-error)' }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <svg className="w-6 h-6" style={{ color: 'var(--color-error)' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-error)' }}>Something went wrong</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Please try again in a moment.</p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
              {/* Feature 1 */}
              <div className="glass-effect rounded-3xl p-10 card-hover shadow-xl opacity-0 animate-scale-in delay-600" style={{ border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <div className="text-5xl mb-6">📚</div>
                <h3 className="text-2xl font-bold mb-4 tracking-wide" style={{ color: 'var(--color-text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
                  Personalized Learning Paths
                </h3>
                <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Access curated courses, interactive workshops, and hands-on projects tailored to your career goals. Build in-demand skills with industry-recognized certifications and real-world experience.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-effect rounded-3xl p-10 card-hover shadow-xl opacity-0 animate-scale-in delay-700" style={{ border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <div className="text-5xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold mb-4 tracking-wide" style={{ color: 'var(--color-text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
                  AI-Powered Job Matching
                </h3>
                <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Our intelligent matching system connects you with opportunities that align with your skills, experience, and aspirations. Get personalized job recommendations that fit your career trajectory.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-12 sm:gap-16 text-center opacity-0 animate-fade-in-up delay-700">
              <div className="group">
                <div className="text-5xl sm:text-6xl font-bold mb-3 gradient-text transition-transform group-hover:scale-110 duration-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  10K+
                </div>
                <div className="text-base font-semibold tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                  Skills Learned
                </div>
              </div>
              <div className="group">
                <div className="text-5xl sm:text-6xl font-bold mb-3 gradient-text transition-transform group-hover:scale-110 duration-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  95%
                </div>
                <div className="text-base font-semibold tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                  Match Success Rate
                </div>
              </div>
              <div className="group">
                <div className="text-5xl sm:text-6xl font-bold mb-3 gradient-text transition-transform group-hover:scale-110 duration-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Q1 2025
                </div>
                <div className="text-base font-semibold tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                  Launch Date
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}