"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface TrainerProfile {
  id: string;
  userId: string;
  organizationName: string;
  organizationType: string | null;
  registrationNumber: string | null;
  contactPersonName: string;
  contactPersonRole: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  description: string | null;
  specializations: string[];
  trainingAreas: string[];
  accreditations: string[];
  website: string | null;
  location: string | null;
  foundedYear: string | null;
  organizationSize: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  organizationName: string;
  organizationType: string;
  registrationNumber: string;
  contactPersonName: string;
  contactPersonRole: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  specializations: string;
  trainingAreas: string;
  accreditations: string;
  website: string;
  location: string;
  foundedYear: string;
  organizationSize: string;
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
    organizationName: "",
    organizationType: "",
    registrationNumber: "",
    contactPersonName: "",
    contactPersonRole: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
    specializations: "",
    trainingAreas: "",
    accreditations: "",
    website: "",
    location: "",
    foundedYear: "",
    organizationSize: "",
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
        organizationName: data.organizationName ?? "",
        organizationType: data.organizationType ?? "",
        registrationNumber: data.registrationNumber ?? "",
        contactPersonName: data.contactPersonName ?? "",
        contactPersonRole: data.contactPersonRole ?? "",
        contactEmail: data.contactEmail ?? "",
        contactPhone: data.contactPhone ?? "",
        description: data.description ?? "",
        specializations: data.specializations?.join(", ") ?? "",
        trainingAreas: data.trainingAreas?.join(", ") ?? "",
        accreditations: data.accreditations?.join(", ") ?? "",
        website: data.website ?? "",
        location: data.location ?? "",
        foundedYear: data.foundedYear ?? "",
        organizationSize: data.organizationSize ?? "",
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
          organizationName: formData.organizationName,
          organizationType: formData.organizationType || null,
          registrationNumber: formData.registrationNumber || null,
          contactPersonName: formData.contactPersonName,
          contactPersonRole: formData.contactPersonRole || null,
          contactEmail: formData.contactEmail || null,
          contactPhone: formData.contactPhone || null,
          description: formData.description || null,
          specializations: formData.specializations
            ? formData.specializations.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          trainingAreas: formData.trainingAreas
            ? formData.trainingAreas.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          accreditations: formData.accreditations
            ? formData.accreditations.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          website: formData.website || null,
          location: formData.location || null,
          foundedYear: formData.foundedYear || null,
          organizationSize: formData.organizationSize || null,
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
                Edit Organization Profile
              </h1>
              <p className="text-gray-600">
                Update your organization or institution information
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
              Organization Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div className="md:col-span-2">
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization / Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., Tech Training Academy"
                />
              </div>

              {/* Organization Type */}
              <div>
                <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Type
                </label>
                <select
                  id="organizationType"
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="">Select type</option>
                  <option value="training_center">Training Center</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="university">University / College</option>
                  <option value="corporate_training">Corporate Training</option>
                  <option value="online_academy">Online Academy</option>
                  <option value="certification_body">Certification Body</option>
                  <option value="consulting_firm">Consulting Firm</option>
                  <option value="nonprofit">Non-profit Organization</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Organization Size */}
              <div>
                <label htmlFor="organizationSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Size
                </label>
                <select
                  id="organizationSize"
                  name="organizationSize"
                  value={formData.organizationSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration / License Number
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Official registration number (if applicable)"
                />
              </div>

              {/* Founded Year */}
              <div>
                <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Founded Year
                </label>
                <input
                  type="text"
                  id="foundedYear"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., 2015"
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

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="https://yourorganization.com"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                placeholder="Tell us about your organization, training programs, and expertise..."
              />
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Contact Person Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Person Name */}
              <div>
                <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactPersonName"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Full name of contact person"
                />
              </div>

              {/* Contact Person Role */}
              <div>
                <label htmlFor="contactPersonRole" className="block text-sm font-medium text-gray-700 mb-2">
                  Role / Position
                </label>
                <input
                  type="text"
                  id="contactPersonRole"
                  name="contactPersonRole"
                  value={formData.contactPersonRole}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., Director, Manager, Admin"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="contact@organization.com"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Specializations & Accreditations */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Specializations & Accreditations
            </h2>

            {/* Specializations */}
            <div className="mb-6">
              <label htmlFor="specializations" className="block text-sm font-medium text-gray-700 mb-2">
                Training Specializations
              </label>
              <input
                type="text"
                id="specializations"
                name="specializations"
                value={formData.specializations}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="e.g., Web Development, Data Science, Cloud Computing"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple specializations with commas
              </p>
            </div>

            {/* Training Areas */}
            <div className="mb-6">
              <label htmlFor="trainingAreas" className="block text-sm font-medium text-gray-700 mb-2">
                Training Areas / Technologies
              </label>
              <input
                type="text"
                id="trainingAreas"
                name="trainingAreas"
                value={formData.trainingAreas}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="e.g., React, Python, AWS, Machine Learning"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple areas with commas
              </p>
            </div>

            {/* Accreditations */}
            <div>
              <label htmlFor="accreditations" className="block text-sm font-medium text-gray-700 mb-2">
                Accreditations & Certifications
              </label>
              <input
                type="text"
                id="accreditations"
                name="accreditations"
                value={formData.accreditations}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="e.g., ISO 9001, TESDA Accredited, AWS Training Partner"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple accreditations with commas
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
