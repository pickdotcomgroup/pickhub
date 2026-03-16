"use client";

import { useState } from "react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error" | "duplicate"
  >("idle");
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (response.ok && data.success) {
        setSubmitStatus("success");
        setEmail("");
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else if (response.status === 409) {
        setSubmitStatus("duplicate");
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 5000);
      }
    } catch (error) {
      console.error("Error submitting to waitlist:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&display=swap");

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(2deg); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }

        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        .animate-up {
          animation: fadeInUp 0.9s ease-out forwards;
          opacity: 0;
        }

        .animate-in {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }

        .waitlist-hero {
          min-height: 100vh;
          background: #030014;
          position: relative;
          overflow: hidden;
        }

        .waitlist-hero::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
              ellipse at 20% 50%,
              rgba(59, 130, 246, 0.15) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse at 80% 20%,
              rgba(139, 92, 246, 0.12) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse at 50% 80%,
              rgba(236, 72, 153, 0.08) 0%,
              transparent 50%
            );
          animation: gradient-shift 15s ease infinite;
          background-size: 200% 200%;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            );
          background-size: 60px 60px;
          mask-image: radial-gradient(
            ellipse at center,
            black 30%,
            transparent 70%
          );
          -webkit-mask-image: radial-gradient(
            ellipse at center,
            black 30%,
            transparent 70%
          );
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: morph 8s ease-in-out infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3),
            0 0 40px rgba(59, 130, 246, 0.15);
        }

        .btn-glow {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .btn-glow::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-glow:hover::after {
          opacity: 1;
        }

        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.5),
            0 0 80px rgba(59, 130, 246, 0.2);
        }

        .floating-badge {
          animation: float 6s ease-in-out infinite;
        }

        .orbit-dot {
          animation: orbit 20s linear infinite;
        }

        .status-toast {
          animation: slide-up 0.4s ease-out;
        }

        .text-gradient {
          background: linear-gradient(
            135deg,
            #60a5fa 0%,
            #a78bfa 40%,
            #f472b6 70%,
            #60a5fa 100%
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 6s ease infinite;
        }

        .stat-value {
          background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
        }

        .trust-bar {
          background: rgba(255, 255, 255, 0.03);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
      `}</style>

      <div className="waitlist-hero">
        {/* Background effects */}
        <div className="grid-bg" />
        <div
          className="glow-orb"
          style={{
            top: "10%",
            left: "15%",
            width: "400px",
            height: "400px",
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.15))",
          }}
        />
        <div
          className="glow-orb"
          style={{
            bottom: "10%",
            right: "10%",
            width: "350px",
            height: "350px",
            background:
              "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(59, 130, 246, 0.1))",
            animationDelay: "4s",
          }}
        />

        {/* Orbiting elements */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "0",
            height: "0",
          }}
        >
          <div
            className="orbit-dot"
            style={{
              width: "6px",
              height: "6px",
              background: "#60a5fa",
              borderRadius: "50%",
              boxShadow: "0 0 20px rgba(96, 165, 250, 0.6)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "0",
            height: "0",
          }}
        >
          <div
            className="orbit-dot"
            style={{
              width: "4px",
              height: "4px",
              background: "#a78bfa",
              borderRadius: "50%",
              boxShadow: "0 0 15px rgba(167, 139, 250, 0.5)",
              animationDuration: "30s",
              animationDirection: "reverse",
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 sm:pt-24 pb-10">
          {/* Company Name */}
          <div
            className="animate-up flex items-center gap-3 mb-8"
            style={{ animationDelay: "0.05s" }}
          >
            <img
              src="/image/TechLogo.png"
              alt="TechPickHub"
              style={{
                height: "48px",
                width: "auto",
                objectFit: "contain",
              }}
            />
            <span
              style={{
                color: "#fff",
                fontSize: "24px",
                fontWeight: "800",
                letterSpacing: "-0.02em",
              }}
            >
              TechPickHub
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-up text-center"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: "900",
              lineHeight: "1.05",
              letterSpacing: "-0.03em",
              color: "#fff",
              maxWidth: "850px",
              margin: "0 auto",
              animationDelay: "0.15s",
            }}
          >
            Your Career,{" "}
            <span className="text-gradient">Reimagined.</span>
          </h1>

          {/* Badge */}
          <div
            className="animate-up floating-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full mt-8"
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              animationDelay: "0.25s",
            }}
          >
            <span style={{ fontSize: "14px" }}>&#9889;</span>
            <span
              style={{
                color: "#60a5fa",
                fontSize: "14px",
                fontWeight: "600",
                letterSpacing: "0.02em",
              }}
            >
              Early Access &mdash; Launching Q1 2026
            </span>
          </div>

          {/* Subheading */}
          <p
            className="animate-up text-center"
            style={{
              fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
              color: "rgba(255,255,255,0.55)",
              maxWidth: "580px",
              lineHeight: "1.7",
              margin: "28px auto 0",
              fontWeight: "400",
              animationDelay: "0.35s",
            }}
          >
            Connect with certified training providers, unlock smart job
            matching, and transform your career trajectory &mdash; all in one
            platform.
          </p>

          {/* Waitlist Form */}
          <div
            className="animate-up w-full"
            style={{
              maxWidth: "520px",
              margin: "44px auto 0",
              animationDelay: "0.5s",
            }}
          >
            <form onSubmit={handleWaitlistSubmit}>
              <div
                className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  className="input-glow"
                  style={{
                    flex: 1,
                    padding: "16px 20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    color: "#fff",
                    fontSize: "16px",
                    outline: "none",
                    transition: "all 0.3s ease",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-glow"
                  style={{
                    padding: "16px 32px",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "14px",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          opacity="0.3"
                        />
                        <path
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          fill="currentColor"
                          opacity="0.8"
                        />
                      </svg>
                      Joining...
                    </span>
                  ) : (
                    "Book a Demo"
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div
                  className="status-toast flex items-center gap-3 mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    fill="#10b981"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p
                      style={{
                        color: "#34d399",
                        fontWeight: "600",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      You&apos;re in! Welcome aboard.
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "13px",
                        margin: "2px 0 0",
                      }}
                    >
                      We&apos;ll notify you when we launch.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === "duplicate" && (
                <div
                  className="status-toast flex items-center gap-3 mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    fill="#f59e0b"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p
                      style={{
                        color: "#fbbf24",
                        fontWeight: "600",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      Already on the list!
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "13px",
                        margin: "2px 0 0",
                      }}
                    >
                      This email is already registered.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div
                  className="status-toast flex items-center gap-3 mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    fill="#ef4444"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p
                      style={{
                        color: "#f87171",
                        fontWeight: "600",
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      Something went wrong
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "13px",
                        margin: "2px 0 0",
                      }}
                    >
                      Please try again in a moment.
                    </p>
                  </div>
                </div>
              )}
            </form>

            <p
              className="text-center mt-4"
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px",
              }}
            >
              No spam. Unsubscribe anytime. Join us now.
            </p>
          </div>

          {/* Feature Cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full animate-up"
            style={{
              maxWidth: "820px",
              margin: "72px auto 0",
              animationDelay: "0.7s",
            }}
          >
            {[
              {
                icon: "&#127891;",
                bg: "rgba(59, 130, 246, 0.15)",
                title: "Training Marketplace",
                desc: "Browse certified courses, earn recognized credentials, and build your skill set.",
              },
              {
                icon: "&#127919;",
                bg: "rgba(139, 92, 246, 0.15)",
                title: "Smart Job Matching",
                desc: "AI-powered matching connects you to opportunities that fit your career goals.",
              },
              {
                icon: "&#128640;",
                bg: "rgba(236, 72, 153, 0.15)",
                title: "Career Growth",
                desc: "Track your progress, showcase certifications, and fast-track promotions.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card p-7"
                style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
              >
                <div
                  className="feature-icon"
                  style={{ background: feature.bg }}
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "17px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Become Section */}
          <div
            className="animate-up w-full"
            style={{
              maxWidth: "820px",
              margin: "64px auto 0",
              animationDelay: "0.9s",
            }}
          >
            <p
              className="text-center"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "15px",
                fontWeight: "500",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              Join as
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  icon: "&#128187;",
                  title: "Tech Talent",
                  desc: "Showcase your skills, get certified, and land your dream tech role.",
                  gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.05))",
                  border: "rgba(59, 130, 246, 0.2)",
                },
                {
                  icon: "&#127979;",
                  title: "Training Providers",
                  desc: "List your courses, reach more learners, and grow your training business.",
                  gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.05))",
                  border: "rgba(139, 92, 246, 0.2)",
                },
                {
                  icon: "&#127970;",
                  title: "Employers",
                  desc: "Find pre-vetted, certified tech talent ready to make an impact.",
                  gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(244, 114, 182, 0.05))",
                  border: "rgba(236, 72, 153, 0.2)",
                },
              ].map((role, i) => (
                <div
                  key={i}
                  className="glass-card p-7 text-center"
                  style={{
                    background: role.gradient,
                    borderColor: role.border,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <span
                    style={{ fontSize: "36px", display: "block", marginBottom: "16px" }}
                    dangerouslySetInnerHTML={{ __html: role.icon }}
                  />
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    {role.title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {role.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom trust bar - replaces footer */}
        <div
          className="trust-bar relative z-10 mt-auto py-6 px-6"
        >
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { icon: "&#9989;", text: "Certified Providers" },
              { icon: "&#128274;", text: "Secure & Private" },
              { icon: "&#9889;", text: "AI-Powered Matching" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
              >
                <span
                  style={{ fontSize: "16px" }}
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                <span
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <p
            className="text-center mt-4"
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: "12px",
              margin: "16px 0 0",
            }}
          >
            &copy; {new Date().getFullYear()} TechPickHub. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
