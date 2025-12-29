"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Edit2,
  Plus,
} from "lucide-react";
import Image from "next/image";

interface ProfileData {
  name: string;
  title: string;
  email: string;
  location: string;
  bio: string;
  skills: string[];
  experience: { company: string; role: string; duration: string }[];
  education: { school: string; degree: string; year: string }[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  profileStrength: number;
}

export default function TalentProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Sample profile data - replace with actual API call
  const profile: ProfileData = {
    name: session?.user?.name ?? "Alex Dev",
    title: "Full Stack Developer",
    email: session?.user?.email ?? "alex@example.com",
    location: "San Francisco, CA",
    bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.",
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker", "PostgreSQL", "Redis"],
    experience: [
      { company: "TechCorp Inc.", role: "Senior Developer", duration: "2022 - Present" },
      { company: "StartupXYZ", role: "Full Stack Developer", duration: "2020 - 2022" },
      { company: "WebAgency", role: "Junior Developer", duration: "2018 - 2020" },
    ],
    education: [
      { school: "University of California", degree: "B.S. Computer Science", year: "2018" },
    ],
    portfolioUrl: "https://alexdev.com",
    githubUrl: "https://github.com/alexdev",
    linkedinUrl: "https://linkedin.com/in/alexdev",
    profileStrength: 75,
  };

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
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return "bg-green-500";
    if (strength >= 60) return "bg-blue-500";
    if (strength >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return "Strong";
    if (strength >= 60) return "Intermediate";
    if (strength >= 40) return "Basic";
    return "Needs Work";
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600" />

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12">
              {/* Avatar and Name */}
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={profile.name}
                      width={96}
                      height={96}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600">{profile.title}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 md:mt-0 flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </div>

            {/* Bio */}
            <p className="mt-4 text-gray-600">{profile.bio}</p>

            {/* Profile Strength */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Strength</span>
                <span className="text-sm font-medium text-blue-600">
                  {getStrengthLabel(profile.profileStrength)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor(profile.profileStrength)} rounded-full transition-all`}
                  style={{ width: `${profile.profileStrength}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Complete your profile to increase visibility to employers
              </p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-gray-400" />
              Skills
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4 inline mr-1" />
              Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              Experience
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4 inline mr-1" />
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {profile.experience.map((exp, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{exp.role}</h3>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500 mt-1">{exp.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-400" />
              Education
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4 inline mr-1" />
              Add Education
            </button>
          </div>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                  <p className="text-xs text-gray-500 mt-1">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div id="certificates" className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-400" />
              Certificates
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4 inline mr-1" />
              Add Certificate
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No certificates yet</p>
            <p className="text-sm">Complete courses to earn certificates</p>
          </div>
        </div>
      </div>
    </main>
  );
}
