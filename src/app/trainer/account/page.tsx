"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface TrainerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string | null;
  specialization: string | null;
  bio: string | null;
  skills: string[];
  experience: string | null;
  certifications: string[];
  hourlyRate: string | null;
  website: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  title: string;
  specialization: string;
  bio: string;
  skills: string;
  experience: string;
  certifications: string;
  hourlyRate: string;
  website: string;
  location: string;
}

export default function TrainerAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    title: "",
    specialization: "",
    bio: "",
    skills: "",
    experience: "",
    certifications: "",
    hourlyRate: "",
    website: "",
    location: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/trainer/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json() as TrainerProfile;
      setProfile(data);
      setFormData({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        title: data.title ?? "",
        specialization: data.specialization ?? "",
        bio: data.bio ?? "",
        skills: data.skills?.join(", ") ?? "",
        experience: data.experience ?? "",
        certifications: data.certifications?.join(", ") ?? "",
        hourlyRate: data.hourlyRate ?? "",
        website: data.website ?? "",
        location: data.location ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

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

    void fetchProfile();
  }, [session, status, router, fetchProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/trainer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          title: formData.title || null,
          specialization: formData.specialization || null,
          bio: formData.bio || null,
          skills: formData.skills
            ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          experience: formData.experience || null,
          certifications: formData.certifications
            ? formData.certifications.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          hourlyRate: formData.hourlyRate || null,
          website: formData.website || null,
          location: formData.location || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Failed to update profile");
      }

      const updatedProfile = await response.json() as TrainerProfile;
      setProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded-lg w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "trainer") {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Profile
              </h1>
              <p className="text-gray-600">
                Update your trainer profile information
              </p>
            </div>
            <Link
              href="/trainer/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter your last name"
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., Senior Python Instructor"
                />
              </div>

              {/* Specialization */}
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., Web Development, Machine Learning"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., New York, USA"
                />
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="">Select experience level</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              {/* Hourly Rate */}
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (USD)
                </label>
                <input
                  type="text"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., 50"
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website / Portfolio
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                placeholder="Tell us about yourself, your teaching philosophy, and what makes you a great trainer..."
              />
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Skills & Certifications
            </h2>

            {/* Skills */}
            <div className="mb-6">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Enter skills separated by commas (e.g., Python, JavaScript, React)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple skills with commas
              </p>
            </div>

            {/* Certifications */}
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              <input
                type="text"
                id="certifications"
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Enter certifications separated by commas"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple certifications with commas
              </p>
            </div>
          </div>

          {/* Account Info (Read-only) */}
          {profile && (
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-gray-900 font-mono text-sm">{profile.userId}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="text-gray-900">
                    {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
