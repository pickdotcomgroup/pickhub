"use client";

import React, { useState } from "react";
import { Play, Clock, Star, Users } from "lucide-react";

const filterCategories = [
  "All",
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Data Science & Analytics",
  "Web3 & Blockchain",
  "Cybersecurity",
  "Cloud Engineering",
  "Prompt Engineering",
];

const categories = [
  {
    id: 1,
    title: "Artificial Intelligence",
    description: "Master the fundamentals of AI and build intelligent systems.",
    students: "12.5k",
    rating: 4.8,
    duration: "24h 30m",
    color: "bg-purple-100 text-purple-600",
    iconColor: "text-purple-600",
    category: "Artificial Intelligence",
    videoId: "ad79nYk2keg",
  },
  {
    id: 101,
    title: "Machine Learning",
    description:
      "Learn algorithms, statistical models, and predictive analytics.",
    students: "10.2k",
    rating: 4.7,
    duration: "18h 15m",
    color: "bg-indigo-100 text-indigo-600",
    iconColor: "text-indigo-600",
    category: "Machine Learning",
    videoId: "i_LwzRVP7bg",
  },
  {
    id: 102,
    title: "Deep Learning",
    description: "Dive into neural networks, computer vision, and advanced AI.",
    students: "8.5k",
    rating: 4.9,
    duration: "22h 45m",
    color: "bg-violet-100 text-violet-600",
    iconColor: "text-violet-600",
    category: "Deep Learning",
    videoId: "aircAruvnKk",
  },
  {
    id: 103,
    title: "Natural Language Processing",
    description: "Process and analyze human language data with Python.",
    students: "7.1k",
    rating: 4.6,
    duration: "16h 20m",
    color: "bg-fuchsia-100 text-fuchsia-600",
    iconColor: "text-fuchsia-600",
    category: "Natural Language Processing",
    videoId: "CMrHM8a3hqw",
  },
  {
    id: 2,
    title: "Data Science & Analytics",
    description:
      "Comprehensive curriculum for Data Science, Analytics, and Engineering.",
    students: "8.2k",
    rating: 4.7,
    duration: "32h 15m",
    color: "bg-blue-100 text-blue-600",
    iconColor: "text-blue-600",
    category: "Data Science & Analytics",
    videoId: "ua-CiDNNj30",
  },
  {
    id: 3,
    title: "Web3 & Blockchain",
    description:
      "Build decentralized applications and understand smart contracts.",
    students: "5.1k",
    rating: 4.9,
    duration: "18h 45m",
    color: "bg-orange-100 text-orange-600",
    iconColor: "text-orange-600",
    category: "Web3 & Blockchain",
    videoId: "M576WGiDBdQ",
  },
  {
    id: 4,
    title: "Cybersecurity",
    description:
      "Learn network security, ethical hacking, and risk management.",
    students: "9.3k",
    rating: 4.8,
    duration: "28h 00m",
    color: "bg-red-100 text-red-600",
    iconColor: "text-red-600",
    category: "Cybersecurity",
    videoId: "inWWhr5tnEA",
  },
  {
    id: 5,
    title: "Cloud Engineering",
    description: "Master AWS, Azure, and Google Cloud Platform infrastructure.",
    students: "15k",
    rating: 4.9,
    duration: "40h 20m",
    color: "bg-sky-100 text-sky-600",
    iconColor: "text-sky-600",
    category: "Cloud Engineering",
    videoId: "M988_fsOSWo",
  },
  {
    id: 6,
    title: "Prompt Engineering",
    description: "Master the art of communicating with AI models effectively.",
    students: "22k",
    rating: 4.6,
    duration: "12h 10m",
    color: "bg-green-100 text-green-600",
    iconColor: "text-green-600",
    category: "Prompt Engineering",
    videoId: "_ZvnD73m40o",
  },
];

export default function DeveloperPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const filteredCategories =
    selectedCategory === "All"
      ? categories
      : categories.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Training Categories
          </h1>
          <p className="mt-2 text-gray-600">
            Explore our top-rated courses and enhance your skills
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Video Placeholder / Thumbnail Area */}
              <div
                className={`relative h-48 w-full ${category.color.split(" ")[0]} flex items-center justify-center overflow-hidden`}
              >
                {playingVideo === category.id ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${category.videoId}?autoplay=1`}
                    title={category.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                  />
                ) : (
                  <>
                    {/* Thumbnail Image */}
                    <img
                      src={`https://img.youtube.com/vi/${category.videoId}/hqdefault.jpg`}
                      alt={category.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />

                    {/* Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingVideo(category.id);
                      }}
                      title={`Play ${category.title} preview`}
                      className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110"
                    >
                      <Play
                        className={`ml-1 h-6 w-6 ${category.iconColor}`}
                        fill="currentColor"
                      />
                    </button>

                    <div className="absolute right-3 bottom-3 z-10 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      Preview
                    </div>
                  </>
                )}
              </div>

              <div className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${category.color}`}
                  >
                    Course
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {category.rating}
                    </span>
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                  {category.title}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
