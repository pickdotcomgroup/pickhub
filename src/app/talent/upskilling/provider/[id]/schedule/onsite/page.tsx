"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Building,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  CreditCard,
  Shield,
  Zap,
  X,
  MapPin,
  Users,
} from "lucide-react";

// Contact method options
type ContactMethod = "email" | "phone" | "sms";

interface Session {
  id: string;
  date: string;
  time: string;
  location: string;
  address: string;
  spotsAvailable: number;
  totalSpots: number;
}

interface ScheduleFormData {
  selectedSession: string;
  phoneNumber: string;
  contactMethod: ContactMethod;
}

// Provider data (simplified - in production would fetch from API)
const providersData: Record<string, { name: string; location: string }> = {
  "1": { name: "Microsoft Learn", location: "Redmond, WA" },
  "2": { name: "Netflix Engineering", location: "Los Gatos, CA" },
  "3": { name: "CodeMaster Pro", location: "San Francisco, CA" },
  "4": { name: "Design Academy", location: "New York, NY" },
  "5": { name: "DataWizards", location: "Boston, MA" },
  "6": { name: "SecurNet Labs", location: "Washington, DC" },
};

// Mock available sessions
const availableSessions: Session[] = [
  {
    id: "s1",
    date: "2025-01-15",
    time: "09:00 AM - 12:00 PM",
    location: "Main Campus",
    address: "123 Tech Drive, Building A",
    spotsAvailable: 12,
    totalSpots: 20,
  },
  {
    id: "s2",
    date: "2025-01-15",
    time: "02:00 PM - 05:00 PM",
    location: "Main Campus",
    address: "123 Tech Drive, Building A",
    spotsAvailable: 8,
    totalSpots: 20,
  },
  {
    id: "s3",
    date: "2025-01-22",
    time: "09:00 AM - 12:00 PM",
    location: "Downtown Center",
    address: "456 Innovation Blvd, Suite 100",
    spotsAvailable: 15,
    totalSpots: 25,
  },
  {
    id: "s4",
    date: "2025-01-22",
    time: "02:00 PM - 05:00 PM",
    location: "Downtown Center",
    address: "456 Innovation Blvd, Suite 100",
    spotsAvailable: 3,
    totalSpots: 25,
  },
  {
    id: "s5",
    date: "2025-01-29",
    time: "10:00 AM - 01:00 PM",
    location: "Main Campus",
    address: "123 Tech Drive, Building A",
    spotsAvailable: 18,
    totalSpots: 20,
  },
  {
    id: "s6",
    date: "2025-02-05",
    time: "09:00 AM - 12:00 PM",
    location: "Conference Center",
    address: "789 Enterprise Way",
    spotsAvailable: 25,
    totalSpots: 30,
  },
];

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Group sessions by date
function groupSessionsByDate(sessions: Session[]) {
  const grouped: Record<string, Session[]> = {};
  sessions.forEach((session) => {
    const dateGroup = grouped[session.date] ??= [];
    dateGroup.push(session);
  });
  return grouped;
}

export default function OnsiteSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const providerId = params.id as string;
  const planId = searchParams.get("plan") ?? "";
  const planPrice = searchParams.get("price") ?? "0";
  const planName = decodeURIComponent(searchParams.get("name") ?? "");

  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    selectedSession: "",
    phoneNumber: "",
    contactMethod: "email",
  });
  const [errors, setErrors] = useState<Partial<ScheduleFormData>>({});

  const provider = providersData[providerId];
  const groupedSessions = groupSessionsByDate(availableSessions);
  const selectedSessionData = availableSessions.find((s) => s.id === formData.selectedSession);

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

    // Check verification
    const checkVerification = async () => {
      try {
        const response = await fetch("/api/verification/status");
        if (response.ok) {
          const data = (await response.json()) as { platformAccess?: boolean };
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

  const validateForm = () => {
    const newErrors: Partial<ScheduleFormData> = {};

    if (!formData.selectedSession) {
      newErrors.selectedSession = "Please select a session";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    // In production, this would process payment and create enrollment
    setShowConfirmation(false);
    router.push(`/talent/upskilling/provider/${providerId}?enrolled=success`);
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!provider || !planId) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900">Invalid booking request</h1>
          <Link href="/talent/upskilling" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/talent/upskilling/provider/${providerId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {provider.name}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Book Onsite Training</h1>
                  <p className="text-gray-500 text-sm">Select a workshop session to attend</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Session Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Available Sessions
                  </label>
                  <p className="text-gray-500 text-sm mb-4">
                    Choose a workshop date and time that works for you
                  </p>

                  {errors.selectedSession && (
                    <p className="text-red-500 text-sm mb-3">{errors.selectedSession}</p>
                  )}

                  <div className="space-y-6">
                    {Object.entries(groupedSessions).map(([date, sessions]) => (
                      <div key={date}>
                        <h4 className="font-medium text-gray-900 mb-3">{formatDate(date)}</h4>
                        <div className="space-y-3">
                          {sessions.map((sessionItem) => (
                            <button
                              key={sessionItem.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, selectedSession: sessionItem.id })}
                              disabled={sessionItem.spotsAvailable === 0}
                              className={`w-full text-left p-4 border rounded-lg transition ${
                                formData.selectedSession === sessionItem.id
                                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-100"
                                  : sessionItem.spotsAvailable === 0
                                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                  : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-900">{sessionItem.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">{sessionItem.location}</span>
                                  </div>
                                  <p className="text-gray-500 text-sm ml-6">{sessionItem.address}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                  {formData.selectedSession === sessionItem.id && (
                                    <CheckCircle className="w-5 h-5 text-amber-600 mb-2" />
                                  )}
                                  <div className={`flex items-center gap-1 text-sm ${
                                    sessionItem.spotsAvailable <= 5 ? "text-red-600" : "text-gray-500"
                                  }`}>
                                    <Users className="w-4 h-4" />
                                    {sessionItem.spotsAvailable === 0 ? (
                                      <span>Full</span>
                                    ) : (
                                      <span>{sessionItem.spotsAvailable} spots left</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Contact Details</h3>

                  {/* Phone Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.phoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Contact Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "email", label: "Email", icon: Mail },
                        { value: "phone", label: "Phone", icon: Phone },
                        { value: "sms", label: "SMS", icon: MessageSquare },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, contactMethod: option.value as ContactMethod })}
                          className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition ${
                            formData.contactMethod === option.value
                              ? "border-amber-500 bg-amber-50 text-amber-700"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Continue to Payment
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 pt-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Guaranteed
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-green-500" />
                    Confirmed Seat
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{provider.name}</p>
                    <p className="text-sm text-gray-500">Onsite Training</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                    {planName}
                  </span>
                </div>

                {selectedSessionData && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="font-medium text-gray-900 mb-1">Selected Session</p>
                    <p className="text-sm text-gray-600">{formatDate(selectedSessionData.date)}</p>
                    <p className="text-sm text-gray-600">{selectedSessionData.time}</p>
                    <p className="text-sm text-gray-500">{selectedSessionData.location}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>1 Month Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>In-person workshops</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Materials included</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${planPrice}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Platform fee</span>
                    <span className="text-gray-900">$0</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${planPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedSessionData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmation(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
                <p className="text-gray-500 mb-6">
                  You&apos;re about to book a seat at {provider.name}&apos;s {planName} workshop.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium">{planName}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{formatDate(selectedSessionData.date)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{selectedSessionData.time}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{selectedSessionData.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-lg">${planPrice}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
