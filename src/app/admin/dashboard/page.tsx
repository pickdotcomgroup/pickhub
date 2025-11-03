"use client";

import { useEffect, useState } from "react";

interface TalentProfile {
  verificationStatus: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  type: string;
  profile: TalentProfile | null;
  verification: unknown;
}

interface VerificationData {
  githubUsername?: string;
  gitlabUsername?: string;
  codeRepositoryUrl?: string;
  linkedInUrl?: string;
}

interface PendingTalent {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  skills: string[];
  portfolio?: string;
  portfolioUrl?: string;
  verificationStatus: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  verification?: VerificationData;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"pending" | "users">("pending");
  const [pendingTalents, setPendingTalents] = useState<PendingTalent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userType, setUserType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedTalent, setSelectedTalent] = useState<PendingTalent | null>(null);
  const [verificationForm, setVerificationForm] = useState({
    portfolioScore: "",
    codeSampleScore: "",
    skillTestsScore: "",
    overallScore: "",
    portfolioNotes: "",
    codeSampleNotes: "",
    rejectionReason: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "pending") {
        const response = await fetch("/api/admin/verify-talent");
        const data = await response.json() as { pendingTalents?: PendingTalent[] };
        setPendingTalents(data.pendingTalents ?? []);
      } else {
        const response = await fetch(`/api/admin/users?type=${userType}`);
        const data = await response.json() as { users?: User[] };
        setUsers(data.users ?? []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userType]);

  const handleVerifyTalent = async (decision: "approved" | "rejected") => {
    if (!selectedTalent) return;

    try {
      const response = await fetch("/api/admin/verify-talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talentProfileId: selectedTalent.id,
          decision,
          portfolioScore: verificationForm.portfolioScore ? parseFloat(verificationForm.portfolioScore) : null,
          codeSampleScore: verificationForm.codeSampleScore ? parseFloat(verificationForm.codeSampleScore) : null,
          skillTestsScore: verificationForm.skillTestsScore ? parseFloat(verificationForm.skillTestsScore) : null,
          overallScore: verificationForm.overallScore ? parseFloat(verificationForm.overallScore) : null,
          portfolioNotes: verificationForm.portfolioNotes,
          codeSampleNotes: verificationForm.codeSampleNotes,
          rejectionReason: decision === "rejected" ? verificationForm.rejectionReason : null,
        }),
      });

      if (response.ok) {
        alert(`Talent ${decision === "approved" ? "verified" : "rejected"} successfully!`);
        setSelectedTalent(null);
        setVerificationForm({
          portfolioScore: "",
          codeSampleScore: "",
          skillTestsScore: "",
          overallScore: "",
          portfolioNotes: "",
          codeSampleNotes: "",
          rejectionReason: "",
        });
        void fetchData();
      } else {
        const error = await response.json() as { error: string };
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error verifying talent:", error);
      alert("Failed to verify talent");
    }
  };

  const talentCount = users.filter(u => u.type === 'talent').length;
  const clientCount = users.filter(u => u.type === 'client').length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users and verify talent applications</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{users.length}</h3>
            <p className="text-sm text-gray-400">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{talentCount}</h3>
            <p className="text-sm text-gray-400">Talents</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{clientCount}</h3>
            <p className="text-sm text-gray-400">Clients</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{pendingTalents.length}</h3>
            <p className="text-sm text-gray-400">Pending Reviews</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-white/10">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition ${
                activeTab === "pending"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300"
              }`}
            >
              Pending Verifications ({pendingTalents.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition ${
                activeTab === "users"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300"
              }`}
            >
              All Users ({users.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
              <div className="text-lg text-white">Loading...</div>
            </div>
          </div>
        ) : activeTab === "pending" ? (
          <div className="space-y-4">
            {pendingTalents.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No pending verification requests</p>
                <p className="text-gray-500 text-sm mt-2">All talent applications have been reviewed</p>
              </div>
            ) : (
              pendingTalents.map((talent) => (
                <div key={talent.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {talent.firstName} {talent.lastName}
                      </h3>
                      <p className="text-sm text-purple-400 mb-2">{talent.title}</p>
                      <p className="text-sm text-gray-400 mb-3">{talent.user.email}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {talent.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs text-blue-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      {talent.portfolioUrl && (
                        <a
                          href={talent.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition"
                        >
                          View Portfolio
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedTalent(talent)}
                      className="ml-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition shadow-lg shadow-purple-500/25"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            {/* User Type Filter */}
            <div className="mb-6">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Users</option>
                <option value="talent">Talents</option>
                <option value="client">Clients</option>
                <option value="agency">Agencies</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{user.name || "N/A"}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            user.type === 'talent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            user.type === 'client' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {user.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                          {user.type === "talent" && user.profile?.verificationStatus
                            ? user.profile.verificationStatus
                            : "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {selectedTalent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-slate-900 border border-white/10 shadow-2xl">
              <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Review: {selectedTalent.firstName} {selectedTalent.lastName}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{selectedTalent.title}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Submitted Verification Requirements Section */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Submitted Verification Requirements
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Portfolio Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Portfolio</h4>
                      <div className="space-y-2">
                        {selectedTalent.portfolioUrl ? (
                          <div className="flex items-start">
                            <span className="text-xs text-gray-400 w-24 flex-shrink-0">URL:</span>
                            <a
                              href={selectedTalent.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-400 hover:text-purple-300 transition break-all"
                            >
                              {selectedTalent.portfolioUrl}
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No portfolio URL submitted</p>
                        )}
                        
                        {selectedTalent.portfolio && (
                          <div className="flex items-start">
                            <span className="text-xs text-gray-400 w-24 flex-shrink-0">Projects:</span>
                            <div className="text-sm text-gray-300 flex-1">
                              {typeof selectedTalent.portfolio === 'string' 
                                ? selectedTalent.portfolio 
                                : JSON.stringify(selectedTalent.portfolio, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Code Repository Information */}
                    {selectedTalent.verification && (
                      <>
                        <div className="border-t border-white/10 pt-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Code Repositories</h4>
                          <div className="space-y-2">
                            {selectedTalent.verification?.githubUsername && (
                              <div className="flex items-start">
                                <span className="text-xs text-gray-400 w-24 flex-shrink-0">GitHub:</span>
                                <a
                                  href={`https://github.com/${selectedTalent.verification.githubUsername}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                                >
                                  @{selectedTalent.verification.githubUsername}
                                </a>
                              </div>
                            )}
                            
                            {selectedTalent.verification?.gitlabUsername && (
                              <div className="flex items-start">
                                <span className="text-xs text-gray-400 w-24 flex-shrink-0">GitLab:</span>
                                <a
                                  href={`https://gitlab.com/${selectedTalent.verification.gitlabUsername}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                                >
                                  @{selectedTalent.verification.gitlabUsername}
                                </a>
                              </div>
                            )}
                            
                            {selectedTalent.verification?.codeRepositoryUrl && (
                              <div className="flex items-start">
                                <span className="text-xs text-gray-400 w-24 flex-shrink-0">Repository:</span>
                                <a
                                  href={selectedTalent.verification.codeRepositoryUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-purple-400 hover:text-purple-300 transition break-all"
                                >
                                  {selectedTalent.verification.codeRepositoryUrl}
                                </a>
                              </div>
                            )}
                            
                            {!selectedTalent.verification?.githubUsername && 
                             !selectedTalent.verification?.gitlabUsername && 
                             !selectedTalent.verification?.codeRepositoryUrl && (
                              <p className="text-sm text-gray-500 italic">No code repositories submitted</p>
                            )}
                          </div>
                        </div>

                        {/* LinkedIn Information */}
                        <div className="border-t border-white/10 pt-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Professional Profile</h4>
                          {selectedTalent.verification.linkedInUrl ? (
                            <div className="flex items-start">
                              <span className="text-xs text-gray-400 w-24 flex-shrink-0">LinkedIn:</span>
                              <a
                                href={selectedTalent.verification.linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-purple-400 hover:text-purple-300 transition break-all"
                              >
                                {selectedTalent.verification.linkedInUrl}
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No LinkedIn profile submitted</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Skills */}
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTalent.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs text-blue-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Scores Section */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Review & Scoring
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Portfolio Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={verificationForm.portfolioScore}
                        onChange={(e) =>
                          setVerificationForm({ ...verificationForm, portfolioScore: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter score"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Code Sample Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={verificationForm.codeSampleScore}
                        onChange={(e) =>
                          setVerificationForm({ ...verificationForm, codeSampleScore: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter score"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Overall Score (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={verificationForm.overallScore}
                        onChange={(e) =>
                          setVerificationForm({ ...verificationForm, overallScore: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter score"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio Notes</label>
                      <textarea
                        value={verificationForm.portfolioNotes}
                        onChange={(e) =>
                          setVerificationForm({ ...verificationForm, portfolioNotes: e.target.value })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Add notes about the portfolio..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rejection Reason (if rejecting)
                      </label>
                      <textarea
                        value={verificationForm.rejectionReason}
                        onChange={(e) =>
                          setVerificationForm({ ...verificationForm, rejectionReason: e.target.value })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Provide reason for rejection..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 p-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTalent(null)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyTalent("rejected")}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-lg shadow-red-500/25"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleVerifyTalent("approved")}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition shadow-lg shadow-green-500/25"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
